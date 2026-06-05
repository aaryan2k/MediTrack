import { View, Text, TouchableOpacity, useColorScheme, ScrollView } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth, db } from '../../../firebase/config';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';


export default function Profile() {
    const router = useRouter();
    const scheme = useColorScheme();
    const tint = scheme === 'dark' ? '#fff' : '#000';
    const [fname, setFname] = useState("");
    const [lname, setLname] = useState("");
    const [email, setEmail] = useState("");

    const user = auth.currentUser;
    
    useEffect(() => {
        const loadUser = async () => {
            if (!user) return;
            const userRef = doc(db, "Users", user.uid); 
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setFname(data.firstName || "");
                setLname(data.lastName || "");
                setEmail(data.email || "");
            } else {
                console.log("No such document!");
            }
        }

        loadUser();
    }, [user])


    return (
        <View className="flex-1 bg-white dark:bg-black">
            <View className="flex-1">
                <View className="w-full h-28 bg-accent">
                    <TouchableOpacity onPress={() => router.push("../settings")}>
                        <Ionicons
                            name="settings-outline"
                            size={25}
                            color={tint}
                            className="absolute right-5 top-5 mt-12"
                        />
                    </TouchableOpacity>
                </View>
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, alignItems: "center", paddingHorizontal: 12 }}
                >
                    <View 
                        className="bg-gray-100 dark:bg-gray-800 p-6 border border-accent rounded-xl 
                        shadow w-[90%] h-40 mt-16 gap-y-2 items-center justify-center">
                        <Text className="text-2xl font-bold text-black dark:text-white">Name: {fname} {lname}</Text>
                        <Text className="text-gray-600 dark:text-gray-300 mt-2">Email: {email}</Text>
                    </View>
                </ScrollView>
            </View>
        </View>
    )
}