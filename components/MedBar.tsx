import { View, Text, TouchableOpacity, useColorScheme } from 'react-native'
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";

interface MedBarProps {
    id: string;
    name: string;
}

const MedBar = ({ id, name }: MedBarProps) => {
  const scheme = useColorScheme();
  const tint = scheme === "dark" ? "#fff" : "#000";

  return (
    <Link href={`/meds/${id}`} asChild>
      <TouchableOpacity className="items-center">
        <View className="bg-gray-100 dark:bg-gray-800 w-[90%] min-h-16 border border-accent rounded-lg shadow flex-row items-center px-3 py-3">
          <Ionicons
            name="medkit-outline"
            color={tint}
            size={20}
          />
          <Text className="ml-2 text-lg font-bold text-black dark:text-white">
            {name}
          </Text>
        </View>
      </TouchableOpacity>
    </Link>
  )
}

export default MedBar