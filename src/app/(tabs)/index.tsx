import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../firebase/config";
import { doc, getDoc } from 'firebase/firestore';
import { ActivityIndicator, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const [user, setUser] = useState<any>(undefined);
  const [fname, setFname] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ?? null);
    });
    return unsub;
  }, []);


  useEffect(() => {
    const loadUser = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, "Users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFname(data.firstName || "");
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    loadUser();
  }, [user]);

  if (user === undefined) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  const normalizeName = (name: string) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }

  return (
     <View className="flex-1 bg-white dark:bg-black">
        <SafeAreaView className="flex-1">
            <Text className="text-black dark:text-white align-top mt-2 ml-4 font-bold text-4xl">Hello, {normalizeName(fname)}!</Text>
            <View className="h-[2px] bg-gray-700 dark:bg-gray-300 mx-5 mb-5 mt-2" />
            <View className="items-center flex-1 mt-50 py-10">
              <View className="dark:bg-white bg-black rounded-lg h-60 w-[70%] items-center border-accent border-4">
                <Text className="text-3xl text-white dark:text-black font-bold mt-5">Next Dose In: </Text>
                <Text className="text-2xl text-white dark:text-black font-bold mt-5 text-center">0 days 10 hours 2 minutes</Text>
                <Text className="text-2xl text-accent font-bold mt-5 text-center">Ibuprofen</Text>
              </View>
            </View>
        </SafeAreaView>
    </View>
  )
}