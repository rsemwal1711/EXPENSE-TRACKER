import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Transactions.css';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000' : 'https://expense-tracker-backend-1ttg.onrender.com');

const Receipts = () => {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  const fetchReceipts = async () => {
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const url = filterType === 'month'
      ? `${API_BASE}/receipts/month/${selectedMonth}`
      : `${API_BASE}/receipts/year/${selectedYear}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setReceipts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch receipts error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchReceipts();
  }, [filterType, selectedMonth, selectedYear]);
  
  const handleDelete = async (receipt) => {
    if (!confirm('Delete this receipt?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_BASE}/receipts/${receipt.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setReceipts(receipts.filter(r => r.id !== receipt.id));
    } catch (err) {
      alert('Delete failed');
    }
  };
  
  return (
    <div className="transactions-wrapper">
      <section className="transactions-header">
        <h2>Receipts</h2>
        <p>View and manage your uploaded receipts.</p>
      </section>

      <section className="transactions-actions">
        <button className="cancel-btn" onClick={() => navigate('/expense-tracker')}>
          ← Back to Dashboard
        </button>
      </section>

      {/* Filters */}
      <section className="transactions-filters">
        <select value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="month">By Month</option>
          <option value="year">By Year</option>
        </select>
        {filterType === 'month' ? (
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
          />
        ) : (
          <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        )}
      </section>

      {/* Receipts Grid */}
      <section className="transactions-table-card" style={{ padding: '20px' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#666' }}>Loading receipts...</p>
        ) : receipts.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#555', fontFamily: 'Roboto Mono', fontSize: '13px' }}>
            No receipts found for this {filterType}.
          </p>
        ) : (
          <div className="receipts-grid">
            {receipts.map(receipt => (
              <div key={receipt.id} className="receipt-card">
                {receipt.fileType === 'image' ? (
                  <img src={receipt.fileUrl} alt={receipt.fileName} className="receipt-card-img" />
                ) : (
                  <div className="receipt-card-pdf">
                    <span>📄</span>
                    <p>{receipt.fileName}</p>
                  </div>
                )}
                <div className="receipt-card-info">
                  <p className="receipt-card-name">{receipt.fileName}</p>
                  <p className="receipt-card-date">{new Date(receipt.createdAt).toLocaleDateString('en-IN')}</p>
                  <div className="receipt-card-actions">
                    <a href={receipt.fileUrl} target="_blank" rel="noreferrer" className="edit-btn">View</a>
                    <button className="delete-btn" onClick={() => handleDelete(receipt)}>Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Receipts;