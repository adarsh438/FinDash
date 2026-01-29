import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext'; // Import hook to check auth
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/ToastContainer';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login'; // Keep Login eager for faster initial load
import Layout from './components/Layout';
import OnboardingTour from './components/OnboardingTour';

// Lazy load pages for performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Expenses = lazy(() => import('./pages/Expenses'));
const Transactions = lazy(() => import('./pages/Transactions'));
const AICoach = lazy(() => import('./pages/AICoach'));
const Bills = lazy(() => import('./pages/Bills'));
const Goals = lazy(() => import('./pages/Goals'));
const Paywall = lazy(() => import('./pages/Paywall'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));

// Loading Fallback
const PageLoader = () => (
  <div style={{
    height: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f172a',
    color: '#94a3b8'
  }}>
    <div className="loader">Loading...</div>
  </div>
);

// ProtectedRoute component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading } = useAuth();

  if (loading) return <PageLoader />;

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <OnboardingTour />
      {children}
    </>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ToastContainer />
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App
