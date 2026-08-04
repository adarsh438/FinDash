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
import { expenseService, type Expense } from './expenseService';

export interface CustomBill {
    id?: string;
    userId: string;
    title: string;
    amount: number;
    dueDate: string; // ISO Date YYYY-MM-DD
    frequency: 'monthly' | 'weekly' | 'yearly';
    isPaid: boolean;
    paidAt?: string;
    createdAt: Timestamp;
}

export interface RecurringBill {
    id: string;
    title: string;
    averageAmount: number;
    nextDueDate: Date;
    frequency: 'monthly' | 'weekly' | 'irregular';
    confidence: number;
    isPaid?: boolean;
}

const BILLS_COLLECTION = 'bills';

export const billService = {
    // Add custom bill
    addBill: async (userId: string, bill: Omit<CustomBill, 'id' | 'userId' | 'createdAt' | 'isPaid'>) => {
        try {
            const docRef = await addDoc(collection(db, BILLS_COLLECTION), {
                ...bill,
                userId,
                isPaid: false,
                createdAt: Timestamp.now()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error adding bill: ", error);
            throw error;
        }
    },

    // Subscribe to custom bills
    subscribeToBills: (userId: string, callback: (bills: CustomBill[]) => void) => {
        const q = query(
            collection(db, BILLS_COLLECTION),
            where("userId", "==", userId),
            orderBy("dueDate", "asc")
        );

        return onSnapshot(q, (snapshot) => {
            const bills = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CustomBill));
            callback(bills);
        });
    },

    // Mark bill as paid & record transaction automatically
    markBillPaid: async (userId: string, billId: string, amount: number, title: string) => {
        try {
            // 1. Update bill document if custom bill
            if (billId && !billId.startsWith('predicted-')) {
                const billRef = doc(db, BILLS_COLLECTION, billId);
                await updateDoc(billRef, {
                    isPaid: true,
                    paidAt: new Date().toISOString()
                });
            }

            // 2. Record transaction in expenses
            await expenseService.addExpense(userId, {
                title: `Bill: ${title}`,
                amount,
                category: 'rent', // Default to rent/bill category
                date: new Date().toISOString().split('T')[0],
                notes: 'Automated payment from Bills module'
            });
        } catch (error) {
            console.error("Error marking bill paid: ", error);
            throw error;
        }
    },

    // Delete custom bill
    deleteBill: async (billId: string) => {
        try {
            await deleteDoc(doc(db, BILLS_COLLECTION, billId));
        } catch (error) {
            console.error("Error deleting bill: ", error);
            throw error;
        }
    },

    // Algorithmic Prediction Engine for past expenses
    predictBills: (expenses: Expense[]): RecurringBill[] => {
        if (expenses.length === 0) return [];

        const groups: Record<string, Expense[]> = {};

        expenses.forEach(e => {
            let key = e.title.toLowerCase().trim()
                .replace(/[0-9]/g, '')
                .replace(/[\.\*#\-_]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();

            if (key.includes('netflix')) key = 'netflix';
            if (key.includes('spotify')) key = 'spotify';
            if (key.includes('rent')) key = 'rent';
            if (key.includes('internet') || key.includes('wifi')) key = 'internet';

            if (!groups[key]) groups[key] = [];
            groups[key].push(e);
        });

        const predictions: RecurringBill[] = [];

        Object.entries(groups).forEach(([key, group]) => {
            if (group.length < 2) return;

            const sorted = group.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            let totalDaysDiff = 0;
            let consistencyCount = 0;

            const totalAmt = group.reduce((sum, item) => sum + Math.abs(item.amount), 0);
            const avgAmt = totalAmt / group.length;

            const varianceSum = group.reduce((sum, item) => sum + Math.pow(Math.abs(item.amount) - avgAmt, 2), 0);
            const amountVariance = Math.sqrt(varianceSum / group.length) / avgAmt;

            for (let i = 0; i < sorted.length - 1; i++) {
                const latest = new Date(sorted[i].date);
                const prev = new Date(sorted[i + 1].date);
                const daysDiff = (latest.getTime() - prev.getTime()) / (1000 * 3600 * 24);

                totalDaysDiff += daysDiff;
                if (daysDiff >= 25 && daysDiff <= 35) consistencyCount++;
            }

            const avgInterval = totalDaysDiff / (sorted.length - 1);
            const isMonthly = avgInterval >= 25 && avgInterval <= 35;

            if (isMonthly || consistencyCount > 0) {
                const latestDate = new Date(sorted[0].date);
                const nextDate = new Date(latestDate);
                nextDate.setDate(latestDate.getDate() + Math.round(avgInterval));

                let score = 0.5;
                if (group.length > 2) score += 0.2;
                if (consistencyCount === sorted.length - 1) score += 0.2;
                if (amountVariance < 0.1) score += 0.1;

                predictions.push({
                    id: `predicted-${key}`,
                    title: sorted[0].title,
                    averageAmount: avgAmt,
                    nextDueDate: nextDate,
                    frequency: 'monthly',
                    confidence: Math.min(score, 1.0)
                });
            }
        });

        return predictions.sort((a, b) => a.nextDueDate.getTime() - b.nextDueDate.getTime());
    }
};
