import { View, Text, Image, TouchableOpacity, Alert, useColorScheme } from 'react-native';
import React from 'react';
import {icons} from "../../../constants/icons";
import { router } from 'expo-router';
import { auth } from '../../../firebase/config';

const Profile = () => {
    const scheme = useColorScheme();
    const tint = scheme === 'dark' ? '#fff' : '#000';
    const handleGoBack = async () => {
        try {
            await auth.signOut();
            router.push("/login");
        } catch (error) {
            console.error("Error signing out:", error);
            Alert.alert("Error", "Failed to sign out.");
        }
        
    }

    return (
        <View className="flex-1 justify-center items-center bg-white dark:bg-black">
            <View className="flex justify-center items-center flex-1 flex-col gap-5">
                <Image
                    source={icons.person}
                    className="size-10"
                    tintColor={tint}
                />
                <Text className="dark:text-white text-black text-base">Profile</Text>
                <TouchableOpacity
                className="px-5 mx-10 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
                onPress={handleGoBack}
            >
                <Image
                    source={icons.arrow}
                    className="size-5 mr-1 mt-0.5 rotate-180"
                    tintColor={tint}
                />
                <Text className="dark:text-white text-black font-semibold text-base">Sign Out</Text>
            </TouchableOpacity>
            </View>
        </View>
    )
}

export default Profile;