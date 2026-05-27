import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import SearchBar from '../../../components/SearchBar';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Collapsible } from '../../../components/Collapsible';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../../../firebase/config';
import useFetch from '../../../services/useFetch';
import  { fetchRX } from '../../../services/api';


const Search = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [savedIds, setSavedIds] = useState<string[]>([]);
    const [user, setUser] = useState<any>(undefined);
    
      useEffect(() => {
        const unsub = onAuthStateChanged(auth, (firebaseUser) => {
          setUser(firebaseUser ?? null);
        });
        return unsub;
      }, []);

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

    const handleSave = (medicine: any) => {
        if (!savedIds.includes(medicine.rxcui)) {
            setSavedIds([...savedIds, medicine.rxcui]);
        } else {
            setSavedIds(savedIds.filter((id) => id !== medicine.rxcui));
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
                                    <Text className="text-xl text-white font-bold pb-4">
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
                                        {searchQuery.trim() ? 'No medications found' : 'Search for a medication'}
                                    </Text>
                                </View>
                            ) : null
                        }
                />
            </SafeAreaView>
        </View>
    )
}

export default Search;