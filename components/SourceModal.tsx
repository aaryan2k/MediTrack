import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Pressable,
  Modal,
  useColorScheme,
  Alert, 
  Linking
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SourceModalOption {
    title: string;
    url: string;
}

interface SourceModalProps {
    options: SourceModalOption[];
    toggle: () => void;
    open: boolean;
}

export default function SourceModal({
  options,
  toggle,
  open
}: SourceModalProps) {
    const scheme = useColorScheme();
    const tint = scheme === "dark" ? "#fff" : "#000";

    const openSource = async (url: string) => {
        try {
            const supported = await Linking.canOpenURL(url);

            if (!supported) {
                Alert.alert("Unable to open link", "This source URL is not valid.");
                return;
            }

            await Linking.openURL(url);
        } catch (error) {
            console.error("Error opening source URL:", error);
            Alert.alert("Unable to open link", "Please try again.");
        }
    };

    return (
        <Modal
            visible={open}
            transparent
            animationType="fade"
            onRequestClose={toggle}
            >
            <Pressable
                className="flex-1 bg-white/40 dark:bg-black/40"
                onPress={toggle}
            >
                <View className="flex-1 justify-center px-6">
                {/* Stops presses inside the modal from closing it */}
                <Pressable onPress={(event) => event.stopPropagation()}>
                    <View className="max-h-[90%] min-h-[320px] overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-200 dark:border-zinc-500 dark:bg-zinc-900">
                    <View className="flex-row items-center justify-between border-b border-zinc-400 px-4 py-3 dark:border-zinc-700">
                        <Text className="text-xl font-bold text-black dark:text-white">
                        Sources
                        </Text>

                        <TouchableOpacity
                            onPress={toggle}
                            className="h-10 w-10 items-center justify-center rounded-full bg-accent"
                            activeOpacity={0.7}
                            accessibilityRole="button"
                            accessibilityLabel="Close sources"
                        >
                        <Ionicons name="close" size={25} color={tint} />
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={options}
                        keyExtractor={(item, index) => `${item.url}-${index}`}
                        contentContainerStyle={{
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            gap: 12,
                        }}

                        ListEmptyComponent={
                        <Text className="py-8 text-center text-base text-zinc-600 dark:text-zinc-400">
                            No sources are available.
                        </Text>
                        }

                        renderItem={({ item }) => (
                        <Pressable
                            onPress={() => openSource(item.url)}
                            className="rounded-xl border border-zinc-400 bg-white px-4 py-4 dark:border-zinc-700 dark:bg-zinc-800"
                            accessibilityRole="link"
                            accessibilityLabel={`Open source: ${item.title}`}
                        >
                            <View className="flex-row items-start justify-between gap-3">
                                <View className="flex-1">
                                    <Text
                                        className="text-sm text-accent underline"
                                        numberOfLines={2}
                                    >
                                        {item.url}
                                    </Text>

                                    <Text className="mt-2 text-base font-bold text-black dark:text-white">
                                        {item.title}
                                    </Text>
                                </View>

                                <Ionicons
                                    name="open-outline"
                                    size={20}
                                    color="#2FA3DC"
                                />
                            </View>
                        </Pressable>
                        )}
                    />
                    </View>
                </Pressable>
                </View>
            </Pressable>
        </Modal>
    );
}