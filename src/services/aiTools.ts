import { type Expense } from './expenseService';
import { type Goal } from './goalService';
import { type CustomBill } from './billService';

export interface Budget {
    amount: number;
    category?: string;
    month?: string;
}

export interface UserFinancialData {
    expenses: Expense[];
    goals: Goal[];
    bills: CustomBill[];
    budget?: Budget | null;
}

export interface FinancialToolResult {
    toolName: string;
    description: string;
    data: any;
}

export const aiTools = {
    // 1. Get transactions with filtering
    get_transactions: (data: UserFinancialData, params?: { startDate?: string; endDate?: string; category?: string; minAmount?: number; maxAmount?: number; type?: 'income' | 'expense' }) => {
        let result = [...data.expenses];
        if (params?.type === 'income') {
            result = result.filter(e => e.type === 'income' || e.category === 'income');
        } else if (params?.type === 'expense') {
            result = result.filter(e => e.type !== 'income' && e.category !== 'income');
        }

        if (params?.category) {
            const catLower = params.category.toLowerCase();
            result = result.filter(e => e.category.toLowerCase().includes(catLower));
        }

        if (params?.startDate) {
            result = result.filter(e => e.date >= params.startDate!);
        }

        if (params?.endDate) {
            result = result.filter(e => e.date <= params.endDate!);
        }

        if (params?.minAmount !== undefined) {
            result = result.filter(e => e.amount >= params.minAmount!);
        }

        if (params?.maxAmount !== undefined) {
            result = result.filter(e => e.amount <= params.maxAmount!);
        }

        return {
            count: result.length,
            totalAmount: result.reduce((sum, e) => sum + e.amount, 0),
            transactions: result.slice(0, 50)
        };
    },

    // 2. Transaction summary for current/previous month
    get_transaction_summary: (data: UserFinancialData, period: 'current_month' | 'last_month' | 'all' = 'current_month') => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        let filtered = data.expenses;
        if (period === 'current_month') {
            filtered = data.expenses.filter(e => {
                const d = new Date(e.date);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            });
        } else if (period === 'last_month') {
            const targetMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const targetYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            filtered = data.expenses.filter(e => {
                const d = new Date(e.date);
                return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
            });
        }

        const income = filtered
            .filter(e => e.type === 'income' || e.category === 'income')
            .reduce((sum, e) => sum + e.amount, 0);

        const expenses = filtered
            .filter(e => e.type !== 'income' && e.category !== 'income')
            .reduce((sum, e) => sum + e.amount, 0);

        return {
            period,
            totalIncome: income,
            totalExpenses: expenses,
            netSavings: income - expenses,
            transactionCount: filtered.length
        };
    },

    // 3. Category spending breakdown
    get_expense_by_category: (data: UserFinancialData, category?: string) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const currentMonthExpenses = data.expenses.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear && e.type !== 'income' && e.category !== 'income';
        });

        const categoryTotals: Record<string, { total: number; count: number }> = {};
        let grandTotal = 0;

        currentMonthExpenses.forEach(e => {
            const cat = e.category || 'uncategorized';
            if (!categoryTotals[cat]) {
                categoryTotals[cat] = { total: 0, count: 0 };
            }
            categoryTotals[cat].total += e.amount;
            categoryTotals[cat].count += 1;
            grandTotal += e.amount;
        });

        if (category) {
            const match = Object.entries(categoryTotals).find(([c]) => c.toLowerCase() === category.toLowerCase());
            return {
                requestedCategory: category,
                spent: match ? match[1].total : 0,
                transactionCount: match ? match[1].count : 0,
                percentageOfTotal: match && grandTotal > 0 ? ((match[1].total / grandTotal) * 100).toFixed(1) + '%' : '0%'
            };
        }

        const sorted = Object.entries(categoryTotals)
            .map(([cat, stats]) => ({
                category: cat,
                amount: stats.total,
                percentage: grandTotal > 0 ? ((stats.total / grandTotal) * 100).toFixed(1) + '%' : '0%'
            }))
            .sort((a, b) => b.amount - a.amount);

        return {
            totalSpent: grandTotal,
            categories: sorted
        };
    },

    // 4. Income Summary
    get_income_summary: (data: UserFinancialData) => {
        const incomes = data.expenses.filter(e => e.type === 'income' || e.category === 'income');
        const totalIncome = incomes.reduce((sum, e) => sum + e.amount, 0);

        return {
            totalIncome,
            recentIncomes: incomes.slice(0, 10)
        };
    },

    // 5. Month over Month comparison
    get_monthly_comparison: (data: UserFinancialData) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

        const currentMonthSpent = data.expenses
            .filter(e => {
                const d = new Date(e.date);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear && e.type !== 'income' && e.category !== 'income';
            })
            .reduce((sum, e) => sum + e.amount, 0);

        const prevMonthSpent = data.expenses
            .filter(e => {
                const d = new Date(e.date);
                return d.getMonth() === prevMonth && d.getFullYear() === prevYear && e.type !== 'income' && e.category !== 'income';
            })
            .reduce((sum, e) => sum + e.amount, 0);

        const diff = currentMonthSpent - prevMonthSpent;
        const percentageChange = prevMonthSpent === 0 ? 0 : ((diff / prevMonthSpent) * 100);

        return {
            currentMonthSpent,
            prevMonthSpent,
            difference: diff,
            percentageChange: percentageChange.toFixed(1) + '%',
            isIncreased: diff > 0
        };
    },

    // 6. Budget Status
    get_budget_status: (data: UserFinancialData) => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const currentMonthSpent = data.expenses
            .filter(e => {
                const d = new Date(e.date);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear && e.type !== 'income' && e.category !== 'income';
            })
            .reduce((sum, e) => sum + e.amount, 0);

        const budgetLimit = data.budget?.amount || 0;
        const remaining = Math.max(0, budgetLimit - currentMonthSpent);
        const percentageUsed = budgetLimit > 0 ? (currentMonthSpent / budgetLimit) * 100 : 0;

        const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const currentDay = now.getDate();
        const daysRemaining = totalDaysInMonth - currentDay;

        return {
            budgetLimit,
            currentMonthSpent,
            remaining,
            percentageUsed: percentageUsed.toFixed(1) + '%',
            isOverBudget: currentMonthSpent > budgetLimit && budgetLimit > 0,
            daysRemaining
        };
    },

    // 7. Goals Overview
    get_goals: (data: UserFinancialData) => {
        const goals = data.goals.map(g => {
            const progress = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
            return {
                id: g.id,
                title: g.title,
                targetAmount: g.targetAmount,
                currentAmount: g.currentAmount,
                remaining: g.targetAmount - g.currentAmount,
                progressPercentage: progress.toFixed(1) + '%',
                deadline: g.deadline,
                isCompleted: g.currentAmount >= g.targetAmount
            };
        });

        return {
            totalGoals: goals.length,
            completedGoals: goals.filter(g => g.isCompleted).length,
            goals
        };
    },

    // 8. Single Goal Progress Calculation
    get_goal_progress: (data: UserFinancialData, goalTitleOrId?: string) => {
        if (!goalTitleOrId) return aiTools.get_goals(data);

        const target = data.goals.find(g =>
            g.id === goalTitleOrId || g.title.toLowerCase().includes(goalTitleOrId.toLowerCase())
        );

        if (!target) return { error: `Goal "${goalTitleOrId}" not found.` };

        const remaining = target.targetAmount - target.currentAmount;
        const progress = Math.min((target.currentAmount / target.targetAmount) * 100, 100);

        const deadlineDate = new Date(target.deadline);
        const monthsLeft = Math.max(1, Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 3600 * 24 * 30)));
        const monthlyNeeded = remaining > 0 ? remaining / monthsLeft : 0;

        return {
            title: target.title,
            currentAmount: target.currentAmount,
            targetAmount: target.targetAmount,
            remaining,
            progressPercentage: progress.toFixed(1) + '%',
            deadline: target.deadline,
            monthlySavingsNeeded: monthlyNeeded.toFixed(0)
        };
    },

    // 9. Upcoming Bills
    get_upcoming_bills: (data: UserFinancialData, daysAhead: number = 30) => {
        const now = Date.now();

        const upcoming = data.bills
            .filter(b => !b.isPaid)
            .map(b => {
                const dueTime = new Date(b.dueDate).getTime();
                const daysLeft = Math.ceil((dueTime - now) / 86400000);
                return {
                    id: b.id,
                    title: b.title,
                    amount: b.amount,
                    dueDate: b.dueDate,
                    daysLeft,
                    frequency: b.frequency
                };
            })
            .filter(b => b.daysLeft <= daysAhead)
            .sort((a, b) => a.daysLeft - b.daysLeft);

        return {
            count: upcoming.length,
            totalDue: upcoming.reduce((sum, b) => sum + b.amount, 0),
            bills: upcoming
        };
    },

    // 10. Bills summary
    get_bill_summary: (data: UserFinancialData) => {
        const totalBills = data.bills.length;
        const paidBills = data.bills.filter(b => b.isPaid);
        const unpaidBills = data.bills.filter(b => !b.isPaid);

        return {
            totalBills,
            paidCount: paidBills.length,
            unpaidCount: unpaidBills.length,
            unpaidTotalAmount: unpaidBills.reduce((sum, b) => sum + b.amount, 0),
            paidTotalAmount: paidBills.reduce((sum, b) => sum + b.amount, 0)
        };
    },

    // 11. Search transactions
    search_transactions: (data: UserFinancialData, queryStr: string) => {
        const q = queryStr.toLowerCase().trim();
        const matches = data.expenses.filter(e =>
            e.title.toLowerCase().includes(q) ||
            e.category.toLowerCase().includes(q) ||
            (e.notes && e.notes.toLowerCase().includes(q))
        );

        return {
            query: queryStr,
            matchCount: matches.length,
            totalSpent: matches.reduce((sum, e) => sum + e.amount, 0),
            matches: matches.slice(0, 20)
        };
    },

    // 12. Complete financial snapshot
    get_financial_snapshot: (data: UserFinancialData) => {
        const summary = aiTools.get_transaction_summary(data, 'current_month');
        const categories = aiTools.get_expense_by_category(data);
        const comparison = aiTools.get_monthly_comparison(data);
        const budget = aiTools.get_budget_status(data);
        const goals = aiTools.get_goals(data);
        const bills = aiTools.get_upcoming_bills(data, 14);

        return {
            currentMonthSummary: summary,
            topCategories: (categories.categories || []).slice(0, 5),
            monthOverMonth: comparison,
            budget,
            goalsOverview: { total: goals.totalGoals, completed: goals.completedGoals },
            upcomingBills: bills
        };
    }
};
