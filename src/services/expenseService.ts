import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    deleteDoc,
    doc,
    updateDoc,
    Timestamp,
    setDoc,
    getDocs,
    limit
} from 'firebase/firestore';
import { db } from './firebase';

export type ExpenseCategory =
    | 'food' | 'transport' | 'shopping' | 'entertainment' | 'health'
    | 'rent' | 'education' | 'work' | 'travel' | 'other' | 'income'
    // Legacy aliases
    | 'rent_hostel' | 'subscriptions' | 'study_materials';

export type IncomeCategory = 'salary' | 'freelance' | 'investments' | 'other';

export type PaymentMethod = 'cash' | 'bank' | 'credit_card' | 'upi' | 'wallet';

export interface Expense {
    id?: string;
    userId: string;
    type?: 'expense' | 'income';
    title: string;
    amount: number;
    category: ExpenseCategory;
    incomeCategory?: IncomeCategory;
    paymentMethod?: PaymentMethod;
    date: string; // ISO string YYYY-MM-DD
    notes?: string;
    tags?: string[];
    receiptUrl?: string;
    isRecurring?: boolean;
    recurringPeriod?: 'weekly' | 'monthly' | 'yearly';
    createdAt: Timestamp;
    updatedAt?: Timestamp;
}

export interface Budget {
    id?: string;
    userId: string;
    amount: number;
    categoryBudgets?: Record<string, number>;
    period: 'monthly' | 'semester';
    updatedAt: Timestamp;
}

const EXPENSES_COLLECTION = 'expenses';
const BUDGETS_COLLECTION = 'budgets';

export const expenseService = {
    // Add a new expense / income
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
                type: expense.type || (expense.category === 'income' ? 'income' : 'expense'),
                createdAt: Timestamp.now()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error adding transaction: ", error);
            throw error;
        }
    },

    // Update an existing expense / income
    updateExpense: async (id: string, data: Partial<Omit<Expense, 'id' | 'userId' | 'createdAt'>>) => {
        try {
            const docRef = doc(db, EXPENSES_COLLECTION, id);
            await updateDoc(docRef, {
                ...data,
                updatedAt: Timestamp.now()
            });
        } catch (error) {
            console.error("Error updating transaction: ", error);
            throw error;
        }
    },

    // Duplicate an expense
    duplicateExpense: async (userId: string, expense: Expense) => {
        try {
            const { id, createdAt, updatedAt, ...rest } = expense;
            return await expenseService.addExpense(userId, {
                ...rest,
                title: `${expense.title} (Copy)`,
                date: new Date().toISOString().split('T')[0]
            });
        } catch (error) {
            console.error("Error duplicating transaction: ", error);
            throw error;
        }
    },

    // Subscribe to expenses for a user
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
            console.error("Error deleting transaction: ", error);
            throw error;
        }
    },

    // --- Budget Features ---

    // Set or Update Total Budget
    setBudget: async (userId: string, amount: number, period: 'monthly' | 'semester' = 'monthly') => {
        try {
            const q = query(collection(db, BUDGETS_COLLECTION), where("userId", "==", userId), limit(1));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const docId = querySnapshot.docs[0].id;
                await setDoc(doc(db, BUDGETS_COLLECTION, docId), {
                    userId,
                    amount,
                    period,
                    updatedAt: Timestamp.now()
                }, { merge: true });
            } else {
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

    // Set Category Budgets
    setCategoryBudgets: async (userId: string, categoryBudgets: Record<string, number>) => {
        try {
            const q = query(collection(db, BUDGETS_COLLECTION), where("userId", "==", userId), limit(1));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const docId = querySnapshot.docs[0].id;
                await setDoc(doc(db, BUDGETS_COLLECTION, docId), {
                    categoryBudgets,
                    updatedAt: Timestamp.now()
                }, { merge: true });
            }
        } catch (error) {
            console.error("Error setting category budgets: ", error);
            throw error;
        }
    },

    // Get Budget
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
