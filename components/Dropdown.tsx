import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Pressable,
  Modal,
  useColorScheme,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface DropdownOption {
  label: string;
  value: string | number;
}

interface DropdownProps {
  options: DropdownOption[];
  selectedValues: Array<string | number>;
  onSave: (nextSelectedValues: Array<string | number>) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  loading: boolean;
  limit?: number;
}

export default function Dropdown({
  options,
  selectedValues,
  onSave,
  placeholder = "Select options",
  disabled = false,
  label,
  loading,
  limit = options.length,
}: DropdownProps) {
    const [open, setOpen] = useState(false);
    const [saved, setSaved] = useState<Array<string | number>>([]);
    const scheme = useColorScheme();
    const tint = scheme === "dark" ? "#fff" : "#000";

    const selectedOptions = options.filter((o) => selectedValues.includes(o.value));

    const toggle = () => {
        if (disabled) return;
        setOpen((prev) => !prev);
    };

    const handleSave = () => {
        onSave(saved);
        setOpen(false);
    };

    const onToggleItem = (option: DropdownOption) => {
        setSaved((prev) => {
            const isSelected = prev.includes(option.value);

            if (isSelected) {
                return prev.filter((v) => v !== option.value);
            }

            if (prev.length >= limit) {
                Alert.alert("Limit reached", "You cannot select any more options");
                return prev;
            }

            return [...prev, option.value];
        });
    };

    useEffect(() => {
        setSaved(selectedValues);
    }, [open, selectedValues])
    

  return (
    <View className="w-full">
      {label && (
        <Text className="mb-1.5 text-xs font-semibold tracking-widest uppercase text-zinc-600 dark:text-zinc-400">
          {label}
        </Text>
      )}

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={toggle}
        disabled={disabled}
        className={[
          "flex-row items-center justify-between px-4 py-3.5 rounded-2xl border",
          open
            ? "border-accent bg-zinc-200 dark:bg-zinc-900"
            : "border-zinc-300 bg-zinc-200 dark:border-zinc-700 dark:bg-zinc-900",
          disabled && "opacity-40",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <Text
          className={[
            "text-base font-medium",
            selectedOptions.length
              ? "text-zinc-700 dark:text-zinc-100"
              : "text-zinc-600 dark:text-zinc-500",
          ].join(" ")}
        >
          {selectedOptions.length
            ? selectedOptions.map((o) => o.label).join(", ")
            : placeholder}
        </Text>

        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color={scheme === "dark" ? "#f4f4f5" : "#3f3f46"}
        />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={toggle}>
        <Pressable className="flex-1 bg-white/40 dark:bg-black/40" onPress={toggle}>
          <View className="flex-1 justify-center px-6">
            <Pressable>
              <View className="overflow-hidden rounded-2xl border border-zinc-700 dark:border-zinc-500 bg-zinc-200 dark:bg-zinc-900 max-h-[90%]">
                <View className="pt-2 pr-2 pb-1 items-end">
                  <TouchableOpacity 
                    onPress={toggle}
                    className="h-10 w-10 bg-accent rounded-full items-center justify-center"
                    activeOpacity={0.7}
                  >
                    <Ionicons
                        name={"close"}
                        size={25}
                        color={tint}
                    />
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={options}
                  keyExtractor={(item) => String(item.value)}
                  renderItem={({ item }) => {
                    const isActive = saved.includes(item.value);

                    return (
                      <Pressable
                        onPress={() => onToggleItem(item)}
                        className={[
                          "flex-row items-center justify-between px-4 py-3.5",
                          isActive ? "bg-accent/80 border-y border-zinc-700" : "bg-transparent",
                        ].join(" ")}
                      >
                        <Text className="text-base font-bold text-black dark:text-white">
                          {item.label}
                        </Text>

                        {isActive && (
                          <Ionicons name="checkmark" size={18} color={tint} />
                        )}
                      </Pressable>
                    );
                  }}
                />

                <View className="border-t border-zinc-700 dark:border-zinc-500 p-4">
                  <TouchableOpacity
                    onPress={handleSave}
                    className={[
                        "rounded-xl py-3 items-center", 
                        loading ? "bg-gray-400" : "bg-accent",
                    ].join(" ")}
                    activeOpacity={0.8}
                    disabled={loading}
                  >
                    <Text className="text-black dark:text-white font-semibold">
                      Save
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}