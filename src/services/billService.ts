import { type Expense } from './expenseService';

export interface RecurringBill {
    id: string;
    title: string;
    averageAmount: number;
    nextDueDate: Date;
    frequency: 'monthly' | 'weekly' | 'irregular';
    confidence: number; // 0-1 score
}

export const billService = {
    predictBills: (expenses: Expense[]): RecurringBill[] => {
        if (expenses.length === 0) return [];

        // 1. Group by Title (Simple normalization)
        const groups: Record<string, Expense[]> = {};
        expenses.forEach(e => {
            // Simple normalization: "Netflix 01" -> "netflix"
            const key = e.title.toLowerCase().trim().replace(/[0-9]/g, '');
            if (!groups[key]) groups[key] = [];
            groups[key].push(e);
        });

        const predictions: RecurringBill[] = [];

        // 2. Analyze Groups
        Object.entries(groups).forEach(([key, group]) => {
            if (group.length < 2) return; // Need at least 2 history points

            // Sort by date desc
            const sorted = group.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            // Calculate Interval
            const latest = new Date(sorted[0].date);
            const previous = new Date(sorted[1].date);
            const daysDiff = (latest.getTime() - previous.getTime()) / (1000 * 3600 * 24);

            // Is it roughly monthly? (25-35 days)
            if (daysDiff >= 25 && daysDiff <= 35) {
                // Predict next date
                const nextDate = new Date(latest);
                nextDate.setDate(latest.getDate() + Math.round(daysDiff));

                // Avg Amount
                const totalAmt = group.reduce((sum, item) => sum + Math.abs(item.amount), 0);
                const avg = totalAmt / group.length;

                predictions.push({
                    id: key,
                    title: group[0].title, // Use original title display
                    averageAmount: avg,
                    nextDueDate: nextDate,
                    frequency: 'monthly',
                    confidence: 0.8
                });
            }
        });

        // Sort by upcoming date
        return predictions.sort((a, b) => a.nextDueDate.getTime() - b.nextDueDate.getTime());
    }
};
