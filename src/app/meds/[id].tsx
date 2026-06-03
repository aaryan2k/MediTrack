import { View, Text, useColorScheme, TouchableOpacity } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";

const Details = () => {
  const { id } = useLocalSearchParams();
  const scheme = useColorScheme();
  const tint = scheme === 'dark' ? '#fff' : '#000';

    return (
        <View className="flex-1 bg-white dark:bg-black">
            <View className="flex justify-center items-center flex-1 flex-col gap-5">
                <Ionicons
                    name="pulse-outline"
                    size={40}
                    color={tint}
                />
                <Text className="dark:text-white text-black text-base">Details for {id}</Text>
            </View>
            <TouchableOpacity
                className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
                onPress={router.back}
            >
                <Ionicons
                    name="arrow-back"
                    className="mr-1 mt-0.5"
                    color={tint}
                    size={15}
                />
                <Text className="text-black dark:text-white font-semibold text-base">Go Back</Text>
            </TouchableOpacity>
        </View>
    )
}

export default Details