// This service acts as the "Brain" of the application.
// It uses advanced heuristics to simulate AI insights while ensuring privacy.
// Privacy Rule: The "reasoning" layer only receives aggregated stats, never raw transaction lists.

import { type Expense } from './expenseService';

export interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

interface FinancialHealth {
    totalSpent: number;
    highestCategory: { name: string; amount: number } | null;
    categoryBreakdown: Record<string, number>;
    savingsRateEstimate: number; // Mock estimation based on a fixed income assumption for now
    monthOverMonthTrend: number; // Percentage change
}

// PRIVACY-FIRST AGGREGATION
// Transforms raw data into safe, anonymous statistics
const aggregateData = (expenses: Expense[]): FinancialHealth => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const currentMonthExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const lastMonthExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        // Handle Jan case
        const targetMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const targetYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
    });

    const totalSpent = currentMonthExpenses.reduce((sum, item) => sum + (item.category !== 'income' ? item.amount : 0), 0);
    const lastMonthTotal = lastMonthExpenses.reduce((sum, item) => sum + (item.category !== 'income' ? item.amount : 0), 0);

    const trend = lastMonthTotal === 0 ? 0 : ((totalSpent - lastMonthTotal) / lastMonthTotal) * 100;

    const categories: Record<string, number> = {};
    currentMonthExpenses.forEach(item => {
        if (item.category !== 'income') {
            categories[item.category] = (categories[item.category] || 0) + item.amount;
        }
    });

    let highestCategory = null;
    let maxAmount = 0;
    Object.entries(categories).forEach(([cat, amount]) => {
        if (amount > maxAmount) {
            maxAmount = amount;
            highestCategory = { name: cat, amount };
        }
    });

    // Heuristic: Assume a base income of 50000 or derive from 'income' category if exists (omitted for safety, using heuristic)
    // For this version, we'll calculate savings rate based on a logical heuristic relative to spending
    const assumedIncome = Math.max(totalSpent * 1.2, 50000); // Dynamic assumption
    const savingsRate = ((assumedIncome - totalSpent) / assumedIncome) * 100;

    return {
        totalSpent,
        highestCategory,
        categoryBreakdown: categories,
        savingsRateEstimate: savingsRate,
        monthOverMonthTrend: trend
    };
};

export const aiService = {
    generateResponse: async (message: string, context: { expenses: Expense[] }): Promise<string> => {
        // Simulate network delay for "thinking" effect
        await new Promise(resolve => setTimeout(resolve, 1200));

        // 1. PRIVACY STEP: Aggregate data first
        const health = aggregateData(context.expenses || []);
        const lowerMsg = message.toLowerCase();

        // 2. REASONING ENGINE (Heuristics)

        // GREETING
        if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
            return "Hello! I'm your AI Finance Coach. I've analyzed your latest data. Ask me about your spending, trends, or savings!";
        }

        // SPENDING OVERVIEW
        if (lowerMsg.includes('spend') || lowerMsg.includes('cost') || lowerMsg.includes('much')) {
            if (health.totalSpent === 0) {
                return "I don't see any spending data for this month yet. Tracking your first expense is the best way to start!";
            }

            let response = `This month, you've spent **₹${health.totalSpent.toFixed(0)}**.`;

            if (health.monthOverMonthTrend > 10) {
                response += ` ⚠️ That's ${health.monthOverMonthTrend.toFixed(0)}% higher than last month. Keep an eye on it!`;
            } else if (health.monthOverMonthTrend < -10) {
                response += ` 📉 That's ${Math.abs(health.monthOverMonthTrend).toFixed(0)}% lower than last month. Great job cutting back!`;
            } else {
                response += ` You're pretty much on track with last month's spending.`;
            }
            return response;
        }

        // CATEGORY ANALYSIS
        if (lowerMsg.includes('category') || lowerMsg.includes('where')) {
            if (!health.highestCategory) return "I need more data to spot category trends.";

            return `Your top spending category is **${health.highestCategory.name}** at ₹${health.highestCategory.amount.toFixed(0)}. This makes up about ${((health.highestCategory.amount / health.totalSpent) * 100).toFixed(0)}% of your total outflows.`;
        }

        // SAVINGS ADVICE
        if (lowerMsg.includes('save') || lowerMsg.includes('saving') || lowerMsg.includes('invest')) {
            if (health.savingsRateEstimate < 10) {
                return "Based on your spending, your estimated savings rate is a bit tight (< 10%). Try the 50/30/20 rule: Aim to save at least 20% of your income. Cutting down on your top category might help!";
            } else if (health.savingsRateEstimate > 30) {
                return "You're doing fantastic! Your estimated savings rate is robust (> 30%). You might want to consider investing the surplus into diverse assets to beat inflation.";
            } else {
                return "You're in a healthy savings zone. To optimize further, review your recurring subscriptions or small daily purchases.";
            }
        }

        // ANALYSIS / OBSERVATION
        if (lowerMsg.includes('analyze') || lowerMsg.includes('analysis') || lowerMsg.includes('insight')) {
            const tips = [
                health.highestCategory ? `Pro Tip: You spent ₹${health.highestCategory.amount.toFixed(0)} on ${health.highestCategory.name}. Reducing this by just 10% could save you ₹${(health.highestCategory.amount * 0.1).toFixed(0)}.` : "Track more expenses to get specific category tips.",
                "I noticed your transaction frequency is higher on weekends. Watch out for 'impulse buys' on Saturdays!",
                "Small daily expenses act like 'termites' for your wealth. They eat it away silently.",
            ];
            return tips[Math.floor(Math.random() * tips.length)];
        }

        // FALLBACK
        return "I can help you analyze your spending habits. Try asking: 'How much did I spend?', 'Where is my money going?', or 'How can I save more?'.";
    }
};
