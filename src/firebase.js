import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getFirestore(app);

// Force localStorage instead of IndexedDB to avoid "Database is closing" lock errors
setPersistence(auth, browserLocalPersistence).catch(console.error);

const googleProvider = new GoogleAuthProvider();

const ALLOWED_DOMAINS = [
    "@ds.study.iitm.ac.in",
    "@es.study.iitm.ac.in",
    "@mg.study.iitm.ac.in",
    "@ae.study.iitm.ac.in"
];

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        const email = user.email;

        // Check if the email ends with one of the allowed domains
        const isAllowed = ALLOWED_DOMAINS.some(domain => email.endsWith(domain));

        if (!isAllowed) {
            await signOut(auth);
            throw new Error(`Access denied. The email ${email} is not authorized.`);
        }

        return user;
    } catch (error) {
        console.error("Authentication Error: ", error.message);
        throw error; // Re-throw to handle in the UI
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout Error: ", error.message);
    }
};

export { auth };
