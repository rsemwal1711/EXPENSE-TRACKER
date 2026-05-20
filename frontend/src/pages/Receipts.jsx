import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Transactions.css';

const API_BASE =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? 'http://localhost:4000'
    : 'https://expense-tracker-backend-1ttg.onrender.com');

const Receipts = ({ expenses = [] }) => {
  const navigate = useNavigate();

  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filterType, setFilterType] = useState('month');

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );

  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  // Fetch receipts
  const fetchReceipts = async () => {
    const token = localStorage.getItem('token');

    setLoading(true);

    try {
      const url =
        filterType === 'month'
          ? `${API_BASE}/receipts/month/${selectedMonth}`
          : `${API_BASE}/receipts/year/${selectedYear}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      console.log('Receipts:', data);
      console.log('Expenses:', expenses);

      setReceipts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch receipts error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchReceipts();
  }, [filterType, selectedMonth, selectedYear]);

  // Re-fetch when expenses load
  useEffect(() => {
    if (expenses.length > 0) {
      fetchReceipts();
    }
  }, [expenses.length]);

  // Delete receipt
  const handleDelete = async receipt => {
    const confirmDelete = window.confirm(
      'Delete this receipt?'
    );

    if (!confirmDelete) return;

    const token = localStorage.getItem('token');

    try {
      await fetch(
        `${API_BASE}/receipts/${receipt._id || receipt.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReceipts(prev =>
        prev.filter(
          r =>
            (r._id || r.id) !==
            (receipt._id || receipt.id)
        )
      );
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  // Match receipt with expense
  const getMatchedExpense = receipt => {
    return expenses.find(
      exp =>
        String(exp.id) ===
          String(receipt.transactionId) ||
        String(exp._id) ===
          String(receipt.transactionId)
    );
  };

  return (
    <div className="transactions-wrapper">

      {/* Header */}
      <section className="transactions-header">
        <h2>Receipts</h2>
        <p>View and manage your uploaded receipts.</p>
      </section>

      {/* Back Button */}
      <section className="transactions-actions">
        <button
          className="cancel-btn"
          onClick={() => navigate('/expense-tracker')}
        >
          ← Back to Dashboard
        </button>
      </section>

      {/* Filters */}
      <section className="transactions-filters">

        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
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
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
          >
            {[2024, 2025, 2026, 2027].map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        )}
      </section>

      {/* Receipts */}
      <section
        className="transactions-table-card"
        style={{ padding: '20px' }}
      >

        {loading ? (

          <p
            style={{
              textAlign: 'center',
              color: '#666',
            }}
          >
            Loading receipts...
          </p>

        ) : receipts.length === 0 ? (

          <p
            style={{
              textAlign: 'center',
              color: '#555',
              fontFamily: 'Roboto Mono',
              fontSize: '13px',
            }}
          >
            No receipts found for this {filterType}.
          </p>

        ) : (

          <div className="receipts-grid">

            {receipts.map(receipt => {

              const matchedExpense =
                getMatchedExpense(receipt);

              const title =
                matchedExpense?.title || 'Untitled';

              return (

                <div
                  key={receipt._id || receipt.id}
                  className="receipt-card"
                >

                  {/* Image Receipt */}
                  {receipt.fileType === 'image' ? (
                    <>
                      <img
                        src={receipt.fileUrl}
                        alt={title}
                        className="receipt-card-img"
                      />

                      <p className="receipt-title-below">
                        {title}
                      </p>
                    </>
                  ) : (

                    /* PDF Receipt */
                    <div className="receipt-card-pdf">

                      <span>📄</span>

                      <p className="receipt-title-below">
                        {title}
                      </p>

                    </div>
                  )}

                  {/* Receipt Info */}
                  <div className="receipt-card-info">

                   

                    <div className="receipt-card-actions">

                      <a
                        href={receipt.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="edit-btn"
                      >
                        View
                      </a>

                      <button
                        className="delete-btn"
                        onClick={() =>
                          handleDelete(receipt)
                        }
                      >
                        Delete
                      </button>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Receipts;