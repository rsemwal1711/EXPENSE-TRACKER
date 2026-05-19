import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Transactions.css';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000' : 'https://expense-tracker-backend-1ttg.onrender.com');

const syncXpToStorage = (totalXp) => {
  const raw = localStorage.getItem('user');
  if (!raw) return;
  const parsed = JSON.parse(raw);
  parsed.xp = totalXp;
  localStorage.setItem('user', JSON.stringify(parsed));
};

const TransactionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', amount: '', date: '' });
  const [xpToast, setXpToast] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [receiptLoading, setReceiptLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);

  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  const showXpToast = (xpEarned, totalXp) => {
    setXpToast({ xpEarned, totalXp });
    setTimeout(() => setXpToast(null), 3500);
  };

  const fetchExpense = async () => {
    if (!user?._id || !id) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE}/expenses/${user._id}/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
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

  const fetchReceipt = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/receipts/transaction/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      console.log('Receipt response data:', data);
      // ← Only set receipt if it has actual data
      setReceipt(data && data.id ? data : null);
    } catch (err) {
      console.error('Receipt fetch error:', err);
      setReceipt(null);
    } finally {
      setReceiptLoading(false);
    }
  };


  const handleReceiptUpload = async () => {
    console.log('handleReceiptUpload called');
    console.log('receiptFile:', receiptFile);
    console.log('expense:', expense);
    if (!receiptFile || !expense) {
      console.log('Returning early - receiptFile:', receiptFile, 'expense:', expense);
      return;
    }
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('receipt', receiptFile);
    formData.append('transactionId', id);
    formData.append('date', expense.date);
    setUploading(true);
    try {
      console.log('Making fetch request to:', `${API_BASE}/receipts/upload`);
      const res = await fetch(`${API_BASE}/receipts/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      console.log('Response status:', res.status);
      console.log('Response ok:', res.ok);
      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Upload failed (${res.status}): ${errText}`);
      }
      const data = await res.json().catch(() => ({}));
      console.log('Upload response:', data);
      // If backend returned a valid receipt object use it, otherwise re-fetch
      if (data && (data.id || data.fileUrl)) {
        setReceipt(data);
      } else {
        console.warn('Upload returned unexpected payload, re-fetching receipt');
        await fetchReceipt();
      }
      setReceiptFile(null);
    } catch (err) {
      console.error('Upload error details:', err);
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleReceiptDelete = async () => {
    if (!receipt) return;
    if (!confirm('Delete this receipt?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_BASE}/receipts/${receipt.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setReceipt(null);
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleViewReceipt = () => {
    console.log('handleViewReceipt called, receipt:', receipt);
    if (!receipt?.fileUrl) return;
    const url = receipt.fileUrl.startsWith('http') ? receipt.fileUrl : `${API_BASE}${receipt.fileUrl}`;
    const newWin = window.open('', '_blank', 'noopener,noreferrer');
    if (newWin) {
      newWin.opener = null;
      newWin.location = url;
      try { newWin.focus(); } catch (e) { /* ignore */ }
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!user?._id || !editData.title || !editData.amount || !editData.date) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE}/expenses/${user._id}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });
      if (!response.ok) throw new Error('Failed to update');
      const data = await response.json();
      const updatedExpense = data.expense || data;
      setExpense(updatedExpense);
      setEditing(false);
      if (data.xpEarned) {
        syncXpToStorage(data.totalXp);
        showXpToast(data.xpEarned, data.totalXp);
      }
    } catch (err) {
      alert('Error updating transaction', err);
    }
  };

  const handleDelete = async () => {
    if (!user?._id) return;
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_BASE}/expenses/${user._id}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      navigate('/expense-tracker');
    } catch (err) {
      alert('Error deleting transaction', err);
    }
  };

  // ── Single useEffect ──
  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchExpense();
    fetchReceipt();
  }, []);

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

      {xpToast && (
        <div className="xp-toast">
          <span className="xp-toast-icon">⚡</span>
          <div className="xp-toast-body">
            <span className="xp-toast-earned">+{xpToast.xpEarned} XP earned!</span>
            <span className="xp-toast-total">Total: {xpToast.totalXp?.toLocaleString('en-IN')} XP</span>
          </div>
        </div>
      )}

      <section className="transactions-header">
        <h2>Transaction Details</h2>
        <p>View and manage your transaction</p>
      </section>

      <section className="transactions-actions">
        <button className="primary-btn" onClick={() => setEditing(!editing)}>
          {editing ? 'Cancel Edit' : 'Edit Transaction'}
        </button>
        <button className="cancel-btn" onClick={handleDelete}
          style={{ background: '#dc3545', borderColor: '#dc3545', color: 'white' }}>
          Delete Transaction
        </button>
        <button className="cancel-btn" onClick={() => navigate('/expense-tracker')}>
          Back to Dashboard
        </button>
      </section>

      <section className="transactions-form-card">
        {editing ? (
          <form onSubmit={handleUpdate} className="expense-form">
            <div className="form-row">
              <input type="text" placeholder="Transaction title"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })} required />
              <input type="number" placeholder="Amount"
                value={editData.amount}
                onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                min="0" step="0.01" required />
              <input type="date" value={editData.date}
                onChange={(e) => setEditData({ ...editData, date: e.target.value })} required />
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

      {/* ── Receipt Section ── */}
      <section className="transactions-form-card" style={{ marginTop: '16px' }}>
        <div className="receipt-section">
          <h3 className="receipt-title">📎 Receipt</h3>
          {console.log('Receipt data:', receipt)}
          {receiptLoading ? (
            <p style={{ color: '#666', fontSize: '14px' }}>Loading receipt...</p>
          ) : receipt ? (
            <div className="receipt-preview">
              {receipt.fileType === 'image' ? (
                <img src={receipt.fileUrl} alt="Receipt" className="receipt-img" />
              ) : (
                <a href={receipt.fileUrl} target="_blank" rel="noreferrer" className="receipt-pdf-link">
                  📄 {receipt.fileName}
                </a>
              )}
              <div className="receipt-actions">
                 <a href={receipt.fileUrl} target="_blank" rel="noreferrer" className="edit-btn">View</a>
                <button className="delete-btn" onClick={handleReceiptDelete}>Delete</button>
              </div>
            </div>
          ) : (
            <div className="receipt-upload">
              <p style={{ color: '#666', fontSize: '13px', marginBottom: '12px' }}>
                No receipt attached. Upload an image or PDF.
              </p>
              <div className="receipt-upload-row">
                <input type="file" accept="image/*,.pdf"
                  onChange={(e) => setReceiptFile(e.target.files[0])}
                  className="receipt-file-input" />
                <button className="primary-btn"
                  onClick={handleReceiptUpload}
                  disabled={!receiptFile || uploading}>
                  {uploading ? 'Uploading...' : 'Upload Receipt'}
                </button>
              </div>
              {receiptFile && (
                <p style={{ color: '#888', fontSize: '12px', marginTop: '8px' }}>
                  Selected: {receiptFile.name}
                </p>
              )}
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default TransactionDetails;