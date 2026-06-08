import { View, Text, useColorScheme, TouchableOpacity, ScrollView } from 'react-native'
import { Link, router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from 'react';
import { auth, db } from '../../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { SafeAreaView } from 'react-native-safe-area-context';

const Details = () => {
    const { id } = useLocalSearchParams();
    const scheme = useColorScheme();
    const tint = scheme === 'dark' ? '#fff' : '#000';
    const [name, setName] = useState("");
    const user = auth.currentUser;

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
                <Text className="text-black dark:text-white align-top mt-12 ml-4 font-bold text-3xl">{name}</Text>
                <View className="h-[2px] bg-gray-700 dark:bg-gray-300 mx-5 mb-5 mt-4" />
                <ScrollView
                    contentContainerStyle={{ 
                        paddingBottom: 80,
                        flexGrow: 1,
                    }}
                >
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
                </ScrollView>
                <TouchableOpacity
                    className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
                    onPress={() => router.push("/(tabs)/saved")}
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

export default Details