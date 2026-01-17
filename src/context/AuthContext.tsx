import React, { createContext, useContext, useEffect, useState } from 'react';
import { type User, onAuthStateChanged, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
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
    loginWithEmail: (email: string, pass: string) => Promise<void>;
    signupWithEmail: (email: string, pass: string) => Promise<void>;
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
        let profileUnsubscribe: (() => void) | null = null;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            // Clean up previous subscription if any
            if (profileUnsubscribe) {
                profileUnsubscribe();
                profileUnsubscribe = null;
            }

            if (user) {
                setLoading(true);
                try {
                    // 1. Ensure user exists
                    await userService.syncUser({
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName
                    });

                    // 2. Subscribe to changes
                    profileUnsubscribe = userService.subscribeToProfile(
                        user.uid,
                        (profile) => {
                            setUserProfile(profile);
                            setLoading(false);
                        },
                        (error) => {
                            console.error("Subscription failed", error);
                            setLoading(false);
                        }
                    );
                } catch (error) {
                    console.error("Profile sync error:", error);
                    setLoading(false);
                }
            } else {
                setUserProfile(null);
                setLoading(false);
            }
        });

        // Cleanup function for the effect
        return () => {
            unsubscribe();
            if (profileUnsubscribe) {
                profileUnsubscribe();
            }
        };
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

    const loginWithEmail = async (email: string, pass: string) => {
        await signInWithEmailAndPassword(auth, email, pass);
    };

    const signupWithEmail = async (email: string, pass: string) => {
        await createUserWithEmailAndPassword(auth, email, pass);
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
        <AuthContext.Provider value={{ currentUser, userProfile, loading, loginWithGoogle, logout, refreshProfile, loginWithEmail, signupWithEmail }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
