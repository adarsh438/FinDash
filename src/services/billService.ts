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

        // 1. Improved Grouping (Fuzzy Matching)
        const groups: Record<string, Expense[]> = {};

        expenses.forEach(e => {
            // Normalize: "Netflix.com*123" -> "netflix"
            // Remove digits, special chars, standard suffixes
            let key = e.title.toLowerCase().trim()
                .replace(/[0-9]/g, '')
                .replace(/[\.\*#\-_]/g, ' ')
                .replace(/\s+/g, ' ') // Collapse spaces
                .trim();

            // Common bill keywords to group better
            if (key.includes('netflix')) key = 'netflix';
            if (key.includes('spotify')) key = 'spotify';
            if (key.includes('rent')) key = 'rent';
            if (key.includes('internet') || key.includes('wifi')) key = 'internet';

            if (!groups[key]) groups[key] = [];
            groups[key].push(e);
        });

        const predictions: RecurringBill[] = [];

        // 2. Analyze each group for patterns
        Object.entries(groups).forEach(([key, group]) => {
            if (group.length < 2) return; // Need history

            // Sort newest first
            const sorted = group.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            // Calculate Average Days Between Payments
            let totalDaysDiff = 0;
            let consistencyCount = 0;
            let amountVariance = 0;

            // Avg Amount Calculation
            const totalAmt = group.reduce((sum, item) => sum + Math.abs(item.amount), 0);
            const avgAmt = totalAmt / group.length;

            // Variance in Amounts (Standard Deviation-ish)
            const varianceSum = group.reduce((sum, item) => sum + Math.pow(Math.abs(item.amount) - avgAmt, 2), 0);
            amountVariance = Math.sqrt(varianceSum / group.length) / avgAmt; // Coefficient of variation

            // Date Consistency Check
            for (let i = 0; i < sorted.length - 1; i++) {
                const latest = new Date(sorted[i].date);
                const prev = new Date(sorted[i + 1].date);
                const daysDiff = (latest.getTime() - prev.getTime()) / (1000 * 3600 * 24);

                totalDaysDiff += daysDiff;

                // Check if monthly (25-35 days)
                if (daysDiff >= 25 && daysDiff <= 35) consistencyCount++;
            }

            const avgInterval = totalDaysDiff / (sorted.length - 1);
            const isMonthly = avgInterval >= 25 && avgInterval <= 35;

            // Only predict if it somewhat resembles a monthly bill
            if (isMonthly || consistencyCount > 0) {
                const latestDate = new Date(sorted[0].date);
                const nextDate = new Date(latestDate);
                nextDate.setDate(latestDate.getDate() + Math.round(avgInterval));

                // Calculate Confidence Score (0.0 - 1.0)
                // Factors: History Length, Date Consistency, Amount Consistency
                let score = 0.5; // Base
                if (group.length > 2) score += 0.2;
                if (consistencyCount === sorted.length - 1) score += 0.2; // Perfectly periodic
                if (amountVariance < 0.1) score += 0.1; // Very consistent amount

                predictions.push({
                    id: key,
                    title: sorted[0].title, // Use most recent display name
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
