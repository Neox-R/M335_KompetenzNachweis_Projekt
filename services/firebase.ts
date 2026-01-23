import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeAuth, getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Dynamisch versuchen, das React-Native-Persistence-Modul zu laden
let getReactNativePersistenceFn: any = undefined;
try {
    // @ts-ignore - falls das Modul in der installierten Firebase-Version fehlt
    getReactNativePersistenceFn = require("firebase/auth/react-native").getReactNativePersistence;
} catch {
    getReactNativePersistenceFn = undefined;
}

// Auth: initialisieren mit Persistence falls verfügbar, sonst Fallback auf den getAuth
export const auth = (() => {
    if (getReactNativePersistenceFn) {
        try {
            return initializeAuth(app, {
                persistence: getReactNativePersistenceFn(AsyncStorage),
            });
        } catch {
            return getAuth(app);
        }
    } else {
        return getAuth(app);
    }
})();

export const db = getFirestore(app);
export const storage = getStorage(app);