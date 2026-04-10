import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Transactions.css';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000' : 'https://expense-tracker-backend-1ttg.onrender.com');

const TransactionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', amount: '', date: '' });

  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  const fetchExpense = async () => {
    if (!user?._id || !id) return;

    try {
      const response = await fetch(`${API_BASE}/expenses/${user._id}/${id}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setExpense(data);
      setEditData({ title: data.title, amount: data.amount, date: data.date });
    } catch (err) {
      console.error('Fetch error:', err);
      alert('Failed to load transaction details');
      navigate('/expense-tracker');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!user?._id || !editData.title || !editData.amount || !editData.date) return;

    try {
      const response = await fetch(`${API_BASE}/expenses/${user._id}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });
      if (!response.ok) throw new Error('Failed to update');
      const updatedExpense = await response.json();
      setExpense(updatedExpense);
      setEditing(false);
    } catch (err) {
      alert('Error updating transaction');
    }
  };

  const handleDelete = async () => {
    if (!user?._id) return;
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      await fetch(`${API_BASE}/expenses/${user._id}/${id}`, { method: 'DELETE' });
      navigate('/expense-tracker');
    } catch (err) {
      alert('Error deleting transaction');
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchExpense();
  }, [user, id]);

  if (loading) {
    return (
      <div className="transactions-wrapper">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Loading transaction details...</p>
        </div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="transactions-wrapper">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Transaction not found.</p>
          <button className="primary-btn" onClick={() => navigate('/expense-tracker')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="transactions-wrapper">
      <section className="transactions-header">
        <h2>Transaction Details</h2>
        <p>View and manage your transaction</p>
      </section>

      <section className="transactions-actions">
        <button
          className="primary-btn"
          onClick={() => setEditing(!editing)}
        >
          {editing ? 'Cancel Edit' : 'Edit Transaction'}
        </button>
        <button
          className="cancel-btn"
          onClick={handleDelete}
          style={{ background: '#dc3545', borderColor: '#dc3545', color: 'white' }}
        >
          Delete Transaction
        </button>
        <button
          className="cancel-btn"
          onClick={() => navigate('/expense-tracker')}
        >
          Back to Dashboard
        </button>
      </section>

      <section className="transactions-form-card">
        {editing ? (
          <form onSubmit={handleUpdate} className="expense-form">
            <div className="form-row">
              <input
                type="text"
                placeholder="Transaction title"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                required
              />
              <input
                type="number"
                placeholder="Amount"
                value={editData.amount}
                onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                min="0"
                step="0.01"
                required
              />
              <input
                type="date"
                value={editData.date}
                onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="primary-btn">Update Transaction</button>
              <button type="button" className="cancel-btn" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        ) : (
          <div className="transaction-details">
            <div className="detail-row">
              <span className="detail-label">Title:</span>
              <span className="detail-value">{expense.title}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Amount:</span>
              <span className="detail-value">₹{Number(expense.amount).toLocaleString('en-IN')}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Date:</span>
              <span className="detail-value">{new Date(expense.date).toLocaleDateString('en-IN')}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Created:</span>
              <span className="detail-value">{new Date(expense.createdAt || expense.date).toLocaleString('en-IN')}</span>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default TransactionDetails;