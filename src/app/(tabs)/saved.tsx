import {View, Text, useColorScheme} from 'react-native';
import React from 'react';
import { Ionicons } from "@expo/vector-icons";

const Saved = () => {
    const scheme = useColorScheme();
    const tint = scheme === 'dark' ? '#fff' : '#000';

    return (
        <View className="flex-1 bg-white dark:bg-black">
            <View className="flex justify-center items-center flex-1 flex-col gap-5">
                <Ionicons
                    name="bookmark-outline"
                    size={40}
                    color={tint}
                />
                <Text className="dark:text-white text-black text-base">Saved</Text>
            </View>
        </View>
    )
}

export default Saved;