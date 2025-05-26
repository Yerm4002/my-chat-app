// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAATpFKhVCeRJnQmoZlxbO4qwqEHglRxE8",
  authDomain: "chatapplication-8e31a.firebaseapp.com",
  projectId: "chatapplication-8e31a",
  storageBucket: "chatapplication-8e31a.firebasestorage.app",
  messagingSenderId: "426728749906",
  appId: "1:426728749906:web:9cf339db25406f4a79588b",
  measurementId: "G-FQYSK0RNE0"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export the Firebase services you'll use
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
