// lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const isServer = typeof window === 'undefined';

const firebaseConfig = {
  apiKey: isServer ? process.env.FIREBASE_API_KEY : import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: isServer ? process.env.FIREBASE_AUTH_DOMAIN : import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: isServer ? process.env.FIREBASE_PROJECT_ID : import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: isServer ? process.env.FIREBASE_STORAGE_BUCKET : import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: isServer ? process.env.FIREBASE_MESSAGING_SENDER_ID : import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: isServer ? process.env.FIREBASE_APP_ID : import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
