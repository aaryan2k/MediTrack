import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, useColorScheme } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firebase/config";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Login() {
  const router = useRouter();
  const scheme = useColorScheme();
  const tint = scheme === 'dark' ? '#fff' : '#000';
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push("../(tabs)");
    } catch (error: any) {
      Alert.alert("Login failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
     <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-white dark:bg-black justify-center px-6"
        >
        <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24 }}
            keyboardShouldPersistTaps="handled"
        >
        <View className="bg-gray-100 dark:bg-gray-800 p-6 border border-accent rounded-lg shadow">
            <Text className="text-4xl font-bold text-black dark:text-gray-100 mb-6">
            Login
            </Text>

            <Text className="text-black dark:text-gray-300 mb-2">Email address</Text>
            <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="example@gmail.com"
            keyboardType="email-address"
            autoCapitalize="none"
            className="border border-accent rounded-lg px-4 py-3 mb-4 text-black dark:text-white bg-gray-200 dark:bg-gray-800"
            />

            <Text className="text-black dark:text-gray-300 mb-2">Password</Text>
            <View>
              <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password@123"
              secureTextEntry={!showPassword}
              className="border border-accent rounded-lg px-4 py-3 mb-6 text-black dark:text-white bg-gray-200 dark:bg-gray-800"
              />
              <TouchableOpacity
                className="absolute right-3 top-3"
                activeOpacity={0.5}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color={tint} />
              </TouchableOpacity>
            </View>
              <TouchableOpacity
                  onPress={handleLogin}
                  className="bg-accent rounded-lg py-4 items-center active:opacity-80"
              >
                <Text className="text-black dark:text-white text-lg font-semibold">
                    {loading ? "Logging in..." : "Submit"}
                </Text>
              </TouchableOpacity>


            <TouchableOpacity 
                onPress={() => router.push("/register")} 
                className="mt-4">
              <Text className="text-black dark:text-white text-right">
                  New user? <Text className="text-accent">Register Here</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
    </KeyboardAvoidingView>
  );
}