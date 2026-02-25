import { initializeApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase with error handling to prevent crashes
let app;
let activeAuth;
let db;

try {
    app = initializeApp(firebaseConfig);

    // Initialize Firebase Authentication conditionally based on platform
    if (Platform.OS === 'web') {
        activeAuth = getAuth(app);
    } else {
        try {
            activeAuth = initializeAuth(app, {
                persistence: getReactNativePersistence(ReactNativeAsyncStorage)
            });
        } catch (authErr) {
            // initializeAuth may throw if already initialized (hot reload)
            console.warn('[MediClear] Auth init fallback:', authErr.message);
            activeAuth = getAuth(app);
        }
    }

    // Initialize Cloud Firestore
    db = getFirestore(app);
} catch (err) {
    console.error('[MediClear] Firebase initialization error:', err);
}

export const auth = activeAuth;
export { db };
