import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { expenseService, type Expense, type Budget } from '../services/expenseService';
import { useAuth } from './AuthContext';

interface ExpenseContextType {
    expenses: Expense[];
    budget: Budget | null;
    loading: boolean;
    refreshing: boolean;
    currentMonthExpenses: Expense[];
    currentMonthIncome: number;
    currentMonthSpend: number;
    balance: number;
    safeToSpend: number;
    deleteExpense: (id: string) => Promise<void>;
    updateExpense: (id: string, data: Partial<Expense>) => Promise<void>;
    duplicateExpense: (expense: Expense) => Promise<string | undefined>;
    setBudget: (amount: number) => Promise<void>;
    setCategoryBudgets: (categoryBudgets: Record<string, number>) => Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const useExpenses = (): ExpenseContextType => {
    const ctx = useContext(ExpenseContext);
    if (!ctx) throw new Error('useExpenses must be used within ExpenseProvider');
    return ctx;
};

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [budget, setBudgetState] = useState<Budget | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (!currentUser) {
            setExpenses([]);
            setBudgetState(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        const safetyTimer = setTimeout(() => setLoading(false), 6000);

        const unsubExpenses = expenseService.subscribeToExpenses(currentUser.uid, (data) => {
            setExpenses(data);
            setLoading(false);
            clearTimeout(safetyTimer);
        });

        const unsubBudget = expenseService.subscribeToBudget(currentUser.uid, (data) => {
            setBudgetState(data);
        });

        return () => {
            unsubExpenses();
            unsubBudget();
            clearTimeout(safetyTimer);
        };
    }, [currentUser]);

    // Derived stats
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const currentMonthIncome = currentMonthExpenses
        .filter(e => e.type === 'income' || e.category === 'income')
        .reduce((s, e) => s + e.amount, 0);

    const currentMonthSpend = currentMonthExpenses
        .filter(e => e.type !== 'income' && e.category !== 'income')
        .reduce((s, e) => s + e.amount, 0);

    const balance = currentMonthIncome - currentMonthSpend;

    // Safe to Spend = Total Monthly Budget + Income - Current Month Spend
    const totalBudget = budget?.amount || 0;
    const safeToSpend = Math.max(0, (totalBudget + currentMonthIncome) - currentMonthSpend);

    const deleteExpense = useCallback(async (id: string) => {
        setRefreshing(true);
        try {
            await expenseService.deleteExpense(id);
        } finally {
            setRefreshing(false);
        }
    }, []);

    const updateExpense = useCallback(async (id: string, data: Partial<Expense>) => {
        setRefreshing(true);
        try {
            await expenseService.updateExpense(id, data);
        } finally {
            setRefreshing(false);
        }
    }, []);

    const duplicateExpense = useCallback(async (expense: Expense) => {
        if (!currentUser) return;
        setRefreshing(true);
        try {
            return await expenseService.duplicateExpense(currentUser.uid, expense);
        } finally {
            setRefreshing(false);
        }
    }, [currentUser]);

    const setBudget = useCallback(async (amount: number) => {
        if (!currentUser) return;
        setRefreshing(true);
        try {
            await expenseService.setBudget(currentUser.uid, amount, 'monthly');
        } finally {
            setRefreshing(false);
        }
    }, [currentUser]);

    const setCategoryBudgets = useCallback(async (categoryBudgets: Record<string, number>) => {
        if (!currentUser) return;
        setRefreshing(true);
        try {
            await expenseService.setCategoryBudgets(currentUser.uid, categoryBudgets);
        } finally {
            setRefreshing(false);
        }
    }, [currentUser]);

    return (
        <ExpenseContext.Provider value={{
            expenses,
            budget,
            loading,
            refreshing,
            currentMonthExpenses,
            currentMonthIncome,
            currentMonthSpend,
            balance,
            safeToSpend,
            deleteExpense,
            updateExpense,
            duplicateExpense,
            setBudget,
            setCategoryBudgets,
        }}>
            {children}
        </ExpenseContext.Provider>
    );
};
