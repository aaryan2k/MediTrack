import { View, Text, useColorScheme, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';
import { auth, db } from '../../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { getDrugInfo } from '../../../services/drugInfo';
import SourceModal from '../../../components/SourceModal';


const Interactions = () => {
    const { id } = useLocalSearchParams();
    const scheme = useColorScheme();
    const tint = scheme === 'dark' ? '#fff' : '#000';
    const [name, setName] = useState("");
    const user = auth.currentUser;
    const [interactionData, setInteractionData] = useState<null | any>(null);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const loadingRef = useRef(false);

    useEffect(() => {
        const load = async () => {
            if (loadingRef.current || !id || !name) return;

            try {
                loadingRef.current = true;
                setLoading(true);

                const data = await getDrugInfo(id, name);
                setInteractionData(data);
            } catch (e) {
                setError(e instanceof Error ? e : new Error("Failed to load"));
            } finally {
                loadingRef.current = false;
                setLoading(false);
            }
        };

        load();
    }, [id, name]);
    
    const interactions = interactionData?.interactions ?? [];
    const interactionSources = interactionData?.interactionSources ?? [];


    const toggle = () => {
        setOpen((prev) => !prev);
    };
  
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
    }, [user, id]);
  
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
                                      <View className="mb-2 flex-row items-center justify-between gap-3 pb-4">
                                            <View className="flex-1 flex-row items-center">
                                                <Ionicons
                                                    name="warning-outline"
                                                    size={25}
                                                    color="#D40000"
                                                />

                                                <Text className="ml-2 flex-1 shrink text-2xl font-bold text-warning">
                                                    Avoid Taking With
                                                </Text>
                                            </View>

                                            <TouchableOpacity
                                                onPress={() => setOpen((previous) => !previous)}
                                                className="shrink-0 flex-row items-center rounded-lg bg-accent px-3 py-2"
                                                activeOpacity={0.7}
                                            >
                                                <Ionicons
                                                    name="link-outline"
                                                    size={17}
                                                    color={tint}
                                                />

                                                <Text
                                                    className="ml-1.5 font-bold text-black dark:text-white"
                                                    numberOfLines={1}
                                                    >
                                                    Sources
                                                </Text>
                                            </TouchableOpacity>
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
              <SourceModal
                    options={interactionSources}
                    open={open}
                    toggle={toggle}
                />
          </View>
      )
  }

export default Interactions