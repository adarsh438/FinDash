import {
    collection,
    addDoc,
    query,
    where,
    onSnapshot,
    deleteDoc,
    doc,
    updateDoc,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { DEMO_GOALS } from './demoData';

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

let demoGoalListeners: Array<(goals: Goal[]) => void> = [];

const getDemoGoals = (): Goal[] => {
    try {
        const saved = localStorage.getItem('findash_demo_goals');
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error("Failed to load demo goals from storage", e);
    }
    return DEMO_GOALS;
};

const saveDemoGoals = (goals: Goal[]) => {
    try {
        localStorage.setItem('findash_demo_goals', JSON.stringify(goals));
    } catch (e) {
        console.error("Failed to save demo goals to storage", e);
    }
    demoGoalListeners.forEach(cb => cb(goals));
};

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
            if (isNaN(deadlineDate.getTime())) {
                throw new Error("Invalid deadline date");
            }

            if (userId === 'demo-user-123') {
                const current = getDemoGoals();
                const newGoal: Goal = {
                    id: 'demo_goal_' + Date.now(),
                    userId: 'demo-user-123',
                    ...goal,
                    currentAmount: 0,
                    createdAt: Timestamp.now()
                };
                const updated = [newGoal, ...current];
                saveDemoGoals(updated);
                return newGoal.id;
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

    // Subscribe to goals (removes composite index requirement for instant Firestore updates)
    subscribeToGoals: (userId: string, callback: (goals: Goal[]) => void) => {
        if (userId === 'demo-user-123') {
            const current = getDemoGoals();
            callback(current);
            demoGoalListeners.push(callback);
            return () => {
                demoGoalListeners = demoGoalListeners.filter(cb => cb !== callback);
            };
        }

        // Single-field query (where userId == userId) to avoid needing composite index in Firestore
        const q = query(
            collection(db, GOALS_COLLECTION),
            where("userId", "==", userId)
        );

        return onSnapshot(
            q,
            (snapshot) => {
                const goals = snapshot.docs
                    .map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    } as Goal))
                    .sort((a, b) => {
                        const getTimestamp = (g: Goal) => {
                            if (!g.createdAt) return Date.now();
                            if (typeof (g.createdAt as any).toMillis === 'function') {
                                return (g.createdAt as any).toMillis();
                            }
                            if (typeof (g.createdAt as any).seconds === 'number') {
                                return (g.createdAt as any).seconds * 1000;
                            }
                            return Date.now();
                        };
                        return getTimestamp(b) - getTimestamp(a);
                    });
                callback(goals);
            },
            (error) => {
                console.error("Error subscribing to goals:", error);
            }
        );
    },

    // Add funds to a goal
    addFunds: async (goalId: string, currentAmount: number, amountToAdd: number) => {
        try {
            if (amountToAdd <= 0) {
                throw new Error("Amount to add must be positive");
            }

            if (goalId.startsWith('demo_') || goalId.startsWith('g')) {
                const current = getDemoGoals();
                const updated = current.map(g =>
                    g.id === goalId ? { ...g, currentAmount: g.currentAmount + amountToAdd } : g
                );
                saveDemoGoals(updated);
                return;
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
            if (goalId.startsWith('demo_') || goalId.startsWith('g')) {
                const current = getDemoGoals();
                const updated = current.filter(g => g.id !== goalId);
                saveDemoGoals(updated);
                return;
            }

            await deleteDoc(doc(db, GOALS_COLLECTION, goalId));
        } catch (error) {
            console.error("Error deleting goal: ", error);
            throw error;
        }
    }
};
