  import './Transactions.css';
  import { useState, useEffect, useCallback } from 'react';
  import { useNavigate } from 'react-router-dom';

  const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000' : 'https://expense-tracker-backend-1ttg.onrender.com');

  // ── XP helper: sync new XP total into localStorage ────────────────────────
  const syncXpToStorage = (totalXp) => {
    const raw = localStorage.getItem('user');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    parsed.xp = totalXp;
    localStorage.setItem('user', JSON.stringify(parsed));
  };
  // ──────────────────────────────────────────────────────────────────────────

  const Transactions = () => {
    const [expenses, setExpenses] = useState([]);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filterMonth, setFilterMonth] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [newExpense, setNewExpense] = useState({ title: '', amount: '', date: '', type: 'expense', expenseType: 'other' });
    const [editExpense, setEditExpense] = useState({ title: '', amount: '', date: '', type: 'expense', expenseType: 'other' });
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // ── XP toast state ────────────────────────────────────────────────────
    const [xpToast, setXpToast] = useState(null); // { xpEarned, totalXp, milestoneMessage }

    const navigate = useNavigate();

    const userData = localStorage.getItem('user');
    const user = userData ? JSON.parse(userData) : null;

    const showXpToast = (xpEarned, totalXp, milestoneMessage = null) => {
      setXpToast({ xpEarned, totalXp, milestoneMessage });
      setTimeout(() => setXpToast(null), 3500);
    };

    const fetchExpenses = useCallback(async () => {
      if (!user?._id) return;
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${API_BASE}/expenses/${user._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setExpenses(data);
      } catch (err) {
        console.error('Fetch error:', err);
      }
    }, [user?._id]);

    useEffect(() => {
      if (!user) navigate('/login');
      else fetchExpenses();
    }, []);

    const handleDelete = async (expenseId) => {
      const userId = user?._id || user?.id;
      if (!userId) return;
      const token = localStorage.getItem('token');
      try {
        await fetch(`${API_BASE}/expenses/${userId}/${expenseId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setExpenses(expenses.filter(e => e._id !== expenseId));
        setDeleteConfirm(null);
        // No XP for delete
      } catch (err) {
        alert('Error deleting expense', err);
      }
    };

    const handleAdd = async (e) => {
    e.preventDefault();
    if (!user?._id || !newExpense.title || !newExpense.amount || !newExpense.date) return;
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_BASE}/expenses/${user._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newExpense)
      });
      if (!response.ok) throw new Error('Failed to add');
      const data = await response.json();

      // ── DEBUG: log everything ──
      console.log('Full response:', JSON.stringify(data));

      const addedExpense = data.expense || data;
      setExpenses([addedExpense, ...expenses]);
      setNewExpense({ title: '', amount: '', date: '', type: 'expense', expenseType: 'other' });
      setShowAddForm(false);

      // ── Force show toast regardless, for testing ──
      syncXpToStorage(data.totalXp ?? 0);
      showXpToast(data.xpEarned ?? 99, data.totalXp ?? 999, data.milestoneMessage ?? null);

    } catch (err) {
      console.error('Error adding expense:', err);
      alert('Error adding expense: ' + err.message);
    }
  };

    const handleEdit = async (e) => {
      e.preventDefault();
      if (!user?._id || !editExpense.title || !editExpense.amount || !editExpense.date) return;
      const token = localStorage.getItem('token');

      try {
        const response = await fetch(`${API_BASE}/expenses/${user._id}/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(editExpense)
        });
        if (!response.ok) throw new Error('Failed to update');
        const data = await response.json();

        // Backend now returns { expense, xpEarned, totalXp }
        const updatedExpense = data.expense || data;
        setExpenses(expenses.map(exp => exp._id === editingId ? updatedExpense : exp));
        setEditingId(null);
        setEditExpense({ title: '', amount: '', date: '', type: 'expense', expenseType: 'other' });

        // ── Show XP toast + sync to localStorage ──
        if (data.xpEarned) {
          syncXpToStorage(data.totalXp);
          showXpToast(data.xpEarned, data.totalXp);
        }

      } catch (err) {
        alert('Error updating expense', err);
      }
    };

    const startEdit = (expense) => {
      setEditingId(expense._id);
      setEditExpense({ title: expense.title, amount: expense.amount, date: expense.date });
    };

    const cancelEdit = () => {
      setEditingId(null);
      setEditExpense({ title: '', amount: '', date: '' });
    };

    const filtered = expenses
      .filter(e => {
        const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
        const matchMonth = filterMonth ? e.date?.startsWith(filterMonth) : true;
        return matchSearch && matchMonth;
      })
      .sort((a, b) => {
        let valA, valB;
        if (sortBy === 'amount') { valA = a.amount; valB = b.amount; }
        else if (sortBy === 'title') { valA = a.title.toLowerCase(); valB = b.title.toLowerCase(); }
        else { valA = a.date; valB = b.date; }
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

    const totalIncome = filtered.filter(e => e.type === 'income').reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const totalExpense = filtered.filter(e => e.type !== 'income').reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const total = totalIncome - totalExpense;

    if (!user) return null;

    return (
      <div className="transactions-wrapper">

        {/* ── XP Toast ── */}
        {xpToast && (
          <div className="xp-toast">
            <span className="xp-toast-icon">⚡</span>
            <div className="xp-toast-body">
              <span className="xp-toast-earned">+{xpToast.xpEarned} XP earned!</span>
              {xpToast.milestoneMessage && (
                <span className="xp-toast-milestone">{xpToast.milestoneMessage}</span>
              )}
              <span className="xp-toast-total">Total: {xpToast.totalXp?.toLocaleString('en-IN')} XP</span>
            </div>
          </div>
        )}

        <section className="transactions-header">
          <h2>Transactions</h2>
          <p>All your recorded expenses in one place.</p>
        </section>

        {/* Add New Transaction Button */}
        <section className="transactions-actions">
          <button
            className="primary-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : '+ Add Transaction'}
          </button>
        </section>

        {/* Add Transaction Form */}
        {showAddForm && (
          <section className="transactions-form-card">
            <form onSubmit={handleAdd} className="expense-form">
              <div className="form-row">
                <select
                  value={newExpense.type}
                  onChange={(e) => setNewExpense({ ...newExpense, type: e.target.value })}
                  required
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                <input
                  type="text"
                  placeholder="Transaction title"
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  required
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  min="0"
                  step="0.01"
                  required
                />
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  required
                />
                {newExpense.type === 'expense' && (
                  <select
                    value={newExpense.expenseType}
                    onChange={(e) => setNewExpense({ ...newExpense, expenseType: e.target.value })}
                  >
                    <option value="grocery">Grocery</option>
                    <option value="electronics">Electronics</option>
                    <option value="food">Food</option>
                    <option value="transport">Transport</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="utilities">Utilities</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="shopping">Shopping</option>
                    <option value="other">Other</option>
                  </select>
                )}
              </div>
              <div className="form-actions">
                <button type="submit" className="primary-btn">Add Transaction</button>
                <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>Cancel</button>
              </div>
            </form>
          </section>
        )}

        {/* Filters */}
        <section className="transactions-filters">
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <input
            type="month"
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
          />
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
            <option value="title">Sort by Title</option>
          </select>
          <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
          {(search || filterMonth) && (
            <button className="filter-clear-btn" onClick={() => { setSearch(''); setFilterMonth(''); }}>Clear Filters</button>
          )}
        </section>

        {/* Summary */}
        <section className="transactions-summary">
          <span>Showing {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}</span>
          <div className="summary-totals">
            <span className="summary-income">Income: ₹{filtered.filter(e => e.type === 'income').reduce((sum, e) => sum + (Number(e.amount) || 0), 0).toLocaleString('en-IN')}</span>
            <span className="summary-expense">Expenses: ₹{filtered.filter(e => e.type !== 'income').reduce((sum, e) => sum + (Number(e.amount) || 0), 0).toLocaleString('en-IN')}</span>
            <span className="summary-total">Balance: ₹{total.toLocaleString('en-IN')}</span>
          </div>
        </section>

        {/* Table */}
        <section className="transactions-table-card">
          {filtered.length === 0 ? (
            <p className="analytics-empty">No transactions found.</p>
          ) : (
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((expense, index) => (
                  <tr key={expense._id}>
                    {editingId === expense._id ? (
                      <>
                        <td data-label="#">{index + 1}</td>
                        <td data-label="Title" colSpan="3">
                          <form onSubmit={handleEdit} className="inline-edit-form">
                            <div className="form-row">
                              <input
                                type="text"
                                placeholder="Title"
                                value={editExpense.title}
                                onChange={(e) => setEditExpense({ ...editExpense, title: e.target.value })}
                                required
                              />
                              <input
                                type="number"
                                placeholder="Amount"
                                value={editExpense.amount}
                                onChange={(e) => setEditExpense({ ...editExpense, amount: e.target.value })}
                                min="0"
                                step="0.01"
                                required
                              />
                              <input
                                type="date"
                                value={editExpense.date}
                                onChange={(e) => setEditExpense({ ...editExpense, date: e.target.value })}
                                required
                              />
                            </div>
                          </form>
                        </td>
                        <td data-label="Actions">
                          <button className="edit-btn" onClick={handleEdit}>Save</button>
                          <button className="delete-btn" onClick={cancelEdit}>Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td data-label="#">{index + 1}</td>
                        <td data-label="Type">
                          <span className={`type-badge type-badge--${expense.type || 'expense'}`}>
                            {expense.type === 'income' ? 'Income' : 'Expense'}
                          </span>
                        </td>
                        <td data-label="Title">{expense.title}</td>
                        <td data-label="Category">{expense.expenseType || 'Other'}</td>
                        <td data-label="Date">{expense.date}</td>
                        <td data-label="Amount" className={expense.type === 'income' ? 'amount-income' : 'amount-expense'}>
                          {expense.type === 'income' ? '+' : '-'}₹{Number(expense.amount).toLocaleString('en-IN')}
                        </td>
                        <td data-label="Actions">
                          <button className="edit-btn" onClick={(e) => { e.stopPropagation(); startEdit(expense); }}>Edit</button>
                          <button className="delete-btn" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(expense._id); }}>Delete</button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Delete Confirmation Dialog */}
        {deleteConfirm && (
          <div className="delete-confirm-overlay">
            <div className="delete-confirm-dialog">
              <h3>Delete Transaction</h3>
              <p>Are you sure you want to delete this transaction? This action cannot be undone.</p>
              <div className="delete-confirm-actions">
                <button className="cancel-btn" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                <button className="delete-btn" onClick={() => handleDelete(deleteConfirm)}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default Transactions;