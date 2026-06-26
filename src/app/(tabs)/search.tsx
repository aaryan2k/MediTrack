import { View, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import SearchBar from '../../../components/SearchBar';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Collapsible } from '../../../components/Collapsible';
import { auth, db } from '../../../firebase/config';
import useFetch from '../../../services/useFetch';
import  { fetchRX } from '../../../services/api';
import { getDocs, collection, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { router } from 'expo-router';


export default function Search() {
    const [searchQuery, setSearchQuery] = useState("");
    const [savedIds, setSavedIds] = useState<string[]>([]);
    const user = auth.currentUser;

    const { data: medicationData,
        loading: medicationsLoading,
        error: medicationsError,
        refetch: loadMedications,
        reset
        } = useFetch(() => fetchRX({
            query: searchQuery
    }), false);

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (searchQuery.trim()) {
                await loadMedications()
            } else {
                reset()
            }
        }, 500)

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const medications = medicationData?.drugGroup?.conceptGroup?.flatMap( 
            (group: any) => group?.conceptProperties ?? []
        ) ?? [];

    useEffect(() => {
        const fetchSavedMedications = async () => {
            if (!user) return;

            try {
                const medsRef = collection(db, "Users", user.uid, "medications");
                const snapshot = await getDocs(medsRef);

                const ids = snapshot.docs.map((doc) => doc.id); 
                setSavedIds(ids);
            } catch (error) {
                console.error("Error fetching medications:", error);
            }
        };

        fetchSavedMedications();
    }, [user]);

    const handleSave = async (medicine: any) => {
        if (!user) {
            router.push("/(auth)/login");
            return;
        }

        const medRef = doc(db, "Users", user.uid, "medications", medicine.rxcui);
        try {
            if (savedIds.length >= 15) {
                Alert.alert("Limit reached", "You can only save up to 15 medications.");
                return;
            } else if (savedIds.includes(medicine.rxcui)) {
                await deleteDoc(medRef);
                setSavedIds((prev) => prev.filter((id) => id !== medicine.rxcui));
            } else {
                await setDoc(medRef, {
                    name: medicine.synonym || medicine.name,
                    rxnormId: medicine.rxcui,
                });
            setSavedIds((prev) => [...prev, medicine.rxcui]);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to save medication. Please try again.");
        }
    }

    return (
        <View className="flex-1 bg-white dark:bg-black">
            <SafeAreaView className="flex-1">
                <FlatList
                        data={medications}
                        renderItem={({ item }) => 
                            <Collapsible
                                title={item.synonym || item.name} 
                                handleSave={() => handleSave(item)}
                                saved={savedIds.includes(item.rxcui)} 
                            />
                        }
                        keyExtractor={(item) => item.rxcui}
                        className="px-5"
                        numColumns={1}
                        contentContainerStyle={{
                            paddingBottom: 100
                        }}
                        ItemSeparatorComponent={() => <View className="h-4" />}
                        ListHeaderComponent={
                            <>
                                <View className="my-5 pt-5">
                                    <SearchBar
                                        placeholder="Search medications..."
                                        value={searchQuery}
                                        onChangeText={(text: string) => setSearchQuery(text)}
                                    />
                                </View>

                                {medicationsLoading && (
                                    <ActivityIndicator size="large" className="my-3" />
                                )}

                                {medicationsError && (
                                    <Text className="text-red-500 px-5 my-3">
                                        Error: {medicationsError.message}
                                    </Text>
                                )}

                                {
                                    !medicationsLoading && !medicationsError && searchQuery.trim()
                                    && medications.length > 0 && (
                                    <Text className="text-xl text-black dark:text-white font-bold pb-4">
                                        Search Results for {''}
                                        <Text className="text-accent uppercase">{searchQuery}</Text>
                                    </Text>
                                )}
                            </>
                        }
                        ListEmptyComponent={
                            !medicationsLoading && !medicationsError ? (
                                <View className="mt-10 px-5 ">
                                    <Text className="text-center text-gray-500">
                                        {searchQuery.trim() ? 'No medications found' : ''}
                                    </Text>
                                </View>
                            ) : null
                        }
                />
            </SafeAreaView>
        </View>
    )
}