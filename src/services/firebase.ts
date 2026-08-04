import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const getEnvVar = (key: string, fallback: string) => {
    const val = import.meta.env[key];
    if (val && typeof val === 'string' && val !== 'undefined' && val !== 'null' && val.trim() !== '') {
        return val.trim();
    }
    return fallback;
};

const firebaseConfig = {
    apiKey: getEnvVar('VITE_FIREBASE_API_KEY', 'AIzaSyDzq08oHG8u0D0K94BYZH-OXfJ6YXsAKXs'),
    authDomain: getEnvVar('VITE_FIREBASE_AUTH_DOMAIN', 'findash-app-2f922.firebaseapp.com'),
    projectId: getEnvVar('VITE_FIREBASE_PROJECT_ID', 'findash-app-2f922'),
    storageBucket: getEnvVar('VITE_FIREBASE_STORAGE_BUCKET', 'findash-app-2f922.firebasestorage.app'),
    messagingSenderId: getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID', '387615139835'),
    appId: getEnvVar('VITE_FIREBASE_APP_ID', '1:387615139835:web:1926a43c23046456d0cd5e')
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
