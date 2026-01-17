import React, { createContext, useContext, useEffect, useState } from 'react';
import { type User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { userService, type UserProfile } from '../services/userService';

// Add UserProfile to context type
interface AuthContextType {
    currentUser: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                // Sync user logic
                try {
                    const profile = await userService.syncUser({
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName
                    });
                    setUserProfile(profile);
                } catch (error) {
                    console.error("Profile sync error:", error);
                }
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const refreshProfile = async () => {
        if (currentUser) {
            const profile = await userService.getUserProfile(currentUser.uid);
            setUserProfile(profile);
        }
    };

    const loginWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Failed to login", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUserProfile(null);
        } catch (error) {
            console.error("Failed to logout", error);
        }
    };

    return (
        <AuthContext.Provider value={{ currentUser, userProfile, loading, loginWithGoogle, logout, refreshProfile }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
