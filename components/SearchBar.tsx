import {View, Image, TextInput} from 'react-native';;
import {icons} from "../constants/icons";

interface Props {
    placeholder: string;
    onPress?: () => void;
    value?: string;
    onChangeText?: (text: string) => void;
}

const SearchBar = ({onPress, placeholder, value, onChangeText}: Props) => {
    return (
        <View className="flex-row items-center bg-gray-200 dark:bg-gray-800 rounded-full px-5 py-4">
            <Image source={icons.search} className="size-5" resizeMode="contain" tintColor="#2FA3DC"/>
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