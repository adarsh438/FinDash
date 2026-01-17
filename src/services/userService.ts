import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    role: 'free' | 'premium';
    isPremium: boolean; // Computed or duplicate for easier access
    premiumActivatedAt?: string;
    premiumSource?: 'razorpay' | 'dev' | 'manual' | 'demo';
    createdAt: string;
}

export const userService = {
    // specific Create or Update user in Firestore on login
    syncUser: async (user: { uid: string; email: string | null; displayName: string | null }) => {
        if (user.uid === 'demo-user-123') {
            const { DEMO_USER_PROFILE } = await import('./demoData');
            return DEMO_USER_PROFILE;
        }

        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            // Create new user
            const newUser: UserProfile = {
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || 'User',
                role: 'free',
                isPremium: false,
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
        if (uid === 'demo-user-123') {
            const { DEMO_USER_PROFILE } = await import('./demoData');
            return DEMO_USER_PROFILE;
        }
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return userSnap.data() as UserProfile;
        }
        return null;
    },

    // Subscribe to real-time profile changes
    subscribeToProfile: (uid: string, callback: (profile: UserProfile | null) => void, onError?: (error: any) => void) => {
        if (uid === 'demo-user-123') {
            import('./demoData').then(({ DEMO_USER_PROFILE }) => {
                callback(DEMO_USER_PROFILE);
            });
            return () => { };
        }

        const userRef = doc(db, 'users', uid);
        return onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
                callback(doc.data() as UserProfile);
            } else {
                callback(null);
            }
        }, (error) => {
            console.error("Profile subscription error:", error);
            if (onError) onError(error);
        });
    },

    // Upgrade to Premium (Mock/Dev only mostly, real upgrades should be backend)
    upgradeToPremium: async (uid: string, source: 'dev' | 'razorpay' = 'dev') => {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
            role: 'premium',
            isPremium: true,
            premiumActivatedAt: new Date().toISOString(),
            premiumSource: source
        });
    }
};
