import { View } from 'react-native';
import SearchBar from '../../../components/SearchBar';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const Search = () => {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <View className="flex-1 items-center bg-white dark:bg-black">
            <SafeAreaView className="w-full" >
                <View className="my-5 pt-5">
                    <SearchBar
                        placeholder="Search medications..."
                        value={searchQuery}
                        onChangeText={(text: string) => setSearchQuery(text)}
                    />
                </View>
            </SafeAreaView>
        </View>
    )
}

export default Search;