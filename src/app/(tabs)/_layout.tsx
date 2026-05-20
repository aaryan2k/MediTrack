import {Image, Text, View} from 'react-native';
import React from 'react';
import {Tabs} from 'expo-router'
import {icons} from "../../../constants/icons";
import { useColorScheme } from "react-native";

function TabIcon({ focused, icon, title }: any) {
    const scheme = useColorScheme();
    const tint = scheme === 'dark' ? '#fff' : '#000';
    if (focused) {
        return (
            <View
                className="flex w-full flex-1 min-w-[112px] min-h-[120px] mt-6 justify-center items-center overflow-hidden dark:bg-gray-900 bg-gray-200 
                border border-accent"
            >
                <Image source={icon} tintColor={tint} className="size-5 mt-8" />
                <Text className="text-black dark:text-white text-base font-semibold mt-1">
                    {title}
                </Text>
            </View>
        );
    }

    return (
        <View className="size-full justify-center items-center mt-6">
            <Image source={icon} tintColor={tint} className="size-5" />
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
                    backgroundColor: scheme === 'dark' ? '#1F2937' : '#F3F4F6',
                    height: 85,
                    position: 'absolute',
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: scheme === 'dark' ? '#1F2937' : '#F3F4F6',
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
                        <TabIcon title="Home" icon={icons.home} focused={focused}/>
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
                        <TabIcon title="Search" icon={icons.search} focused={focused}/>
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
                        <TabIcon title="Saved" icon={icons.save} focused={focused}/>
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
                        <TabIcon title="Profile" icon={icons.person} focused={focused}/>
                    </>
                )
            }}
        />
    </Tabs>
  )
}

export default _Layout