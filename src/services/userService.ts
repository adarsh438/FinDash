import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    isPremium: boolean;
    createdAt: string;
}

export const userService = {
    // specific Create or Update user in Firestore on login
    syncUser: async (user: { uid: string; email: string | null; displayName: string | null }) => {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            // Create new user
            const newUser: UserProfile = {
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || 'User',
                isPremium: false, // Default to free
                createdAt: new Date().toISOString()
            };
            await setDoc(userRef, newUser);
            return newUser;
        } else {
            return userSnap.data() as UserProfile;
        }
    },

    // Get current user profile
    getUserProfile: async (uid: string): Promise<UserProfile | null> => {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return userSnap.data() as UserProfile;
        }
        return null;
    },

    // Upgrade to Premium
    upgradeToPremium: async (uid: string) => {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, { isPremium: true });
    }
};
