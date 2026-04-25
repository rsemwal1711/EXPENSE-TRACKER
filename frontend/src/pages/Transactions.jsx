import './Transactions.css';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000' : 'https://expense-tracker-backend-1ttg.onrender.com');

const Transactions = () => {
  const [expenses, setExpenses] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'amount' | 'title'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [filterMonth, setFilterMonth] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newExpense, setNewExpense] = useState({ title: '', amount: '', date: '' });
  const [editExpense, setEditExpense] = useState({ title: '', amount: '', date: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
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
    try {
      await fetch(`${API_BASE}/expenses/${userId}/${expenseId}`, { method: 'DELETE' });
      setExpenses(expenses.filter(e => e._id !== expenseId));
    } catch (err) {
      alert('Error deleting expense');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!user?._id || !newExpense.title || !newExpense.amount || !newExpense.date) return;

    try {
      const response = await fetch(`${API_BASE}/expenses/${user._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense)
      });
      if (!response.ok) throw new Error('Failed to add');
      const addedExpense = await response.json();
      setExpenses([addedExpense, ...expenses]);
      setNewExpense({ title: '', amount: '', date: '' });
      setShowAddForm(false);
    } catch (err) {
      alert('Error adding expense');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!user?._id || !editExpense.title || !editExpense.amount || !editExpense.date) return;

    try {
      const response = await fetch(`${API_BASE}/expenses/${user._id}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editExpense)
      });
      if (!response.ok) throw new Error('Failed to update');
      const updatedExpense = await response.json();
      setExpenses(expenses.map(exp => exp._id === editingId ? updatedExpense : exp));
      setEditingId(null);
      setEditExpense({ title: '', amount: '', date: '' });
    } catch (err) {
      alert('Error updating expense');
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

  const total = filtered.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  if (!user) return null;

  return (
    <div className="transactions-wrapper">
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
        <span className="summary-total">Total: ₹{total.toLocaleString('en-IN')}</span>
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
                <th>Title</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((expense, index) => (
                <tr key={expense._id}>
                  {editingId === expense._id ? (
                    // Edit form row
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
                    // Normal display row
                    <>
                      <td data-label="#">{index + 1}</td>
                      <td data-label="Title">{expense.title}</td>
                      <td data-label="Date">{expense.date}</td>
                      <td data-label="Amount">₹{Number(expense.amount).toLocaleString('en-IN')}</td>
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