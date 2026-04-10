import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Analytics.css';
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000' : 'https://expense-tracker-backend-1ttg.onrender.com');

const Analytics = () => {
  const [expenses, setExpenses] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
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

  // Group by month for selected year
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = String(i + 1).padStart(2, '0');
    const key = `${selectedYear}-${month}`;
    const monthExpenses = expenses.filter(e => e.date?.startsWith(key));
    const total = monthExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    return {
      month: new Date(2000, i).toLocaleString('default', { month: 'short' }),
      total,
      count: monthExpenses.length,
    };
  });

  const maxMonthly = Math.max(...monthlyData.map(m => m.total), 1);

  // Top expenses
  const topExpenses = [...expenses]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Stats
  const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const avgPerExpense = expenses.length ? totalSpent / expenses.length : 0;
  const highestSingle = expenses.reduce((max, e) => Math.max(max, Number(e.amount) || 0), 0);

  // Available years from data
  const years = [...new Set(expenses.map(e => e.date?.split('-')[0]).filter(Boolean))].sort().reverse();
  if (!years.includes(new Date().getFullYear().toString())) years.unshift(new Date().getFullYear().toString());

  if (!user) return null;

  return (
    <div className="analytics-wrapper">
      <section className="analytics-header">
        <h2>Analytics</h2>
        <p>Visual breakdown of your spending habits.</p>
      </section>

      {/* Summary Cards */}
      <section className="analytics-stats">
        <div className="analytics-stat-box">
          <span>Total Spent</span>
          <h3>₹{totalSpent.toLocaleString('en-IN')}</h3>
        </div>
        <div className="analytics-stat-box">
          <span>Avg per Expense</span>
          <h3>₹{Math.round(avgPerExpense).toLocaleString('en-IN')}</h3>
        </div>
        <div className="analytics-stat-box">
          <span>Highest Single</span>
          <h3>₹{highestSingle.toLocaleString('en-IN')}</h3>
        </div>
        <div className="analytics-stat-box">
          <span>Total Entries</span>
          <h3>{expenses.length}</h3>
        </div>
      </section>

      {/* Monthly Breakdown */}
      <section className="analytics-card">
        <div className="analytics-card-header">
          <h3>Monthly Spending</h3>
          <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div className="analytics-bar-chart">
          {monthlyData.map(m => (
            <div key={m.month} className="analytics-bar-col">
              <span className="analytics-bar-value">₹{m.total > 0 ? Math.round(m.total / 1000) + 'k' : 0}</span>
              <div
                className={`analytics-bar ${m.total === 0 ? 'empty' : ''}`}
                title={`${m.month}: ₹${m.total}`}
                style={{ height: `${(m.total / maxMonthly) * 100}px` }}
              />
              <span className="analytics-bar-label">{m.month}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="analytics-card">
        <div className="analytics-card-header">
          <h3>Top 5 Expenses (All Time)</h3>
        </div>
        {topExpenses.length === 0 ? (
          <p className="analytics-empty">No data yet.</p>
        ) : (
          <ol className="analytics-top-list">
            {topExpenses.map(e => (
              <li key={e._id} className="analytics-top-item">
                <span className="analytics-top-rank">{topExpenses.indexOf(e) + 1}</span>
                <span className="analytics-top-title">{e.title}</span>
                <span className="analytics-top-date">{e.date}</span>
                <span className="analytics-top-amount">₹{Number(e.amount).toLocaleString('en-IN')}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="analytics-card">
        <div className="analytics-card-header">
          <h3>Monthly Summary — {selectedYear}</h3>
        </div>
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Transactions</th>
              <th>Total Spent</th>
            </tr>
          </thead>
          <tbody>
            {monthlyData.map(m => (
              <tr key={m.month}>
                <td>{m.month}</td>
                <td>{m.count}</td>
                <td>₹{m.total.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default Analytics;