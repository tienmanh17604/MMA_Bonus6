import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBydfJSilWisRAeTCPsorWvxYaCdZRPfMI",
  authDomain: "fir-authapp-10ced.firebaseapp.com",
  projectId: "fir-authapp-10ced",
  storageBucket: "fir-authapp-10ced.firebasestorage.app",
  messagingSenderId: "142882794855",
  appId: "1:142882794855:web:e69ce8f54d4c53d9ef13c2"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;