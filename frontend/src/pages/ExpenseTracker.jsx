import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './ExpenseTracker.css';

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  const fetchExpenses = useCallback(async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`https://expensetracker-rs17.onrender.com/expenses/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setExpenses(data);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchExpenses();
    }
  }, [user, navigate, fetchExpenses]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  const handleAdd = async () => {
    if (!title || !amount || !date) return alert('Please fill title, amount, and date');
    if (!user?.id) return;
    try {
      const method = isEditing ? 'PUT' : 'POST';
      const url = isEditing
        ? `https://expensetracker-rs17.onrender.com/expenses/${user.id}/${editingId}`
        : `https://expensetracker-rs17.onrender.com/expenses/${user.id}`;
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, amount: parseFloat(amount), date })
      });
      const data = await response.json();
      if (!response.ok) { alert(data.message || "Failed to save expense"); return; }
      if (isEditing) {
        setExpenses(prev => prev.map(e => e.id === editingId ? data : e));
        setIsEditing(false);
        setEditingId(null);
      } else {
        setExpenses(prev => [...prev, data]);
      }
      setTitle(''); setAmount(''); setDate('');
    } catch (error) {
      console.error(error);
      alert("Server not responding");
    }
  };

  const handleDelete = async (expenseId) => {
    if (!user?.id) return;
    try {
      await fetch(`https://expensetracker-rs17.onrender.com/expenses/${user.id}/${expenseId}`, { method: 'DELETE' });
      setExpenses(expenses.filter(e => e.id !== expenseId));
    } catch (err) {
      alert("Error deleting expense", err);
    }
  };

  const handleEdit = (expense) => {
    setTitle(expense.title);
    setAmount(expense.amount.toString());
    setDate(expense.date);
    setIsEditing(true);
    setEditingId(expense.id);
  };

  const handleCancelEdit = () => {
    setTitle(''); setAmount(''); setDate('');
    setIsEditing(false); setEditingId(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const total = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  if (!user) return null;

  const NAV_ITEMS = [
    { id: 'overview',     icon: '◈', label: 'Overview' },
    { id: 'transactions', icon: '⇄', label: 'Transactions' },
    { id: 'goals',        icon: '◎', label: 'Goals' },
    { id: 'analytics',    icon: '⌇', label: 'Analytics' },
    { id: 'settings',     icon: '⚙', label: 'Settings' },
  ];

  return (
    <div className={`app-shell ${darkMode ? 'dark' : ''}`}>

      {/* ── Sidebar ── */}
      <aside className="sidebar">

        {/* Logo */}
        <div className="sidebar-logo">
          <span className="sidebar-logo-icon">⬡</span>
          <span className="sidebar-logo-text">TrackMyCash</span>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`sidebar-nav-item ${activeTab === item.id ? 'sidebar-nav-item--active' : ''} ${item.id !== 'overview' ? 'sidebar-nav-item--disabled' : ''}`}
              onClick={() => item.id === 'overview' && setActiveTab(item.id)}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
              {item.id !== 'overview' && (
                <span className="sidebar-nav-soon">soon</span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom: theme + logout */}
        <div className="sidebar-bottom">
          <button className="sidebar-theme-btn" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="4" fill="currentColor"/>
                  <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Light Mode
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" fill="currentColor"/>
                </svg>
                Dark Mode
              </>
            )}
          </button>

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
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="dashboard">

        {/* Header */}
        <header className="dashboard-header">
          <div>
            <h2 className="dashboard-title">Overview</h2>
            <p className="welcome-text">Welcome back, {user.name}</p>
          </div>
        </header>

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

        {/* Add / Edit form */}
        <section className="card">
          <h3>{isEditing ? 'Edit Expense' : 'Add Expense'}</h3>
          <div className="form-row">
            <input type="text"   placeholder="Expense title" value={title}  onChange={(e) => setTitle(e.target.value)} />
            <input type="date"   placeholder="Date"           value={date}   onChange={(e) => setDate(e.target.value)} />
            <input type="number" placeholder="Amount"         value={amount} onChange={(e) => setAmount(e.target.value)} />
            <button className="primary-btn" onClick={handleAdd}>
              {isEditing ? 'Update' : 'Add'}
            </button>
            {isEditing && (
              <button className="cancel-btn" onClick={handleCancelEdit}>Cancel</button>
            )}
          </div>
        </section>

        {/* Expense list */}
        <section className="card">
          <h3>Recent Expenses</h3>
          {expenses.length === 0 ? (
            <p className="empty-state">No expenses recorded yet.</p>
          ) : (
            <ul className="expense-list">
              {expenses.map((expense) => (
                <li key={expense.id} className="expense-item">
                  <div className="expense-info">
                    <div className="expense-row">
                      <p className="expense-title">{expense.title}</p>
                      {expense.date && <p className="expense-date">{expense.date}</p>}
                    </div>
                    <span className="expense-amount">₹{expense.amount}</span>
                  </div>
                  <div className="expense-actions">
                    <button className="edit-btn"   onClick={() => handleEdit(expense)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(expense.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

      </div>
    </div>
  );
};

export default ExpenseTracker;