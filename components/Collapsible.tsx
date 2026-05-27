import { useState } from "react";
import { TouchableOpacity, View, Text, useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CollapsibleProps  {
    title: string;
    handleSave: () => void;
    saved: boolean;
}

export function Collapsible({ title, handleSave, saved }: CollapsibleProps) {
  const scheme = useColorScheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View className="w-full">
      <TouchableOpacity
        onPress={() => setIsOpen((value) => !value)}
        className="flex-row items-start gap-2"
      >
        <Ionicons
          name={isOpen ? "remove" : "add"}
          size={18}
          color={scheme === "light" ? "#000" : "#FFF"}
          className="mt-2"
        />
        <Text className="flex-1 text-lg font-semibold text-black dark:text-white">
          {title}
        </Text>
      </TouchableOpacity>

      {isOpen && (
        <View className="mt-2 ml-6">
          <View className="flex-row gap-2 mt-3 items-center">
            <TouchableOpacity 
                onPress={handleSave}
                className="h-10 w-10 rounded-full border-2 border-black dark:border-white items-center justify-center"
                activeOpacity={0.7}
            >
                <Ionicons
                    name={saved ? "bookmark" : "bookmark-outline"}
                    size={20}
                    color={saved ? "#2FA3DC" : (scheme === "light" ? "#000" : "#FFF")}
                />
            </TouchableOpacity>
            <Text className="text-black dark:text-white font-bold">
              {saved ? "Medication Saved!" : "Save Medication?"}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}