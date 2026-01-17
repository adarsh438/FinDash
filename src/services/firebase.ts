import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Debug check for production
if (!firebaseConfig.apiKey) {
    console.error("Firebase API Key is missing! Make sure to set VITE_FIREBASE_API_KEY in your environment variables.");
    // Optional: Visual alert if in window context to help user debug on Vercel
    if (typeof window !== 'undefined') {
        document.body.innerHTML = '<div style="color: red; padding: 20px;"><h1>Configuration Error</h1><p>Missing VITE_FIREBASE_API_KEY. Please check your deployment settings.</p></div>';
    }
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
