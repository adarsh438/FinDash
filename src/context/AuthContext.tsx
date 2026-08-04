import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    type User,
    onAuthStateChanged,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    sendEmailVerification,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { userService, type UserProfile } from '../services/userService';

const IS_DEV = import.meta.env.DEV;

interface AuthContextType {
    currentUser: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    loginWithEmail: (email: string, pass: string) => Promise<void>;
    signupWithEmail: (email: string, pass: string, displayName?: string) => Promise<void>;
    sendPasswordReset: (email: string) => Promise<void>;
    resendVerificationEmail: () => Promise<void>;
    setRememberMe: (remember: boolean) => Promise<void>;
    getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
    loginAsDemo: () => Promise<void>;
    isDemo: boolean;
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

    // Handle redirect result on app load (completes pending Google redirect sign-in)
    useEffect(() => {
        getRedirectResult(auth)
            .then((result) => {
                if (result?.user) {
                    if (IS_DEV) {
                        console.log('[Auth] Redirect sign-in completed for:', result.user.email);
                    }
                }
            })
            .catch((error) => {
                if (IS_DEV) {
                    console.error('[Auth] getRedirectResult error:', {
                        code: error?.code,
                        message: error?.message,
                        fullError: error,
                    });
                }
            });
    }, []);

    useEffect(() => {
        let profileUnsubscribe: (() => void) | null = null;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            if (profileUnsubscribe) {
                profileUnsubscribe();
                profileUnsubscribe = null;
            }

            if (user) {
                setLoading(true);
                try {
                    // 1. Sync User Profile in Firestore
                    await userService.syncUser({
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName
                    });

                    // 2. Subscribe to live profile changes
                    profileUnsubscribe = userService.subscribeToProfile(
                        user.uid,
                        (profile) => {
                            setUserProfile(profile);
                            setLoading(false);
                        },
                        (error) => {
                            console.error("[Auth] Profile subscription failed", error);
                            setLoading(false);
                        }
                    );
                } catch (error) {
                    console.error("[Auth] Profile sync error:", error);
                    setLoading(false);
                }
            } else {
                setUserProfile(null);
                setLoading(false);
            }
        });

        return () => {
            unsubscribe();
            if (profileUnsubscribe) {
                profileUnsubscribe();
            }
        };
    }, []);

    const setRememberMe = async (remember: boolean) => {
        try {
            await setPersistence(
                auth,
                remember ? browserLocalPersistence : browserSessionPersistence
            );
        } catch (error) {
            console.error("[Auth] Failed to set persistence mode", error);
        }
    };

    const refreshProfile = async () => {
        if (currentUser) {
            const profile = await userService.getUserProfile(currentUser.uid);
            setUserProfile(profile);
        }
    };

    const loginWithGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (popupError: any) {
            console.error('[Auth] Google Sign-In popup error:', popupError);
            if (popupError?.code === 'auth/popup-blocked') {
                try {
                    await signInWithRedirect(auth, googleProvider);
                } catch (redirectError: any) {
                    console.error('[Auth] Google Sign-In redirect fallback error:', redirectError);
                    throw redirectError;
                }
            } else {
                throw popupError;
            }
        }
    };

    const loginWithEmail = async (email: string, pass: string) => {
        await signInWithEmailAndPassword(auth, email, pass);
    };

    const signupWithEmail = async (email: string, pass: string, displayName?: string) => {
        const userCred = await createUserWithEmailAndPassword(auth, email, pass);
        if (displayName && userCred.user) {
            try {
                await updateProfile(userCred.user, { displayName });
            } catch (err) {
                console.warn('[Auth] Failed to set display name on auth user:', err);
            }
        }

        // Send Email Verification
        try {
            if (userCred.user) {
                await sendEmailVerification(userCred.user);
            }
        } catch (verr) {
            console.warn('[Auth] Could not send initial verification email:', verr);
        }

        // Sync to Firestore immediately with display name
        if (userCred.user) {
            await userService.syncUser({
                uid: userCred.user.uid,
                email: userCred.user.email,
                displayName: displayName || userCred.user.displayName
            });
        }
    };

    const sendPasswordReset = async (email: string) => {
        await sendPasswordResetEmail(auth, email);
    };

    const resendVerificationEmail = async () => {
        if (auth.currentUser) {
            await sendEmailVerification(auth.currentUser);
        } else {
            throw new Error("No user is currently signed in.");
        }
    };

    const getIdToken = async (forceRefresh: boolean = false): Promise<string | null> => {
        if (currentUser?.uid === 'demo-user-123') return 'demo-token';
        if (currentUser) {
            return await currentUser.getIdToken(forceRefresh);
        }
        return null;
    };

    const loginAsDemo = async () => {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 600));

        const demoUser = {
            uid: 'demo-user-123',
            email: 'demo@financeapp.com',
            displayName: 'Demo User',
            emailVerified: true,
            isAnonymous: false,
            metadata: {},
            providerData: [],
            refreshToken: '',
            tenantId: null,
            delete: async () => { },
            getIdToken: async () => 'demo-token',
            getIdTokenResult: async () => ({} as any),
            reload: async () => { },
            toJSON: () => ({}),
            phoneNumber: null,
            photoURL: null
        } as unknown as User;

        setCurrentUser(demoUser);

        const { DEMO_USER_PROFILE } = await import('../services/demoData');
        setUserProfile(DEMO_USER_PROFILE);

        setLoading(false);
    };

    const logout = async () => {
        try {
            if (currentUser?.uid === 'demo-user-123') {
                setCurrentUser(null);
                setUserProfile(null);
            } else {
                await signOut(auth);
                setUserProfile(null);
            }
        } catch (error) {
            console.error("[Auth] Failed to logout", error);
        }
    };

    return (
        <AuthContext.Provider value={{
            currentUser,
            userProfile,
            loading,
            loginWithGoogle,
            logout,
            refreshProfile,
            loginWithEmail,
            signupWithEmail,
            sendPasswordReset,
            resendVerificationEmail,
            setRememberMe,
            getIdToken,
            loginAsDemo,
            isDemo: currentUser?.uid === 'demo-user-123'
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
