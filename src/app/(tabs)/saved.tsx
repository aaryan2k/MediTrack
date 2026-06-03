import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MedBar from '../../../components/MedBar';
import { useState, useEffect } from 'react';
import { auth, db } from '../../../firebase/config';
import { getDocs, collection } from 'firebase/firestore';

interface Medication {
    id: string;
    name: string;
}


const Saved = () => {
    const [medications, setMedications] = useState<Medication[]>([]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const user = auth.currentUser;

    useEffect(() => {
        const fetchMedications = async () => {
            try {
                if (!user) return;

                setLoading(true);
                const medsRef = collection(db, "Users", user.uid, "medications");
                const snapshot = await getDocs(medsRef);

                const meds = snapshot.docs.map((medDoc) => {
                    const data = medDoc.data();
                    return {
                        id: data.rxnormId,
                        name: data.name,
                    };
                });

                setMedications(meds);
            } catch (error) {
                console.error("Error fetching medications:", error);
                setErrorMessage(error instanceof Error ? error.message : String(error));
            } finally {
                setLoading(false);
            }
        }

        fetchMedications();
    }, [user]);

    return (
        <View className="flex-1 bg-white dark:bg-black">
            <SafeAreaView className="flex-1">
                <FlatList
                        data={medications}
                        renderItem={({ item }) => 
                            <MedBar
                                id={item.id}
                                name={item.name}
                            />
                        }
                        keyExtractor={(item) => item.id}
                        className="px-5"
                        numColumns={1}
                        contentContainerStyle={{
                            paddingBottom: 100,
                            paddingTop: 30
                        }}
                        ItemSeparatorComponent={() => <View className="h-4" />}
                        ListHeaderComponent={
                            <>

                                {loading && (
                                    <ActivityIndicator size="large" className="my-3" />
                                )}

                                {errorMessage && (
                                    <Text className="text-red-500 px-5 my-3">
                                        Error: {errorMessage}   
                                    </Text>
                                )}

                                {
                                    !loading && !errorMessage
                                    && medications.length > 0 && (
                                    <Text className="text-2xl text-white font-bold pb-4 mb-2">
                                        My Medications:
                                    </Text>
                                )}

                            </>
                        }
                        ListEmptyComponent={
                            !loading && !errorMessage ? (
                                <View className="mt-10 px-5 ">
                                    <Text className="text-center text-gray-500">
                                        {medications.length === 0 ? 'No medications found' : ''}
                                    </Text>
                                </View>
                            ) : null
                        }
                />
            </SafeAreaView>
        </View>
    )
}

export default Saved;