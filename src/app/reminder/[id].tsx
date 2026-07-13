import { View, Text, useColorScheme, TouchableOpacity, Alert } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from "@expo/vector-icons";
import Dropdown from '../../../components/Dropdown';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../../firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import { timeOptions } from '../../../constants/timeOptions';

const dayOptions = [
  { label: "Sunday", value: "0" },
  { label: "Monday", value: "1" },
  { label: "Tuesday", value: "2" },
  { label: "Wednesday", value: "3" },
  { label: "Thursday", value: "4" },
  { label: "Friday", value: "5" },
  { label: "Saturday", value: "6" },
];

const perDayOptions = [
  { label: "1x", value: "1" },
  { label: "2x", value: "2" },
  { label: "3x", value: "3" },
  { label: "4x", value: "4" },
  { label: "6x", value: "6" },
//   { label: "Every X Hours", value: "4" },
];

const Reminder = () => {
    const { id } = useLocalSearchParams();
    const scheme = useColorScheme();
    const tint = scheme === 'dark' ? '#fff' : '#000';
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedDays, setSelectedDays] = useState<Array<string | number>>([]);
    const [daysLoading, setDaysLoading] = useState(false);
    const [selectedPerDay, setSelectedPerDay] = useState<Array<string | number>>([]);
    const [perDayLoading, setPerDayLoading] = useState(false);
    const [selectedTimes, setSelectedTimes] = useState<Array<string | number>>([]);
    const [timesLoading, setTimesLoading] = useState(false);
    const [notisEnabled, setNotisEnabled] = useState<boolean | null | undefined>(undefined);
    const [notiIDs, setNotiIDs] = useState<Array<string>>([]);
    const user = auth.currentUser;

    const handleSaveDays = async (nextValues: Array<string | number>) => {
        setDaysLoading(true);
        setSelectedDays(nextValues);
        if (!user) {
            router.push("/(auth)/login");
            return;
        }
        try {
            const medRef = doc(db, "Users", user.uid, "medications", String(id));
            await updateDoc(medRef, {
                days: nextValues,
            });
        } catch (error: any) {
            Alert.alert("Error", "Failed to save medication. Please try again.");
        } finally {
            setDaysLoading(false);
        }
    };

    const handleSavePerDay = async (nextValues: Array<string | number>) => {
        setPerDayLoading(true);
        setSelectedPerDay(nextValues);
        if (!user) {
            router.push("/(auth)/login");
            return;
        }
        try {
            const medRef = doc(db, "Users", user.uid, "medications", String(id));
            await updateDoc(medRef, {
                perDay: nextValues,
                times: [],
            });
            setSelectedTimes([]);
        } catch (error: any) {
            Alert.alert("Error", "Failed to save medication. Please try again.");
        } finally {
            setPerDayLoading(false);
        }
    };

    const handleSaveTimes = async (nextValues: Array<string | number>) => {
        setTimesLoading(true);
        setSelectedTimes(nextValues);
        if (!user) {
            router.push("/(auth)/login");
            return;
        }
        try {
            const medRef = doc(db, "Users", user.uid, "medications", String(id));
            await updateDoc(medRef, {
                times: nextValues,
            });
        } catch (error: any) {
            Alert.alert("Error", "Failed to save medication. Please try again.");
        } finally {
            setTimesLoading(false);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            if (!user) {
                return;
            }
            setLoading(true);
            try {
                const userRef = doc(db, "Users", user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    setNotisEnabled(userData.notisEnabled !== undefined ? userData.notisEnabled : null);
                } else {
                    console.log("No such document!");
                }

                const medRef = doc(db, "Users", user.uid, "medications", String(id));
                const medSnap = await getDoc(medRef);
                if (medSnap.exists()) {
                    const medData = medSnap.data();
                    setName(medData.name);
                    setSelectedDays(medData.days ? medData.days : []);
                    setSelectedPerDay(medData.perDay ? medData.perDay : []);
                    setSelectedTimes(medData.times ? medData.times : []);
                    setNotiIDs(medData.notiIDs ? medData.notiIDs : []);
                } else {
                    console.log("No such document!");
                }
            } catch (error) {
                Alert.alert("Error", "Failed to load medication data. Please try again.");
            } finally {
                setLoading(false);
            }
        } 
        
        loadData();
    }, [user]);

    useEffect(() => {
        const manageNotifications = async () => {
            if (!user || loading || notisEnabled === undefined 
                || selectedDays.length === 0 
                || selectedPerDay.length === 0 
                || selectedTimes.length === 0) {
                return;
            }

            try {
                if (notisEnabled === null) {
                    const { status } = await Notifications.requestPermissionsAsync();
                    const granted = status === "granted";
                    setNotisEnabled(granted);
                    await updateDoc(doc(db, "Users", user.uid), {
                        notisEnabled: granted,
                    });
                    if (!granted) {
                        return;
                    }
                }
                if (notisEnabled === false) {
                    return;
                }

                for (const id of notiIDs) {
                    await Notifications.cancelScheduledNotificationAsync(id);
                }

                const newIds: string[] = [];

                for (const day of selectedDays) {
                    for (const time of selectedTimes) {
                        const notificationId = await Notifications.scheduleNotificationAsync({
                            content: {
                                title: "Medication Reminder",
                                body: `Time to take ${name}`,
                                sound: true,
                            },
                            trigger: {
                                type: "weekly",
                                weekday: Number(day) + 1,
                                hour: Number(time),
                                minute: 0,
                            } as Notifications.WeeklyTriggerInput,
                        });

                        newIds.push(notificationId);
                    }
                }

                setNotiIDs(newIds);

                await updateDoc(doc(db, "Users", user.uid, "medications", String(id)), {
                    notificationIds: newIds,
                });

            } catch (error) {
                Alert.alert("Error", "Failed to set notifications. Please try again.");
            }
        } 
        
        manageNotifications();
    }, [notisEnabled, selectedDays, selectedPerDay, selectedTimes]);

    return (
         <View className="flex-1 bg-white dark:bg-black">
            <SafeAreaView className="flex-1">
                <Text className="text-black dark:text-white align-top mt-12 ml-4 font-bold text-2xl">{name}</Text>
                <View className="h-[2px] bg-gray-700 dark:bg-gray-300 mx-5 mb-5 mt-4" />
                <View className="mt-4 gap-y-3 items-center px-2">
                    <Dropdown
                        label="Days"
                        options={dayOptions}
                        selectedValues={selectedDays}
                        onSave={handleSaveDays}
                        placeholder="Select reminder days"
                        loading={daysLoading}
                    />
                    <Dropdown
                        label="Reminders Per Day"
                        options={perDayOptions}
                        selectedValues={selectedPerDay}
                        onSave={handleSavePerDay}
                        placeholder="Select reminder frequency"
                        loading={perDayLoading}
                        limit={1}
                    />
                    <Dropdown
                        label="Reminder Times"
                        options={timeOptions}
                        selectedValues={selectedTimes}
                        onSave={handleSaveTimes}
                        placeholder="Select reminder times"
                        loading={timesLoading}
                        limit={selectedPerDay && selectedPerDay.length > 0 ? Number(selectedPerDay[0]) : 1}
                    />
                </View> 
                <TouchableOpacity
                    className="absolute bottom-5 left-0 right-0 mx-5 bg-accent rounded-lg py-3.5 flex flex-row items-center justify-center z-50"
                    onPress={router.back}
                >
                    <Ionicons
                        name="arrow-back"
                        className="mr-1 mt-0.5"
                        color={tint}
                        size={15}
                    />
                    <Text className="text-black dark:text-white font-semibold text-base">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    )
}

export default Reminder;