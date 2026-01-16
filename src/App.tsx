import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // Import hook to check auth
import Login from './pages/Login'; // Import Login page
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import AICoach from './pages/AICoach';
import Bills from './pages/Bills';
import Goals from './pages/Goals';
import Paywall from './pages/Paywall';
// import Transactions from './pages/Transactions'; 
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

// ProtectedRoute component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="coach" element={<AICoach />} />
        <Route path="bills" element={<Bills />} />
        <Route path="goals" element={<Goals />} />
        <Route path="premium" element={<Paywall />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default App
