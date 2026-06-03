import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../firebase/config";
import { doc, getDoc } from 'firebase/firestore';
import { ActivityIndicator, View, Text, TouchableOpacity, useColorScheme, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function Index() {
  const [user, setUser] = useState<any>(undefined);
  const [fname, setFname] = useState("");
  const [taken, setTaken] = useState(false);
  const scheme = useColorScheme();
  const tint = scheme === 'dark' ? '#fff' : '#000';

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

  const text = "Cymbalta 20 MG Delayed Release Oral Capsule";

  const doNothing = () => {
    if (taken) return;
    setTaken(true);
    setTimeout(() => setTaken(false), 2000);
  };

  return (
     <View className="flex-1 bg-white dark:bg-black">
        <SafeAreaView className="flex-1">
            <Text className="text-black dark:text-white align-top mt-2 ml-4 font-bold text-4xl">Hello, {normalizeName(fname)}!</Text>
            <View className="h-[2px] bg-gray-700 dark:bg-gray-300 mx-5 mb-5 mt-2" />
              <View className="items-center mt-5 py-10">
                <View className="bg-gray-100 dark:bg-gray-800 rounded-lg min-h-72 w-[80%] 
                items-center border-black dark:border-white border-2 shadow-sm dark:shadow-white">
                  <Text className="text-3xl text-black dark:text-white font-bold mt-5">Next Dose In: </Text>
                  <Text className="text-2xl text-black dark:text-white font-bold mt-5 text-center">0 days 10 hours 2 minutes</Text>
                  <Text 
                    className="text-2xl text-accent font-bold mt-5 text-center px-2"
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                    >
                      {text}
                    </Text>
                </View>
              </View>
              <View className="items-center">
                {taken ? (
                  <TouchableOpacity
                    className="bg-gray-400 items-center justify-center rounded-xl py-3.5 flex 
                    z-50 w-[80%] min-h-32 border border-black dark:border-white shadow-sm dark:shadow-white"
                    onPress={doNothing}
                    disabled={taken}
                  >
                    <Ionicons
                        name="checkmark-circle-outline"
                        className="mr-1 mt-0.5"
                        color={tint}
                        size={30}
                    />
                  </TouchableOpacity>
                ) : (
                   <TouchableOpacity
                    className="bg-accent items-center justify-center rounded-xl py-3.5 flex
                    z-50 w-[80%] min-h-32 border border-black dark:border-white shadow-sm dark:shadow-white"
                    onPress={doNothing}
                    disabled={taken}
                  >
                    <Ionicons
                        name="medkit-outline"
                        className="mr-1 mt-0.5"
                        color={tint}
                        size={30}
                    />
                    <Text className="dark:text-white text-black font-semibold text-xl text-center">Mark as Taken</Text>
                  </TouchableOpacity>
                )}
              </View>
        </SafeAreaView>
    </View>
  )
}