import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAEWqo_P-aCwETuAr6uSZwl5DdmoNIKgHM",
  authDomain: "cybersecurity-2ec20.firebaseapp.com",
  projectId: "cybersecurity-2ec20",
  storageBucket: "cybersecurity-2ec20.firebasestorage.app",
  messagingSenderId: "177308619247",
  appId: "1:177308619247:web:e448a5e1f0848c50be661a",
  measurementId: "G-BLE8KVSWSE"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
