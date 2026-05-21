import {View, Text, Image, useColorScheme} from 'react-native';
import React from 'react';
import {icons} from "../../../constants/icons";

const Saved = () => {
    const scheme = useColorScheme();
    const tint = scheme === 'dark' ? '#fff' : '#000';

    return (
        <View className="flex-1 bg-white dark:bg-black">
            <View className="flex justify-center items-center flex-1 flex-col gap-5">
                <Image
                    source={icons.save}
                    className="size-10"
                    tintColor={tint}
                />
                <Text className="dark:text-white text-black text-base">Saved</Text>
            </View>
        </View>
    )
}

export default Saved;