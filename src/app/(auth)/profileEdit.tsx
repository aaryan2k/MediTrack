import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { auth, db } from "../../../firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateEmail } from "firebase/auth";
import { useRouter } from "expo-router";

function ProfileEdit() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.replace("/login");
        return;
      }

      const docRef = doc(db, "Users", user.uid);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data();
        setEmail(data.email ?? "");
        setFirstName(data.firstName ?? "");
        setLastName(data.lastName ?? "");
      }

      setLoading(false);
    };

    fetchUser();
  }, [router]);

  const handleSave = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      if (email !== user.email || email.trim() !== "") {
        await updateEmail(user, email);
      }

      await updateDoc(doc(db, "Users", user.uid), {
        email,
        firstName,
        lastName,
      });

      Alert.alert("Success", "Profile updated successfully!");
      router.replace("/profile");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-300 dark:bg-gray-800">
        <ActivityIndicator size="large" />
      </View>
    );
  }

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
                    Edit Profile
                </Text>

                <Text className="text-black dark:text-gray-300 mb-2">Email</Text>
                <TextInput
                    className="border border-accent rounded-lg px-4 py-3 mb-4 text-black dark:text-white bg-gray-200 dark:bg-gray-800"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="example@gmail.com"
                />

                <Text className="text-black dark:text-gray-300 mb-2">First Name</Text>
                <TextInput
                    className="border border-accent rounded-lg px-4 py-3 mb-4 text-black dark:text-white bg-gray-200 dark:bg-gray-800"
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="John/Jane"
                />

                <Text className="text-black dark:text-gray-300 mb-2">Last Name</Text>
                <TextInput
                    className="border border-accent rounded-lg px-4 py-3 mb-4 text-black dark:text-white bg-gray-200 dark:bg-gray-800"
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Doe"
                />

                <TouchableOpacity
                    onPress={handleSave}
                    className="bg-accent rounded-lg py-4 items-center active:opacity-80"
                >
                    <Text className="text-black dark:text-white text-lg font-semibold">
                        {loading ? "Logging in..." : "Submit"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.replace("/profile")}
                    className="bg-accent rounded-lg py-4 items-center active:opacity-80 mt-4"
                >
                    <Text className="text-black dark:text-white text-lg font-semibold">Cancel</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default ProfileEdit;