// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";

import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBDzMB8ZxvFlehXBYfWJnwHr8V5wnLf3Hg",
  authDomain: "meditrack-783e2.firebaseapp.com",
  projectId: "meditrack-783e2",
  storageBucket: "meditrack-783e2.firebasestorage.app",
  messagingSenderId: "859666866658",
  appId: "1:859666866658:web:afbe553baee7676e7119bb",
  measurementId: "G-NPD8BVXX3X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = getFirestore(app);