// This service effectively acts as the "Brain" of the application.
// In a real production app, this would call an OpenAI/Gemini API via a backend proxy to hide keys.
// For now, we will simulate "AI" behavior with advanced heuristics and predefined rules.

import { type Expense } from './expenseService';

export interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

const analyzeExpenses = (expenses: Expense[]) => {
    const total = expenses.reduce((sum, item) => sum + (item.category !== 'income' ? item.amount : 0), 0);
    const categories = expenses.reduce((acc, item) => {
        if (item.category !== 'income') {
            acc[item.category] = (acc[item.category] || 0) + item.amount;
        }
        return acc;
    }, {} as Record<string, number>);

    // Find highest spending category
    const highestCategory = Object.entries(categories).sort(([, a], [, b]) => b - a)[0]; // [category, amount]

    return { total, highestCategory };
};

export const aiService = {
    generateResponse: async (message: string, context: { expenses: Expense[] }): Promise<string> => {
        // Simulate network delay for "thinking" effect
        await new Promise(resolve => setTimeout(resolve, 1500));

        const lowerMsg = message.toLowerCase();
        const { total, highestCategory } = analyzeExpenses(context.expenses || []);

        // 1. Greeting
        if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
            return "Hello! I'm your personal finance coach. How can I help you manage your money today?";
        }

        // 2. Spending Analysis
        if (lowerMsg.includes('spend') || lowerMsg.includes('expenses')) {
            if (context.expenses.length === 0) {
                return "I don't see any expenses recorded yet. Try adding some transactions so I can analyze your spending!";
            }

            let response = `You've spent a total of $${total.toFixed(2)} recently.`;

            if (highestCategory) {
                response += ` Your highest spending category is **${highestCategory[0]}** ($${highestCategory[1].toFixed(2)}).`;

                if (highestCategory[0] === 'food') {
                    response += " 🍔 Eating out adds up! Maybe try cooking at home twice a week to save ~20%.";
                } else if (highestCategory[0] === 'shopping') {
                    response += " 🛍️ Retail therapy? Remember the 24-hour rule before big purchases!";
                }
            }
            return response;
        }

        // 3. Savings Advice
        if (lowerMsg.includes('save') || lowerMsg.includes('budget')) {
            return "To start saving, aim for the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Based on your current spending, try to set aside 10% of your income this month.";
        }

        // 4. Fallback / General Advice
        const tips = [
            "Track every dollar. Small leaks sink great ships! 🚢",
            "Have you checked your subscriptions recently? Cancel unused ones to save instantly.",
            "Try to keep your emergency fund equal to 3-6 months of expenses.",
            "Investing early allows compound interest to work its magic. 🪄"
        ];
        return tips[Math.floor(Math.random() * tips.length)];
    }
};
