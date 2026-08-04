import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    collection,
    query,
    where,
    getDocs,
    writeBatch
} from 'firebase/firestore';
import { db } from './firebase';

export interface UserPreferences {
    currency?: 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'AUD' | 'CAD';
    billNotifications?: boolean;
    emailDigest?: boolean;
    budgetAlerts?: boolean;
}

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    bio?: string;
    phoneNumber?: string;
    role: 'free' | 'premium';
    isPremium: boolean;
    premiumActivatedAt?: string;
    premiumSource?: 'razorpay' | 'dev' | 'manual' | 'demo';
    createdAt: string;
    preferences?: UserPreferences;
}

export const userService = {
    // Create or Sync user in Firestore on login
    syncUser: async (user: { uid: string; email: string | null; displayName: string | null }) => {
        if (user.uid === 'demo-user-123') {
            const { DEMO_USER_PROFILE } = await import('./demoData');
            return DEMO_USER_PROFILE;
        }

        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            const newUser: UserProfile = {
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || 'User',
                role: 'free',
                isPremium: false,
                createdAt: new Date().toISOString(),
                preferences: {
                    currency: 'INR',
                    billNotifications: true,
                    emailDigest: false,
                    budgetAlerts: true
                }
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

    // Update profile info (Name, Bio, Phone, Avatar)
    updateUserProfile: async (uid: string, data: Partial<UserProfile>) => {
        if (uid === 'demo-user-123') return;
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, data);
    },

    // Update preferences (Currency, Notifications)
    updatePreferences: async (uid: string, preferences: Partial<UserPreferences>) => {
        if (uid === 'demo-user-123') return;
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        const currentData = userSnap.data() as UserProfile;

        const updatedPreferences = {
            ...(currentData?.preferences || {}),
            ...preferences
        };

        await updateDoc(userRef, { preferences: updatedPreferences });
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

    // Upgrade to Premium
    upgradeToPremium: async (uid: string, source: 'dev' | 'razorpay' = 'dev') => {
        if (uid === 'demo-user-123') return;
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, {
            role: 'premium',
            isPremium: true,
            premiumActivatedAt: new Date().toISOString(),
            premiumSource: source
        });
    },

    // Export all user data as JSON payload
    exportUserData: async (uid: string) => {
        if (uid === 'demo-user-123') {
            const { DEMO_USER_PROFILE, DEMO_EXPENSES } = await import('./demoData');
            return {
                profile: DEMO_USER_PROFILE,
                expenses: DEMO_EXPENSES,
                budgets: [],
                goals: [],
                bills: [],
                exportedAt: new Date().toISOString()
            };
        }

        const profile = await userService.getUserProfile(uid);

        const expensesSnap = await getDocs(query(collection(db, 'expenses'), where('userId', '==', uid)));
        const expenses = expensesSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const budgetsSnap = await getDocs(query(collection(db, 'budgets'), where('userId', '==', uid)));
        const budgets = budgetsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const goalsSnap = await getDocs(query(collection(db, 'goals'), where('userId', '==', uid)));
        const goals = goalsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const billsSnap = await getDocs(query(collection(db, 'bills'), where('userId', '==', uid)));
        const bills = billsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        return {
            profile,
            expenses,
            budgets,
            goals,
            bills,
            exportedAt: new Date().toISOString()
        };
    },

    // Delete all user data from Firestore
    deleteUserData: async (uid: string) => {
        if (uid === 'demo-user-123') return;

        const collectionsToDelete = ['expenses', 'budgets', 'goals', 'bills'];

        for (const col of collectionsToDelete) {
            const snap = await getDocs(query(collection(db, col), where('userId', '==', uid)));
            if (!snap.empty) {
                const batch = writeBatch(db);
                snap.docs.forEach(docSnap => {
                    batch.delete(docSnap.ref);
                });
                await batch.commit();
            }
        }

        // Delete user profile doc
        const userRef = doc(db, 'users', uid);
        await deleteDoc(userRef);
    }
};
