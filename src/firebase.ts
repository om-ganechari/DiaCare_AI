import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize Firebase App gracefully
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Get Firestore reference with custom databaseId mapped to clinical preview configurations
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);
export { firebaseConfig };
