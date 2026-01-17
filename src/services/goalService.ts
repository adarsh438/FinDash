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
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

export interface Goal {
    id?: string;
    userId: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string; // ISO Date YYYY-MM-DD
    color: string;
    createdAt: Timestamp;
}

const GOALS_COLLECTION = 'goals';

export const goalService = {
    // Add a new goal
    addGoal: async (userId: string, goal: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'currentAmount'>) => {
        try {
            if (!goal.title || goal.title.trim() === '') {
                throw new Error("Goal title is required");
            }
            if (goal.targetAmount <= 0) {
                throw new Error("Target amount must be greater than 0");
            }
            const deadlineDate = new Date(goal.deadline);
            if (isNaN(deadlineDate.getTime()) || deadlineDate < new Date()) {
                // Allow today? Let's say strictly future or today is fine, but < yesterday is bad.
                // Simple check: Valid date object. Logic for "future" can be strict or loose.
                // Let's just ensure it's a valid date for now to avoid timezone headaches blocking user.
                if (isNaN(deadlineDate.getTime())) throw new Error("Invalid deadline date");
            }

            const docRef = await addDoc(collection(db, GOALS_COLLECTION), {
                ...goal,
                userId,
                currentAmount: 0,
                createdAt: Timestamp.now()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error adding goal: ", error);
            throw error;
        }
    },

    // Subscribe to goals
    subscribeToGoals: (userId: string, callback: (goals: Goal[]) => void) => {
        if (userId === 'demo-user-123') {
            import('./demoData').then(({ DEMO_GOALS }) => {
                callback(DEMO_GOALS);
            });
            return () => { };
        }

        const q = query(
            collection(db, GOALS_COLLECTION),
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );

        return onSnapshot(q, (snapshot) => {
            const goals = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Goal));
            callback(goals);
        });
    },

    // Add funds to a goal
    addFunds: async (goalId: string, currentAmount: number, amountToAdd: number) => {
        try {
            if (amountToAdd <= 0) {
                throw new Error("Amount to add must be positive");
            }
            const goalRef = doc(db, GOALS_COLLECTION, goalId);
            await updateDoc(goalRef, {
                currentAmount: currentAmount + amountToAdd
            });
        } catch (error) {
            console.error("Error adding funds: ", error);
            throw error;
        }
    },

    // Delete a goal
    deleteGoal: async (goalId: string) => {
        try {
            await deleteDoc(doc(db, GOALS_COLLECTION, goalId));
        } catch (error) {
            console.error("Error deleting goal: ", error);
            throw error;
        }
    }
};
