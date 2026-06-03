import { View, Text, useColorScheme, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth, db } from '../../../firebase/config';
import { deleteUser } from "firebase/auth";
import { doc, deleteDoc, collection, writeBatch, getDocs } from 'firebase/firestore';

export default function Settings() {
  const router = useRouter();
  const scheme = useColorScheme();
  const tint = scheme === 'dark' ? '#fff' : '#000';

  const handleSignOut= async () => {
     Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await auth.signOut();
              router.push("/login");
            } catch (error) {
              console.error("Error signing out:", error);
              Alert.alert("Error", "Failed to sign out.");
            }  
          }
        }
      ]
    );
  }

  const deleteAccount = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "Users", user.uid);
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(userRef);
              await deleteUser(user);
              router.push("/login");
            } catch (error) {
              console.error("Error deleting user:", error);
              Alert.alert("Error", "Failed to delete account.");
            }
          }
        }
      ]
    );
  };


  const resetMedications = async () => {
    const user = auth.currentUser;
    if (!user) return;
    
    Alert.alert(
      "Reset Medications",
      "Are you sure you want to reset your medications? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              const medsRef = collection(db, "Users", user.uid, "medications");
              const snapshot = await getDocs(medsRef);
              const batch = writeBatch(db);

              snapshot.docs.forEach((medDoc) => {
                batch.delete(medDoc.ref);
              });
              await batch.commit();

              Alert.alert("Success", "Medications have been reset.");
            } catch (error) {
              console.error("Error resetting medications:", error);
              Alert.alert("Error", "Failed to reset medications.");
            }
          }
        }
      ]
    );
  }

  return (
    <View className="bg-white dark:bg-black flex-1">
      <Text className="text-black dark:text-white align-top mt-12 ml-4 font-bold text-4xl">Settings</Text>
      <View className="h-[2px] bg-gray-700 dark:bg-gray-300 mx-5 mb-5 mt-2" />
      <ScrollView
        contentContainerStyle={{ 
          paddingBottom: 80,
          flexGrow: 1,
          alignItems: "center",
          gap: 16
        }}
      >
          <TouchableOpacity
            className="bg-accent items-center justify-center rounded-xl py-3.5 flex 
            flex-row z-50 w-[90%] h-32 border border-black dark:border-white shadow-sm dark:shadow-white"
            onPress={() => router.push("../profileEdit")}
          >
            <Ionicons
                name="create-outline"
                className="mr-1 mt-0.5"
                color={tint}
                size={25}
            />
            <Text className="dark:text-white text-black font-semibold text-xl">Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-accent items-center justify-center rounded-xl py-3.5 flex 
            flex-row z-50 w-[90%] h-32 border border-black dark:border-white shadow-sm dark:shadow-white"
            onPress={resetMedications}
          >
            <Ionicons
                name="refresh"
                className="mr-1 mt-0.5"
                color={tint}
                size={25}
            />
            <Text className="dark:text-white text-black font-semibold text-xl">Reset Medications</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-accent items-center justify-center rounded-xl py-3.5 flex 
            flex-row z-50 w-[90%] h-32 border border-black dark:border-white shadow-sm dark:shadow-white"
            onPress={handleSignOut}
          >
            <Ionicons
                name="log-out-outline"
                className="mr-1 mt-0.5"
                color={tint}
                size={25}
            />
            <Text className="dark:text-white text-black font-semibold text-xl">Sign Out</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-warning items-center justify-center rounded-xl py-3.5 flex 
            flex-row z-50 w-[90%] h-32 border border-black dark:border-white shadow-sm dark:shadow-white"
            onPress={deleteAccount}
          >
            <Ionicons
                name="trash-outline"
                className="mr-1 mt-0.5"
                color={tint}
                size={25}
            />
            <Text className="dark:text-white text-black font-semibold text-xl">Delete Account</Text>
          </TouchableOpacity>
      </ScrollView>
        <TouchableOpacity
            className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
            onPress={() => router.push("/profile")}
          >
            <Ionicons
              name="arrow-back"
              className="mr-1 mt-0.5"
              color={tint}
              size={15}
            />
            <Text className="text-black dark:text-white font-semibold text-base">Go Back</Text>
        </TouchableOpacity>
      </View>
  )
}