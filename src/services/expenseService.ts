import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    deleteDoc,
    doc,
    Timestamp,
    setDoc,
    getDocs,
    limit
} from 'firebase/firestore';
import { db } from './firebase';

export type ExpenseCategory =
    | 'food' | 'transport' | 'shopping' | 'entertainment' | 'health'
    | 'rent' | 'education' | 'work' | 'travel' | 'other' | 'income'
    // Legacy aliases (backward compat with existing Firestore data)
    | 'rent_hostel' | 'subscriptions' | 'study_materials';

export interface Expense {
    id?: string;
    userId: string;
    title: string;
    amount: number;
    category: ExpenseCategory;
    date: string; // ISO string YYYY-MM-DD
    createdAt: Timestamp;
}

export interface Budget {
    id?: string;
    userId: string;
    amount: number;
    period: 'monthly' | 'semester';
    updatedAt: Timestamp;
}

const EXPENSES_COLLECTION = 'expenses';
const BUDGETS_COLLECTION = 'budgets';

export const expenseService = {
    // Add a new expense
    addExpense: async (userId: string, expense: Omit<Expense, 'id' | 'userId' | 'createdAt'>) => {
        try {
            if (!expense.title || expense.title.trim() === '') {
                throw new Error("Title is required");
            }
            if (expense.amount <= 0) {
                throw new Error("Amount must be greater than 0");
            }

            const docRef = await addDoc(collection(db, EXPENSES_COLLECTION), {
                ...expense,
                userId,
                createdAt: Timestamp.now()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error adding expense: ", error);
            throw error;
        }
    },

    // Subscribe to expenses for a user (Real-time updates)
    subscribeToExpenses: (userId: string, callback: (expenses: Expense[]) => void) => {
        // Demo mode handling removed for brevity, or can be kept if needed. 
        // Assuming strict production usage now as per previous context, but safe to keep if simple.
        if (userId.startsWith('demo-')) {
            // Simple mock for demo users if needed, or just let them use firestore if configured.
            // For now, let's stick to real firestore for consistency unless requested.
        }

        const q = query(
            collection(db, EXPENSES_COLLECTION),
            where("userId", "==", userId),
            orderBy("date", "desc"),
            orderBy("createdAt", "desc")
        );

        return onSnapshot(q, (snapshot) => {
            const expenses = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Expense));
            callback(expenses);
        });
    },

    // Delete an expense
    deleteExpense: async (expenseId: string) => {
        try {
            await deleteDoc(doc(db, EXPENSES_COLLECTION, expenseId));
        } catch (error) {
            console.error("Error deleting expense: ", error);
            throw error;
        }
    },

    // --- Budget Features ---

    // Set or Update Budget
    setBudget: async (userId: string, amount: number, period: 'monthly' | 'semester' = 'monthly') => {
        try {
            // Check if budget exists
            const q = query(collection(db, BUDGETS_COLLECTION), where("userId", "==", userId), limit(1));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Update existing
                const docId = querySnapshot.docs[0].id;
                await setDoc(doc(db, BUDGETS_COLLECTION, docId), {
                    userId,
                    amount,
                    period,
                    updatedAt: Timestamp.now()
                }, { merge: true });
            } else {
                // Create new
                await addDoc(collection(db, BUDGETS_COLLECTION), {
                    userId,
                    amount,
                    period,
                    updatedAt: Timestamp.now()
                });
            }
        } catch (error) {
            console.error("Error setting budget: ", error);
            throw error;
        }
    },

    // Get Budget (One-time fetch usually, or subscription)
    getBudget: async (userId: string): Promise<Budget | null> => {
        try {
            const q = query(collection(db, BUDGETS_COLLECTION), where("userId", "==", userId), limit(1));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as Budget;
            }
            return null;
        } catch (error) {
            console.error("Error getting budget: ", error);
            return null;
        }
    },

    subscribeToBudget: (userId: string, callback: (budget: Budget | null) => void) => {
        const q = query(collection(db, BUDGETS_COLLECTION), where("userId", "==", userId), limit(1));
        return onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                callback({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Budget);
            } else {
                callback(null);
            }
        });
    }
};
