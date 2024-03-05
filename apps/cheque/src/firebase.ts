import { initializeApp } from "firebase/app";
import {
  getAuth,
  // connectAuthEmulator,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
// connectDatabaseEmulator
import { getDatabase } from "firebase/database";
// connectFirestoreEmulator
import { getFirestore } from "firebase/firestore";
// import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseApp = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
});

// Initialize Firebase app
const auth = getAuth(firebaseApp);
const db = getDatabase(firebaseApp);
const fb = getFirestore(firebaseApp);

// Connect to Firebase emulators in development environment
// if (import.meta.env.DEV) {

//   connectAuthEmulator(auth, "http://localhost:9099");
//   connectDatabaseEmulator(db, "localhost", 9000);
//   connectFirestoreEmulator(fb, "localhost", 8069);
// }

// Set persistence for authentication

setPersistence(auth, browserLocalPersistence);

// Export Firebase app instance
export { firebaseApp, db, fb };
