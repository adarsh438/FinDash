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
    deleteExpense: (id: string) => Promise<void>;
    setBudget: (amount: number) => Promise<void>;
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

    // Derived stats — memoised via useMemo-equivalent inline
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const currentMonthIncome = currentMonthExpenses
        .filter(e => e.category === 'income')
        .reduce((s, e) => s + e.amount, 0);

    const currentMonthSpend = currentMonthExpenses
        .filter(e => e.category !== 'income')
        .reduce((s, e) => s + e.amount, 0);

    const balance = currentMonthIncome - currentMonthSpend;

    const deleteExpense = useCallback(async (id: string) => {
        setRefreshing(true);
        try {
            await expenseService.deleteExpense(id);
        } finally {
            setRefreshing(false);
        }
    }, []);

    const setBudget = useCallback(async (amount: number) => {
        if (!currentUser) return;
        setRefreshing(true);
        try {
            await expenseService.setBudget(currentUser.uid, amount, 'monthly');
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
            deleteExpense,
            setBudget,
        }}>
            {children}
        </ExpenseContext.Provider>
    );
};
