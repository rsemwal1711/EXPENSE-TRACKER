import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import Dashboard from './pages/Dashboard';
import ExpenseTracker from './pages/ExpenseTracker';
import Login from './pages/Login';
import Signup from './pages/Signup';
import TransactionDetails from './pages/TransactionDetails';
import NotFound from './pages/NotFound';
import Receipts from './pages/Receipts';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

const App = () => {
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('splashShown');
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem('splashShown', 'true');
    setShowSplash(false);
  };

  if (showSplash) return <SplashScreen onComplete={handleSplashComplete} />;

  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/login"  element={<Login />} />
        
        <Route path="/signup" element={<Signup />} />

        <Route path="/" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />

        <Route path="/expense-tracker" element={
          <ProtectedRoute><ExpenseTracker /></ProtectedRoute>
        } />

        <Route path="/transaction/:id" element={
          <ProtectedRoute><TransactionDetails /></ProtectedRoute>
        } />

        <Route path="*" element={<NotFound />} />

        <Route path="/receipts" element={
          <ProtectedRoute><Receipts /></ProtectedRoute>
        } />

      </Routes>
    </BrowserRouter>
  );
};

export default App;