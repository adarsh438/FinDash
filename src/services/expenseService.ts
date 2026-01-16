import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    deleteDoc,
    doc,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

export interface Expense {
    id?: string;
    userId: string;
    title: string;
    amount: number;
    category: 'shopping' | 'food' | 'income' | 'utilities' | 'other';
    date: string; // ISO string YYYY-MM-DD
    createdAt: Timestamp;
}

const EXPENSES_COLLECTION = 'expenses';

export const expenseService = {
    // Add a new expense
    addExpense: async (userId: string, expense: Omit<Expense, 'id' | 'userId' | 'createdAt'>) => {
        try {
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
    }
};
