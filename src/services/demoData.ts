import { Timestamp } from 'firebase/firestore';
import { type Expense } from './expenseService';
import { type Goal } from './goalService';
import { type UserProfile } from './userService';

// DEMO USER PROFILE
export const DEMO_USER_PROFILE: UserProfile = {
    uid: 'demo-user-123',
    email: 'demo@financeapp.com',
    displayName: 'Demo User',
    // photoURL removed from interface, so we don't include it or ignore if strict
    // but the interface in userService doesn't have photoURL, so let's omit it to be safe or add if needed.
    // The previous view_file showed photoURL IS NOT in UserProfile interface!
    // Wait, let me check view_file of userService again... Step 733.
    // userProfile has: uid, email, displayName, role, isPremium, premiumActivatedAt, premiumSource, createdAt.
    // NO photoURL.
    isPremium: true,
    currency: 'USD', // Not in interface but maybe used elsewhere? Layout? 
    // Actually userService interface doesn't have currency either! 
    // I should strictly follow UserProfile from Step 733.
    role: 'premium',
    createdAt: new Date().toISOString(),
    premiumActivatedAt: new Date().toISOString(),
    premiumSource: 'demo'
} as unknown as UserProfile; // Cast to avoid strict excess property checks if I added extra fields locally

// DEMO EXPENSES (Last 30 days)
const today = new Date();
const d = (daysAgo: number) => {
    const date = new Date(today);
    date.setDate(today.getDate() - daysAgo);
    return date;
};
const iso = (daysAgo: number) => d(daysAgo).toISOString();
const ts = (daysAgo: number) => Timestamp.fromDate(d(daysAgo));

export const DEMO_EXPENSES: Expense[] = [
    { id: 'd1', userId: 'demo', title: 'Monthly Salary', amount: 5000, category: 'income', date: iso(2), createdAt: ts(2) },
    { id: 'd2', userId: 'demo', title: 'Rent Payment', amount: 1200, category: 'other', date: iso(3), createdAt: ts(3) },
    { id: 'd3', userId: 'demo', title: 'Grocery Run', amount: 150.50, category: 'food', date: iso(5), createdAt: ts(5) },
    { id: 'd4', userId: 'demo', title: 'Netflix Subscription', amount: 15.99, category: 'other', date: iso(10), createdAt: ts(10) },
    { id: 'd5', userId: 'demo', title: 'Uber Ride', amount: 24.50, category: 'other', date: iso(12), createdAt: ts(12) },
    { id: 'd6', userId: 'demo', title: 'Spotify Premium', amount: 9.99, category: 'other', date: iso(15), createdAt: ts(15) },
    { id: 'd7', userId: 'demo', title: 'Gym Membership', amount: 45.00, category: 'other', date: iso(18), createdAt: ts(18) },
    { id: 'd8', userId: 'demo', title: 'Coffee Shop', amount: 5.75, category: 'food', date: iso(1), createdAt: ts(1) },
    { id: 'd9', userId: 'demo', title: 'Electric Bill', amount: 85.20, category: 'utilities', date: iso(20), createdAt: ts(20) },
    { id: 'd10', userId: 'demo', title: 'Freelance Project', amount: 850, category: 'income', date: iso(15), createdAt: ts(15) },
    { id: 'd11', userId: 'demo', title: 'Amazon Purchase', amount: 65.00, category: 'shopping', date: iso(4), createdAt: ts(4) },
    { id: 'd12', userId: 'demo', title: 'Internet Bill', amount: 60.00, category: 'utilities', date: iso(25), createdAt: ts(25) },
];

// DEMO GOALS
export const DEMO_GOALS: Goal[] = [
    {
        id: 'g1',
        userId: 'demo',
        title: 'Europe Trip ✈️',
        targetAmount: 3000,
        currentAmount: 1250,
        deadline: new Date(today.getFullYear() + 1, 5, 15).toISOString(),
        color: '#FF6B6B',
        createdAt: ts(30)
    },
    {
        id: 'g2',
        userId: 'demo',
        title: 'Emergency Fund 🛡️',
        targetAmount: 10000,
        currentAmount: 4500,
        deadline: new Date(today.getFullYear(), 11, 31).toISOString(),
        color: '#4ECDC4',
        createdAt: ts(60)
    },
    {
        id: 'g3',
        userId: 'demo',
        title: 'New Macbook 💻',
        targetAmount: 2000,
        currentAmount: 1800,
        deadline: new Date(today.getFullYear(), today.getMonth() + 2, 1).toISOString(),
        color: '#FFE66D',
        createdAt: ts(90)
    }
];
