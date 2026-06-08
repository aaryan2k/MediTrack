import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useColorScheme,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { auth, db } from "../../../firebase/config";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Register() {
  const router = useRouter();
  const scheme = useColorScheme();
  const tint = scheme === 'dark' ? '#fff' : '#000';
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[A-Z])(?=.*[@#$%^&!]).{8,}$/;

    const isValidEmail = (email: string) => {
      return emailRegex.test(email);
    };

    const isValidPassword = (password: string) => {
      return passwordRegex.test(password);
    };

  const handleRegister = async () => {
    if (!fname || !email || !password) {
      Alert.alert("Missing fields", "Please fill out first name, email, and password.");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Invalid email", "Please enter a valid email address.");
      return;
    }

    if (!isValidPassword(password)) {
      Alert.alert("Invalid password",
         "Please enter a password 8 or more characters long with at least one uppercase letter and one special character (!, @, #, $, %, ^, &)."
      );
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      await setDoc(doc(db, "Users", user.uid), {
        email: user.email,
        firstName: fname.trim(),
        lastName: lname.trim(),
      });

      Alert.alert("Success", "Registered successfully.");
      router.push("../(tabs)");  
    } catch (error: any) {
      Alert.alert("Registration failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white dark:bg-black justify-center px-6"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "center", paddingHorizontal: 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="bg-gray-100 dark:bg-gray-800 p-6 border border-accent rounded-lg shadow">
          <Text className="text-4xl font-bold text-black dark:text-gray-100 mb-6">
            Register
          </Text>

          <Text className="text-black dark:text-gray-300 mb-2">First name</Text>
          <TextInput
            value={fname}
            onChangeText={setFname}
            placeholder="John/Jane"
            autoCapitalize="words"
            className="border border-accent rounded-lg px-4 py-3 mb-4 text-black dark:text-white bg-gray-200 dark:bg-gray-800"
          />

          <Text className="text-black dark:text-gray-300 mb-2">Last name</Text>
          <TextInput
            value={lname}
            onChangeText={setLname}
            placeholder="Doe"
            autoCapitalize="words"
            className="border border-accent rounded-lg px-4 py-3 mb-4 text-black dark:text-white bg-gray-200 dark:bg-gray-800"
          />

          <Text className="text-black dark:text-gray-300 mb-2">Email address</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="example@gmail.com"
            keyboardType="email-address"
            autoCapitalize="none"
            className="border border-accent rounded-lg px-4 py-3 mb-4 text-black dark:text-white bg-gray-200 dark:bg-gray-800"
          />
          <View>
            <Text className="text-black dark:text-gray-300 mb-2">Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password@123"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              className="border border-accent rounded-lg px-4 py-3 mb-6 text-black dark:text-white bg-gray-200 dark:bg-gray-800"
            />
            <TouchableOpacity
                className="absolute right-3 top-[2.7rem]"
                activeOpacity={0.5}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color={tint} />
              </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={handleRegister}
            className="bg-accent rounded-lg py-4 items-center active:opacity-80"
          >
            <Text className="text-white text-lg font-semibold">
              {loading ? "Creating Account..." : "Create Account"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/login")} className="mt-4">
            <Text className="text-black dark:text-gray-300 text-right">
              Already registered? <Text className="text-accent">Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}