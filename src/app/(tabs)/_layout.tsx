import {Text, View} from 'react-native';
import React from 'react';
import {Tabs} from 'expo-router'
import { useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";

function TabIcon({ focused, icon, title }: any) {
    const scheme = useColorScheme();
    const tint = scheme === 'dark' ? '#fff' : '#000';
    if (focused) {
        return (
            <View
                className="flex w-full flex-1 min-w-[112px] min-h-[120px] mt-6 justify-center items-center overflow-hidden dark:bg-zinc-800 bg-zinc-300 
                border border-accent"
            >
                <Ionicons name={icon} color={tint} size={20} className="mt-8" />
                <Text className="text-black dark:text-white text-base font-semibold mt-1">
                    {title}
                </Text>
            </View>
        );
    }

    return (
        <View className="size-full justify-center items-center mt-6">
            <Ionicons name={icon} color={tint} size={20} />
        </View>
    );
}
const _Layout = () => {
  const scheme = useColorScheme();
    
  return (
    <Tabs
        screenOptions={{
                tabBarShowLabel: false,
                tabBarItemStyle: {
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                tabBarStyle: {
                    backgroundColor: scheme === 'dark' ? '#18181b' : '#e4e4e7',
                    height: 85,
                    position: 'absolute',
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: scheme === 'dark' ? '#18181b' : '#e4e4e7',
                }
            }}
        >
        <Tabs.Screen 
            name="index"
            options={{ 
                title: "Home",
                headerShown: false,
                tabBarIcon: ({ focused }) => (
                    <>
                        <TabIcon title="Home" icon="home-outline" focused={focused}/>
                    </>
                ) 
            }}
        />
        <Tabs.Screen 
            name="search"
            options={{ 
                title: "Search",
                headerShown: false,
                tabBarIcon: ({ focused }) => (
                    <>
                        <TabIcon title="Search" icon="search-outline" focused={focused}/>
                    </>
                )
            }}
        />
        <Tabs.Screen 
            name="saved"
            options={{ 
                title: "Saved",
                headerShown: false,
                tabBarIcon: ({ focused }) => (
                    <>
                        <TabIcon title="Saved" icon="bookmark-outline" focused={focused}/>
                    </>
                )
            }}
        />
        <Tabs.Screen 
            name="profile"
            options={{ 
                title: "Profile",
                headerShown: false,
                tabBarIcon: ({ focused }) => (
                    <>
                        <TabIcon title="Profile" icon="person-outline" focused={focused}/>
                    </>
                )
            }}
        />
    </Tabs>
  )
}

export default _Layout