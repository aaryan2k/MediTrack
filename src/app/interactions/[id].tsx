import { View, Text, useColorScheme, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { auth, db } from '../../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { fetchFDA } from '../../../services/api';

const regex = /<content styleCode=\"bold\">([^<]+)</g;


const Interactions = () => {
    const { id } = useLocalSearchParams();
    const scheme = useColorScheme();
    const tint = scheme === 'dark' ? '#fff' : '#000';
    const [name, setName] = useState("");
    const user = auth.currentUser;
    const [interactionData, setInteractionData] = useState<null | any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await fetchFDA({ query: String(id) });
                setInteractionData(data);
            } catch (e) {
                setError(e instanceof Error ? e : new Error("Failed to load"));
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const text = interactionData?.results?.[0]?.drug_interactions_table?.[0];
    const interactions = text ? [...text.matchAll(regex)].map(match => match[1].trim()) : [];
    interactions.shift(); // Remove the first match which is not an interaction
  
      useEffect(() => {
          const loadData = async () => {
              if (!user) {
                  router.push("/(auth)/login");
                  return;
              }
              const medRef = doc(db, "Users", user.uid, "medications", String(id));
              const snapshot = await getDoc(medRef);
              if (snapshot.exists()) {
                  const data = snapshot.data();
                  setName(data.name);
              } else {
                  console.log("No such document!");
              }
          } 
          
          loadData();
      }, [user])
  
      return (
          <View className="flex-1 bg-white dark:bg-black">
              <SafeAreaView className="flex-1">
                  <Text className="text-black dark:text-white align-top mt-12 ml-4 font-bold text-2xl">{name}</Text>
                  <View className="h-[2px] bg-gray-700 dark:bg-gray-300 mx-5 mb-5 mt-4" />
                  <View className="items-end mt-3 mr-7">
                      <TouchableOpacity 
                          onPress={() => router.push(`/reminder/${id}`)}
                          className="h-16 w-16 rounded-full border-2 border-black dark:border-white items-center justify-center"
                          activeOpacity={0.7}
                      >
                          <Ionicons
                              name={"alarm"}
                              size={25}
                              color={tint}
                          />
                      </TouchableOpacity>
                      <Text className="text-black dark:text-white mt-2 text-center font-bold text-sm">Set Reminder</Text>
                  </View>
                  <View className="flex-1 pb-80 items-center"
                      >
                      <View 
                          className="bg-gray-100 dark:bg-gray-800 p-6 border border-accent rounded-xl 
                          shadow w-[90%] min-h-96 gap-y-2 mt-10 justify-center flex flex-row">
                          <FlatList
                              data={interactions}
                              renderItem={({ item }) => 
                                  <Text className="text-black dark:text-white font-bold">{item}</Text>
                              }
                              keyExtractor={(item, index) => `${item}-${index}`}
                              className="px-5"
                              numColumns={1}
                              contentContainerStyle={{
                                  paddingBottom: 20,
                              }}
                              ItemSeparatorComponent={() => <View className="h-4" />}
                              ListHeaderComponent={
                                  <>
                                    {loading && (
                                        <ActivityIndicator size="large" className="my-3" />
                                    )}
                                    
                                    {error && (
                                        <Text className="text-red-500 px-5 my-3">
                                            Error: {error.message}
                                        </Text>
                                    )}

                                    {
                                    !loading && !error
                                    && (
                                      <View className="pb-4 mb-2 justify-center flex flex-row">
                                          <Ionicons 
                                              name="information-circle-outline"
                                              size={25}
                                              color="#ca8a04"
                                              className="mt-2"
                                          />
                                          <Text className="text-xl font-bold text-yellow-600 ml-2">Don't Use With These Drugs:</Text>
                                      </View>
                                    )}
                                  </>
                              }
                              ListEmptyComponent={
                                !loading && !error ? (
                                  <View className="mt-10 px-5 ">
                                      <Text className="text-center text-gray-500">
                                          {interactions?.length === 0 ? 'No drug interactions found, ask a doctor' : ''}
                                      </Text>
                                  </View>
                                ) : null
                              }
                          />
                      </View>
                  </View>
                  <TouchableOpacity
                      className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
                      onPress={() => router.push(`/meds/${id}`)}
                  >
                      <Ionicons
                          name="arrow-back"
                          className="mr-1 mt-0.5"
                          color={tint}
                          size={15}
                      />
                      <Text className="text-black dark:text-white font-semibold text-base">Go Back</Text>
                  </TouchableOpacity>
              </SafeAreaView>
          </View>
      )
  }

export default Interactions