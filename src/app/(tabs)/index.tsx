import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../firebase/config";
import { doc, addDoc, getDoc, getDocs, collection, serverTimestamp, query, where } from 'firebase/firestore';
import { ActivityIndicator, View, Text, TouchableOpacity, useColorScheme, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import {  
  findNextMedication, 
  formatTimeUntil, 
  findPreviousMedication 
} from "../../../services/medCalc"

type Medication = {
  id: string;
  name: string;
  days: string[];
  perDay: string[];
  hours: string[];
};

export default function Index() {
  const [user, setUser] = useState<any>(undefined);
  const [fname, setFname] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [nextDose, setNextDose] = useState<Date | null>(null);
  const [nextMedication, setNextMedication] = useState<Medication | null>(null);
  const [prevDose, setPrevDose] = useState<Date | null>(null);
  const [prevMedication, setPrevMedication] = useState<Medication | null>(null);
  const [displayMedication, setDisplayMedication] = useState<Medication | null>(null);
  const [displayDose, setDisplayDose] = useState<Date | null>(null);
  const [doseLabel, setDoseLabel] = useState<string>("");
  const [timeUntilNextDose, setTimeUntilNextDose] = useState<string>("");
  const [visibleMonth, setVisibleMonth] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });
  const [markedDates, setMarkedDates] = useState({});
  const scheme = useColorScheme();
  const tint = scheme === 'dark' ? '#fff' : '#000';
  const tintOpp = scheme === 'dark' ? '#000' : '#fff';

  const isInRange =
    !!prevDose &&
    new Date() >= prevDose &&
    new Date() < new Date(prevDose.getTime() + 60 * 60 * 1000);

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

      } catch (error: any) {
        console.error("Error fetching user data:", error.message);
      }
    };

    loadUser();
  }, [user]);

  useEffect(() => {
    if (!medications.length) {
      setNextDose(null);
      setNextMedication(null);
      setPrevDose(null);
      setPrevMedication(null);
      setDisplayMedication(null);
      setDoseLabel("");
      return;
    }

    const now = new Date();

    const nextResult = findNextMedication(medications, now);
    const previousResult = findPreviousMedication(medications, now);

    setNextDose(nextResult.earliestDate);
    setNextMedication(nextResult.medication);

    setPrevDose(previousResult.earliestDate);
    setPrevMedication(previousResult.medication);
  }, [medications]);

  useEffect(() => {
    if (!medications.length || (!nextDose && !prevDose)) {
      setTimeUntilNextDose("");
      setDisplayMedication(null);
      setDisplayDose(null);
      setDoseLabel("");
      return;
    }

    const updateCountdown = () => {
      const now = new Date();

      if (prevDose) {
        const oneHourLater = new Date(prevDose);
        oneHourLater.setHours(oneHourLater.getHours() + 1);

        if (now >= prevDose && now < oneHourLater) {
          setTimeUntilNextDose("Due now");
          setDisplayMedication(prevMedication);
          setDisplayDose(prevDose);
          setDoseLabel("Due now");
          return;
        }
      }

      if (nextDose) {
        setTimeUntilNextDose(formatTimeUntil(nextDose));
        setDisplayMedication(nextMedication);
        setDisplayDose(nextDose);
        setDoseLabel(formatTimeUntil(nextDose));
      }
    };

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [nextDose, prevDose, medications, nextMedication, prevMedication]);

  useEffect(() => {
    const checkDoseHistory = async () => {
      if (!user || !prevDose || !prevMedication) return;

      const scheduledDate = prevDose.toISOString().split("T")[0];
      const scheduledHour = prevDose.getHours();

      const exists = await doseHistoryExists(
        user.uid,
        prevMedication.id,
        scheduledDate,
        scheduledHour
      );

      if (exists) {
        setDisplayMedication(prevMedication);
        setDisplayDose(prevDose);
        setDoseLabel("Taken");
        setTimeUntilNextDose("Taken");
      }
    };

    checkDoseHistory();
  }, [user, prevDose, prevMedication]);

  useEffect(() => {
    const loadMarkedDates = async () => {
      if (!user) return;

      const year = visibleMonth.year;
      const month = String(visibleMonth.month).padStart(2, "0");

      const startDateString = `${year}-${month}-01`;
      const endDay = new Date(year, visibleMonth.month, 0).getDate();
      const endDateString = `${year}-${month}-${String(endDay).padStart(2, "0")}`;

      try {
        const q = query(
          collection(db, "Users", user.uid, "doseHistory"),
          where("status", "==", "taken"),
          where("scheduledDate", ">=", startDateString),
          where("scheduledDate", "<=", endDateString)
        );

        const snap = await getDocs(q);

        const marks: Record<string, any> = {};

        snap.forEach((docSnap) => {
          const data = docSnap.data();
          const date = data.scheduledDate;

          if (!date) return;

          marks[date] = {
            dots: [{ key: "taken", color: "green" }],
          };
        });

        setMarkedDates(marks);
      } catch (error: any) {
        console.error("Error loading marked dates:", error.message);
      }
    };

    loadMarkedDates();
  }, [user, visibleMonth]);

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

  async function createDoseHistoryEntry(userId: string, data: {
    medicationId: string;
    medicationName: string;
    scheduledDate: string;
    scheduledHour: number;
    status: "taken" | "missed";
  }) {
    return addDoc(collection(db, "Users", userId, "doseHistory"), {
      ...data,
      completedAt: serverTimestamp(),
    });
  }

  async function doseHistoryExists(
    userId: string,
    medicationId: string,
    scheduledDate: string,
    scheduledHour: number
  ) {
    const q = query(
      collection(db, "Users", userId, "doseHistory"),
      where("medicationId", "==", medicationId),
      where("scheduledDate", "==", scheduledDate),
      where("scheduledHour", "==", scheduledHour)
    );

    const snap = await getDocs(q);
    return !snap.empty;
  }

  const handleTaken = async () => {
    if (isSaving || !displayMedication || !displayDose) return;

    const scheduledDate = displayDose.toISOString().split("T")[0];
    const scheduledHour = displayDose.getHours();

    setIsSaving(true);

    try {
      const exists = await doseHistoryExists(
        user.uid,
        displayMedication.id,
        scheduledDate,
        scheduledHour
      );

      if (exists) return;

      await createDoseHistoryEntry(user.uid, {
        medicationId: displayMedication.id,
        medicationName: displayMedication.name,
        scheduledDate,
        scheduledHour,
        status: "taken",
      });

      const now = new Date();
      const result = findNextMedication(medications, now);

      setNextDose(result.earliestDate);
      setNextMedication(result.medication);
      setTimeUntilNextDose(
        result.earliestDate ? formatTimeUntil(result.earliestDate) : ""
      );
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMonthChange = (day: { year: number; month: number }) => {
    setVisibleMonth({ year: day.year, month: day.month });
  };

  let disabled = 
    isSaving ||
    !displayMedication ||
    !displayDose ||
    !isInRange ||
    doseLabel === "Taken";

  return (
     <View className="flex-1 bg-white dark:bg-black">
        <SafeAreaView className="flex-1">
            <Text className="text-black dark:text-white align-top mt-2 ml-4 font-bold text-4xl">Hello, {normalizeName(fname)}!</Text>
            <View className="h-[2px] bg-gray-700 dark:bg-gray-300 mx-5 mt-2" />
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: 75,
                marginTop: 5,
              }}
            >
              <View className="items-center mt-5 py-10">
                <View className="bg-gray-100 dark:bg-gray-800 rounded-lg min-h-72 w-[80%] 
                items-center border-black dark:border-white border-2 shadow-sm dark:shadow-white">
                  <Text className="text-3xl text-black dark:text-white font-bold mt-5">Take Dose: </Text>
                  <Text className="text-2xl text-black dark:text-white font-bold mt-5 text-center">{doseLabel || timeUntilNextDose || "Loading..."}</Text>
                  <Text 
                    className="text-2xl text-accent font-bold mt-5 text-center px-2"
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                    >
                      {displayMedication?.name || "Loading..."}
                    </Text>
                </View>
              </View>
              <View className="items-center">
                <TouchableOpacity
                  className={["items-center justify-center rounded-xl py-3.5 flex", 
                  "z-50 w-[80%] min-h-32 border border-black dark:border-white shadow-sm dark:shadow-white", 
                  disabled ? "bg-gray-400" : "bg-accent"].join(" ")}
                  onPress={handleTaken}
                  disabled={disabled}
                >
                  <Ionicons
                      name = "medkit-outline"
                      className="mr-1 mt-0.5"
                      color={tint}
                      size={30}
                  />
                  <Text className="dark:text-white text-black font-semibold text-xl text-center">Mark as Taken</Text>
                </TouchableOpacity>
              </View>
              <View className="mt-10">
                <Calendar
                    key={scheme}
                    theme={{
                      backgroundColor: tintOpp,
                      calendarBackground: tintOpp,
                      dayTextColor: tint,
                      monthTextColor: tint,
                      todayTextColor: "#2FA3DC",
                      arrowColor: "#2FA3DC",
                    }}
                    onMonthChange={handleMonthChange}
                    markingType="multi-dot"
                    markedDates={markedDates}
                />
              </View>
            </ScrollView>
        </SafeAreaView>
    </View>
  )
}