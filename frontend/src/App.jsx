import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ExpenseTracker from './pages/ExpenseTracker';
import Dashboard from './pages/Dashboard';
import TransactionDetails from './pages/TransactionDetails';

const NotFound = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#333' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#666' }}>Page Not Found</h2>
      <p style={{ color: '#888', marginBottom: '2rem' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <a
        href="/"
        style={{
          padding: '10px 20px',
          backgroundColor: '#E8C547',
          color: '#0f0f0f',
          textDecoration: 'none',
          borderRadius: '5px',
          fontWeight: 'bold'
        }}
      >
        Go Home
      </a>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/expense-tracker" element={<ExpenseTracker />} />
        <Route path="/transaction/:id" element={<TransactionDetails />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;