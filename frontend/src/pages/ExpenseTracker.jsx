import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './ExpenseTracker.css';
import Transactions from './Transactions';
import Goals from './Goals';
import Analytics from './Analytics';
import ExpenseAnalytics from './ExpenseAnalytics';
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
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });
  const navigate = useNavigate();

  const fetchExpenses = useCallback(async () => {
  const userId = user?._id || user?.id;
  if (!userId) return;

  // Retrieve token from localStorage
  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`${API_BASE}/expenses/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
    const data = await response.json();
    setExpenses(data);
  } catch (err) {
    console.error("Fetch error:", err);
  }
// }, [user?._id]);
}, []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchExpenses();
    }
  }, [user, navigate, fetchExpenses]);

  useEffect(() => {
    document.body.classList.toggle('light', theme === 'light');
  }, [theme]);

  // Listen for localStorage changes (when user profile is updated)
  useEffect(() => {
    const handleStorageChange = () => {
      const userData = localStorage.getItem('user');
      const updatedUser = userData ? JSON.parse(userData) : null;
      setUser(updatedUser);
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events (for same-tab updates)
    const handleUserUpdate = () => {
      const userData = localStorage.getItem('user');
      const updatedUser = userData ? JSON.parse(userData) : null;
      setUser(updatedUser);
    };

    window.addEventListener('userProfileUpdated', handleUserUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userProfileUpdated', handleUserUpdate);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setSidebarOpen(false);
    navigate('/login');
    // window.location.href = '/login';
  };

  const totalIncome = expenses.filter(e => e.type === 'income').reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const totalExpense = expenses.filter(e => e.type !== 'income').reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const total = totalIncome - totalExpense;
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthIncome = expenses.filter(e => e.type === 'income' && e.date?.startsWith(currentMonth)).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const monthExpense = expenses.filter(e => e.type !== 'income' && e.date?.startsWith(currentMonth)).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const monthTotal = monthIncome - monthExpense;
  const averageExpense = expenses.length ? totalExpense / expenses.length : 0;

  // Calculate additional stats
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthKey = lastMonth.toISOString().slice(0, 7);
  const lastMonthIncome = expenses.filter(e => e.type === 'income' && e.date?.startsWith(lastMonthKey)).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const lastMonthExpense = expenses.filter(e => e.type !== 'income' && e.date?.startsWith(lastMonthKey)).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const lastMonthTotal = lastMonthIncome - lastMonthExpense;
  const monthChange = lastMonthTotal ? ((monthTotal - lastMonthTotal) / Math.abs(lastMonthTotal) * 100) : 0;

  const todayIncome = expenses
    .filter(e => e.type === 'income' && e.date === new Date().toISOString().split('T')[0])
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const todayExpenses = expenses
    .filter(e => e.type !== 'income' && e.date === new Date().toISOString().split('T')[0])
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const todayTotal = todayIncome - todayExpenses;

  const weeklyIncome = expenses
    .filter(e => {
      const expenseDate = new Date(e.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return e.type === 'income' && expenseDate >= weekAgo;
    })
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const weeklyExpenses = expenses
    .filter(e => {
      const expenseDate = new Date(e.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return e.type !== 'income' && expenseDate >= weekAgo;
    })
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const weeklyTotal = weeklyIncome - weeklyExpenses;

  if (!user) return null;

  const NAV_ITEMS = [
    { id: 'overview', icon: '◈', label: 'Overview' },
    { id: 'transactions', icon: '⇄', label: 'Transactions' },
    { id: 'goals', icon: '◎', label: 'Goals' },
    // { id: 'analytics', icon: '⌇', label: 'Analytics' },
    { id: 'expenseAnalytics', icon: '⌇', label: 'Expense Analytics' },
    { id: 'charts', icon: '⌇', label: 'Charts' },
    { id: 'settings', icon: '⚙', label: 'Settings' },
  ];

  const PAGE_TITLES = {
    overview: 'Overview',
    transactions: 'Transactions',
    goals: 'Goals',
    expenseAnalytics: 'Expense Analytics',
    expense: 'Charts',
    settings: 'Settings',
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'transactions':
        return <Transactions />;
      case 'goals':
        return <Goals />;
      // case 'analytics':
      //   return <Analytics />;
      case 'expenseAnalytics':
        return <ExpenseAnalytics />;
      case 'charts':
        return <Analytics />
      case 'settings':
        return <Settings />;
      default:
        return (
          <>
            {/* Quick Actions */}
            <section className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="quick-actions-grid">
                <button
                  className="quick-action-btn"
                  onClick={() => setActiveTab('transactions')}
                >
                  <span className="quick-action-icon">➕</span>
                  <span>Add Expense</span>
                </button>
                {/* <button
                  className="quick-action-btn"
                  onClick={() => setActiveTab('analytics')}
                >
                  <span className="quick-action-icon">📊</span>
                  <span>View Analytics</span>
                </button> */}
                <button
                  className="quick-action-btn"
                  onClick={() => setActiveTab('goals')}
                >
                  <span className="quick-action-icon">🎯</span>
                  <span>Set Goals</span>
                </button>
                <button
                  className="quick-action-btn"
                  onClick={() => setActiveTab('settings')}
                >
                  <span className="quick-action-icon">⚙️</span>
                  <span>Settings</span>
                </button>
              </div>
            </section>

            {/* Overview cards */}
            <section className="overview-cards">
              <div className="overview-card overview-card--large">
                <div>
                  <span className="overview-card-label">Balance</span>
                  <h3>₹{total.toLocaleString('en-IN')}</h3>
                  <p className="overview-card-text">Income - Expenses</p>
                </div>
                <div className="overview-card-icon">💰</div>
              </div>
              <div className="overview-card">
                <div>
                    <span className="overview-card-label">Total Income</span>
                  <h3>₹{totalIncome.toLocaleString('en-IN')}</h3>
                  <p className="overview-card-text">All income recorded.</p>
                </div>
                <div className="overview-card-icon">💵</div>
              </div>
              <div className="overview-card">
                <div>
                  <span className="overview-card-label">Total Expenses</span>
                  <h3>₹{totalExpense.toLocaleString('en-IN')}</h3>
                  <p className="overview-card-text">All expenses recorded.</p>
                </div>
                <div className="overview-card-icon">💸</div>
              </div>
              <div className="overview-card">
                <span className="overview-card-label">This month</span>
                <h3>₹{monthTotal.toLocaleString('en-IN')}</h3>
                <p className="overview-card-text">
                  {monthChange > 0 ? '↑' : '↓'} {Math.abs(monthChange).toFixed(1)}% from last month
                </p>
                <div className="overview-card-icon">📅</div>
              </div>
              <div className="overview-card">
                <span className="overview-card-label">This week</span>
                <h3>₹{weeklyTotal.toLocaleString('en-IN')}</h3>
                <p className="overview-card-text">Net this week (income - expenses).</p>
                <div className="overview-card-icon">📈</div>
              </div>
              <div className="overview-card">
                <span className="overview-card-label">Today</span>
                <h3>₹{todayTotal.toLocaleString('en-IN')}</h3>
                <p className="overview-card-text">Today's net balance.</p>
                <div className="overview-card-icon">☀️</div>
              </div>
              <div className="overview-card">
                <span className="overview-card-label">Average spend</span>
                <h3>₹{Math.round(averageExpense).toLocaleString('en-IN')}</h3>
                <p className="overview-card-text">Per transaction average.</p>
                <div className="overview-card-icon">📊</div>
              </div>
              <div className="overview-card">
                <span className="overview-card-label">Total transactions</span>
                <h3>{expenses.length}</h3>
                <p className="overview-card-text">All recorded expenses.</p>
                <div className="overview-card-icon">📝</div>
              </div>
            </section>

            {/* Spending Trend Mini Chart */}
            <section className="card spending-trend">
              <div className="card-header">
                <h3>Spending Trend</h3>
                <span className="card-subtitle">Last 6 months</span>
              </div>
              <div className="mini-chart">
                {Array.from({ length: 6 }, (_, i) => {
                  const date = new Date();
                  date.setMonth(date.getMonth() - (5 - i));
                  const monthKey = date.toISOString().slice(0, 7);
                  const monthIncome = expenses.filter(e => e.type === 'income' && e.date?.startsWith(monthKey)).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
                  const monthExpense = expenses.filter(e => e.type !== 'income' && e.date?.startsWith(monthKey)).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
                  const monthSpend = monthIncome - monthExpense;
                  const maxSpend = Math.max(...Array.from({ length: 6 }, (_, j) => {
                    const d = new Date();
                    d.setMonth(d.getMonth() - (5 - j));
                    const k = d.toISOString().slice(0, 7);
                    const mIncome = expenses.filter(e => e.type === 'income' && e.date?.startsWith(k)).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
                    const mExpense = expenses.filter(e => e.type !== 'income' && e.date?.startsWith(k)).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
                    return mIncome - mExpense;
                  }));
                  const height = maxSpend ? (Math.abs(monthSpend) / Math.abs(maxSpend)) * 100 : 0;

                  return (
                    <div key={i} className="mini-chart-bar">
                      <div
                        className="mini-chart-fill"
                        style={{ height: `${height}%`, background: monthSpend >= 0 ? '#4ade80' : '#f87171' }}
                        title={`₹${monthSpend.toLocaleString('en-IN')}`}
                      />
                      <span className="mini-chart-label">
                        {date.toLocaleString('default', { month: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Recent Activity */}
            <section className="card recent-activity">
              <div className="card-header">
                <h3>Recent Activity</h3>
                <button
                  className="view-all-btn"
                  onClick={() => setActiveTab('transactions')}
                >
                  View All →
                </button>
              </div>
              {expenses.length === 0 ? (
                <div className="empty-activity">
                  <div className="empty-activity-icon">📊</div>
                  <h4>No transactions yet</h4>
                  <p>Start tracking your expenses to see activity here.</p>
                  <button
                    className="primary-btn"
                    onClick={() => setActiveTab('transactions')}
                  >
                    Add Your First Expense
                  </button>
                </div>
              ) : (
                <div className="activity-list">
                  {expenses.slice(0, 8).map((expense, index) => (
                    <div
                      key={expense._id}
                      className="activity-item"
                      onClick={() => navigate(`/transaction/${expense._id}`)}
                    >
                      <div className="activity-icon">
                        {index === 0 ? '🔥' : index === 1 ? '💰' : '💳'}
                      </div>
                      <div className="activity-content">
                        <div className="activity-title">{expense.title}</div>
                        <div className="activity-meta">
                          {expense.date} • ₹{Number(expense.amount).toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div className="activity-arrow">→</div>
                    </div>
                  ))}
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
          <button className="sidebar-theme-btn" onClick={toggleTheme}>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
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