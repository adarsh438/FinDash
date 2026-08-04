import { type Expense } from './expenseService';

export interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

export interface FinancialHealthScore {
    score: number; // 0 - 100
    rating: 'Poor' | 'Fair' | 'Good' | 'Excellent';
    breakdown: {
        budgetAdherence: number;
        savingsRate: number;
        spendingConsistency: number;
    };
    recommendation: string;
}

interface AggregateResult {
    totalSpent: number;
    totalIncome: number;
    highestCategory: { name: string; amount: number } | null;
    categoryBreakdown: Record<string, number>;
    savingsRateEstimate: number;
    monthOverMonthTrend: number;
}

const aggregateData = (expenses: Expense[]): AggregateResult => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const currentMonthExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const lastMonthExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        const targetMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const targetYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
    });

    const totalIncome = currentMonthExpenses
        .filter(e => e.type === 'income' || e.category === 'income')
        .reduce((sum, item) => sum + item.amount, 0);

    const totalSpent = currentMonthExpenses
        .filter(e => e.type !== 'income' && e.category !== 'income')
        .reduce((sum, item) => sum + item.amount, 0);

    const lastMonthTotal = lastMonthExpenses
        .filter(e => e.type !== 'income' && e.category !== 'income')
        .reduce((sum, item) => sum + item.amount, 0);

    const trend = lastMonthTotal === 0 ? 0 : ((totalSpent - lastMonthTotal) / lastMonthTotal) * 100;

    const categories: Record<string, number> = {};
    currentMonthExpenses.forEach(item => {
        if (item.type !== 'income' && item.category !== 'income') {
            categories[item.category] = (categories[item.category] || 0) + item.amount;
        }
    });

    let highestCategory: { name: string; amount: number } | null = null;
    let maxAmount = 0;
    Object.entries(categories).forEach(([cat, amount]) => {
        if (amount > maxAmount) {
            maxAmount = amount;
            highestCategory = { name: cat, amount };
        }
    });

    const assumedIncome = totalIncome > 0 ? totalIncome : Math.max(totalSpent * 1.25, 50000);
    const savingsRate = assumedIncome > 0 ? Math.max(0, ((assumedIncome - totalSpent) / assumedIncome) * 100) : 0;

    return {
        totalSpent,
        totalIncome,
        highestCategory,
        categoryBreakdown: categories,
        savingsRateEstimate: savingsRate,
        monthOverMonthTrend: trend
    };
};

export const aiService = {
    // Calculate 0-100 Financial Health Score
    calculateHealthScore: (expenses: Expense[], budgetAmount: number = 0): FinancialHealthScore => {
        const data = aggregateData(expenses);

        let budgetScore = 80;
        if (budgetAmount > 0) {
            const ratio = data.totalSpent / budgetAmount;
            if (ratio <= 0.8) budgetScore = 100;
            else if (ratio <= 1.0) budgetScore = 80;
            else if (ratio <= 1.2) budgetScore = 50;
            else budgetScore = 20;
        }

        let savingsScore = 60;
        if (data.savingsRateEstimate >= 30) savingsScore = 100;
        else if (data.savingsRateEstimate >= 20) savingsScore = 85;
        else if (data.savingsRateEstimate >= 10) savingsScore = 65;
        else savingsScore = 30;

        let consistencyScore = 80;
        if (data.monthOverMonthTrend > 25) consistencyScore = 40;
        else if (data.monthOverMonthTrend < -10) consistencyScore = 95;

        const overall = Math.round((budgetScore * 0.4) + (savingsScore * 0.4) + (consistencyScore * 0.2));

        let rating: FinancialHealthScore['rating'] = 'Good';
        let recommendation = 'Your financial health is stable. Keep tracking regularly!';

        if (overall >= 85) {
            rating = 'Excellent';
            recommendation = 'Outstanding money management! Consider investing extra savings into long-term assets.';
        } else if (overall >= 70) {
            rating = 'Good';
            recommendation = 'You are on a strong track. A tiny reduction in discretionary spending will boost your savings further.';
        } else if (overall >= 50) {
            rating = 'Fair';
            recommendation = 'Your budget is a bit tight this month. Try setting strict category budgets for food and entertainment.';
        } else {
            rating = 'Poor';
            recommendation = 'Spending exceeds optimal thresholds. Review top category outflows to avoid debt accumulation.';
        }

        return {
            score: overall,
            rating,
            breakdown: {
                budgetAdherence: Math.round(budgetScore),
                savingsRate: Math.round(savingsScore),
                spendingConsistency: Math.round(consistencyScore)
            },
            recommendation
        };
    },

    generateResponse: async (message: string, context: { expenses: Expense[] }): Promise<string> => {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const health = aggregateData(context.expenses || []);
        const lowerMsg = message.toLowerCase();

        if (lowerMsg.includes('hello') || lowerMsg.includes('hi') || lowerMsg.includes('hey')) {
            return "Hello! I'm your AI Finance Coach. Ask me about your spending, health score, or savings strategies!";
        }

        if (lowerMsg.includes('spend') || lowerMsg.includes('cost') || lowerMsg.includes('much')) {
            if (health.totalSpent === 0) {
                return "I don't see any spending data for this month yet. Log your first expense to get real-time insights!";
            }

            let response = `This month, you've spent **₹${health.totalSpent.toFixed(0)}**.`;
            if (health.monthOverMonthTrend > 10) {
                response += ` ⚠️ That's ${health.monthOverMonthTrend.toFixed(0)}% higher than last month.`;
            } else if (health.monthOverMonthTrend < -10) {
                response += ` 📉 That's ${Math.abs(health.monthOverMonthTrend).toFixed(0)}% lower than last month. Great job!`;
            } else {
                response += ` Your spending is consistent with last month.`;
            }
            return response;
        }

        if (lowerMsg.includes('save') || lowerMsg.includes('saving') || lowerMsg.includes('invest')) {
            if (health.savingsRateEstimate < 10) {
                return "Your estimated savings rate is below 10%. Try the 50/30/20 budget framework: Allocate 50% for needs, 30% for wants, and 20% directly into savings.";
            } else {
                return `Great job! Your savings rate is around **${health.savingsRateEstimate.toFixed(0)}%**. Consider investing surplus funds into index funds or SIPs.`;
            }
        }

        if (lowerMsg.includes('category') || lowerMsg.includes('where') || lowerMsg.includes('spent on')) {
            const topCat = health.highestCategory;
            if (!topCat) return "I need more expense records to determine category breakdowns.";
            return `Your largest spending category is **${topCat.name}** at ₹${topCat.amount.toFixed(0)}, comprising ${((topCat.amount / health.totalSpent) * 100).toFixed(0)}% of total outflows.`;
        }

        return "I analyzed your financial metrics. Ask me: 'How much did I spend?', 'What is my top category?', or 'How can I increase my savings?'.";
    }
};
