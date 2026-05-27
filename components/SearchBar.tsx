import {View, TextInput} from 'react-native';
import { Ionicons } from "@expo/vector-icons";

interface Props {
    placeholder: string;
    onPress?: () => void;
    value?: string;
    onChangeText?: (text: string) => void;
}

const SearchBar = ({onPress, placeholder, value, onChangeText}: Props) => {
    return (
        <View className="flex-row items-center bg-gray-200 dark:bg-gray-800 rounded-full px-5 py-4">
            <Ionicons name="search" size={17} color="#2FA3DC"/>
            <TextInput
                onPress={onPress}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                placeholderTextColor="#2FA3DC"
                className="flex-1 ml-2 text-black dark:text-white"
            />
        </View>
    )
}

export default SearchBar;