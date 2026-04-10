import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './ExpenseTracker.css';
import Transactions from './Transactions';
import Goals from './Goals';
import Analytics from './Analytics';
import Settings from './Settings';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000' : 'https://expense-tracker-backend-1ttg.onrender.com');

const parseJsonSafely = async (response) => {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { message: text || 'Invalid JSON response', status: response.status, body: text };
  }
};

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  const fetchExpenses = useCallback(async () => {
    if (!user?._id) return;
    try {
      const response = await fetch(`${API_BASE}/expenses/${user._id}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setExpenses(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, [user?._id]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchExpenses();
    }
  }, [user, navigate, fetchExpenses]);

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setSidebarOpen(false);
    navigate('/login');
  };

  const total = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  if (!user) return null;

  const NAV_ITEMS = [
    { id: 'overview', icon: '◈', label: 'Overview' },
    { id: 'transactions', icon: '⇄', label: 'Transactions' },
    { id: 'goals', icon: '◎', label: 'Goals' },
    { id: 'analytics', icon: '⌇', label: 'Analytics' },
    { id: 'settings', icon: '⚙', label: 'Settings' },
  ];

  const PAGE_TITLES = {
    overview: 'Overview',
    transactions: 'Transactions',
    goals: 'Goals',
    analytics: 'Analytics',
    settings: 'Settings',
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'transactions':
        return <Transactions />;
      case 'goals':
        return <Goals />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return (
          <>
            {/* Stats */}
            <section className="stats-card">
              <div className="stat-box">
                <span>Total Expenses</span>
                <h3>₹{total.toLocaleString('en-IN')}</h3>
              </div>
              <div className="stat-box">
                <span>Total Entries</span>
                <h3>{expenses.length}</h3>
              </div>
            </section>

            {/* Expense list */}
            <section className="card">
              <h3>Recent Expenses</h3>
              {expenses.length === 0 ? (
                <p className="empty-state">No expenses recorded yet.</p>
              ) : (
                <ul className="expense-list">
                  {expenses.slice(0, 5).map((expense) => (
                    <li key={expense._id} className="expense-item" onClick={() => navigate(`/transaction/${expense._id}`)} style={{ cursor: 'pointer' }}>
                      <div className="expense-info">
                        <div className="expense-row">
                          <p className="expense-title">{expense.title}</p>
                          {expense.date && <p className="expense-date">{expense.date}</p>}
                        </div>
                        <span className="expense-amount">₹{expense.amount}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {expenses.length > 5 && (
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <button className="primary-btn" onClick={() => setActiveTab('transactions')}>
                    View All Transactions
                  </button>
                </div>
              )}
            </section>
          </>
        );
    }
  };

  return (
    <div className={`app-shell ${sidebarOpen ? 'sidebar-open' : ''}`}>

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">⬡</span>
          <span className="sidebar-logo-text">TrackMyCash</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${activeTab === item.id ? 'sidebar-nav-item--active' : ''}`}
              onClick={() => {
                setActiveTab(item.id);
                closeSidebar();
              }}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="sidebar-user-info">
              <p className="sidebar-user-name">{user.name}</p>
              <p className="sidebar-user-email">{user.email || 'Logged in'}</p>
            </div>
            <button className="sidebar-logout-btn" onClick={handleLogout} title="Logout">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="dashboard">

        <header className="dashboard-header">
          <button className="hamburger-menu" onClick={() => setSidebarOpen(!sidebarOpen)} title="Toggle Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
          <div>
            <h2 className="dashboard-title">{PAGE_TITLES[activeTab]}</h2>
            <p className="welcome-text">Welcome back, {user.name}</p>
          </div>
        </header>

        {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

        {renderContent()}

      </div>
    </div>
  );
};

export default ExpenseTracker;