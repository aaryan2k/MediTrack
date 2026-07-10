import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../firebase/config";
import { doc, getDoc, getDocs, collection } from 'firebase/firestore';
import { ActivityIndicator, View, Text, TouchableOpacity, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

type Medication = {
  id: string;
  name: string;
  days: string[];
  perDay: string[];
  hours: string[];
};

type NextDoseState = {
  medication: Medication | null;
  earliestDate: Date | null;
};

export default function Index() {
  const [user, setUser] = useState<any>(undefined);
  const [fname, setFname] = useState("");
  const [taken, setTaken] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [nextDose, setNextDose] = useState<Date | null>(null);
  const [nextMedication, setNextMedication] = useState<Medication | null>(null);
  const [timeUntilNextDose, setTimeUntilNextDose] = useState<string>("");
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

        const medRef = collection(db, "Users", user.uid, "medications");
        const medSnap = await getDocs(medRef);

        const meds = medSnap.docs.map((med) => {
          const data = med.data();

          return {
            id: med.id,
            name: data.name || "",
            days: data.days || [],
            perDay: data.perDay || [],
            hours: data.times || [],
          };
        });

        setMedications(meds);

      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    loadUser();
  }, [user]);

  useEffect(() => {
    if (!medications.length) {
      setNextDose(null);
      setNextMedication(null);
      return;
    }

    const now = new Date();
    const result = findNextMedication(medications, now);

    setNextDose(result.earliestDate);
    setNextMedication(result.medication);
  }, [medications]);

  useEffect(() => {
    if (!nextDose || !medications.length) {
      setTimeUntilNextDose("");
      return;
    }

    const updateCountdown = () => {
      const now = new Date();

      if (isPastDoseWindow(nextDose, now)) {
        const result = findNextMedication(medications, now);
        setNextDose(result.earliestDate);
        setNextMedication(result.medication);
        setTimeUntilNextDose(
          result.earliestDate ? formatTimeUntil(result.earliestDate) : ""
        );
        return;
      }

      setTimeUntilNextDose(formatTimeUntil(nextDose));
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [nextDose, medications]);

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

  function computeNextDose(day: number, hour: number, now: Date): Date {
    const nextDose = new Date(now);
    const currentDay = now.getDay();

    let daysUntil = day - currentDay;
    if (daysUntil < 0) daysUntil += 7;

    nextDose.setDate(now.getDate() + daysUntil);
    nextDose.setHours(hour, 0, 0, 0);

    if (nextDose <= now) {
      nextDose.setDate(nextDose.getDate() + 7);
    }

    return nextDose;
  }

  function findNextMedication(medications: Medication[], now: Date): NextDoseState {
    let earliestDate: Date | null = null;
    let nextMedication: Medication | null = null;

    medications.forEach((medication) => {
      medication.days.forEach((day) => {
        medication.hours.forEach((hour) => {
          const nextDose = computeNextDose(Number(day), Number(hour), now);

          if (earliestDate === null || nextDose < earliestDate) {
            earliestDate = nextDose;
            nextMedication = medication;
          }
        });
      });
    });

    return { medication: nextMedication, earliestDate };
  }

  function formatTimeUntil(target: Date): string {
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();

    if (diffMs <= 0) return "Due now";

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  function isPastDoseWindow(nextDose: Date, now: Date) {
    const oneHourLater = new Date(nextDose);
    oneHourLater.setHours(oneHourLater.getHours() + 1);
    return now >= oneHourLater;
  }

  const handleTaken = () => {
    if (taken || !medications.length) return;

    setTaken(true);

    const now = new Date();
    const result = findNextMedication(medications, now);

    setNextDose(result.earliestDate);
    setNextMedication(result.medication);
    setTimeUntilNextDose(
      result.earliestDate ? formatTimeUntil(result.earliestDate) : ""
    );

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
                  <Text className="text-2xl text-black dark:text-white font-bold mt-5 text-center">{timeUntilNextDose || "Loading..."}</Text>
                  <Text 
                    className="text-2xl text-accent font-bold mt-5 text-center px-2"
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                    >
                      {nextMedication?.name || "Loading..."}
                    </Text>
                </View>
              </View>
              <View className="items-center">
                <TouchableOpacity
                  className={["items-center justify-center rounded-xl py-3.5 flex", 
                  "z-50 w-[80%] min-h-32 border border-black dark:border-white shadow-sm dark:shadow-white", 
                  taken ? "bg-gray-400" : "bg-accent"].join(" ")}
                  onPress={handleTaken}
                  disabled={taken || !nextMedication}
                >
                  <Ionicons
                      name="medkit-outline"
                      className="mr-1 mt-0.5"
                      color={tint}
                      size={30}
                  />
                  <Text className="dark:text-white text-black font-semibold text-xl text-center">Mark as Taken</Text>
                </TouchableOpacity>
              </View>
        </SafeAreaView>
    </View>
  )
}