import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './ExpenseAnalytics.css';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000' : 'https://expense-tracker-backend-1ttg.onrender.com');

const PIE_COLORS = [
  '#f59e0b', '#10b981', '#3b82f6', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
];

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx, cy, r, startDeg, endDeg) {
  const end = Math.min(endDeg, startDeg + 359.9999);
  const s = polarToCartesian(cx, cy, r, startDeg);
  const e = polarToCartesian(cx, cy, r, end);
  const large = end - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`;
}

const ExpenseAnalytics = () => {
  const [expenses, setExpenses] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [hoveredSlice, setHoveredSlice] = useState(null);
  const [pieFilterType, setPieFilterType] = useState('all'); // 'all' | 'year' | 'month'
  const [pieYear, setPieYear] = useState(new Date().getFullYear().toString());
  const [pieMonth, setPieMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
  const navigate = useNavigate();

  const [user] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });

  const userId = user?._id || user?.id;

  const fetchExpenses = useCallback(async () => {
    if (!userId) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/expenses/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch');
      setExpenses(await res.json());
    } catch (err) {
      console.error('Fetch error:', err);
    }
  }, [userId]);

  useEffect(() => {
    if (!user) navigate('/login');
    else fetchExpenses();
  }, [user, navigate, fetchExpenses]);

  if (!user) return null;

  // ── Data prep ──────────────────────────────────────────────────────────────

  const onlyExpenses = expenses.filter(e => e.type !== 'income');

  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = String(i + 1).padStart(2, '0');
    const key = `${selectedYear}-${month}`;
    const slice = onlyExpenses.filter(e => e.date?.startsWith(key));
    const total = slice.reduce((s, e) => s + (Number(e.amount) || 0), 0);
    return {
      month: new Date(2000, i).toLocaleString('default', { month: 'short' }),
      total,
    };
  });
  const maxMonthly = Math.max(...monthlyData.map(m => m.total), 1);

  const topExpenses = [...expenses]
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 5);

  const totalSpent = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalExpenseOnly = onlyExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const avgPerExpense = expenses.length ? totalSpent / expenses.length : 0;
  const highestSingle = expenses.reduce((max, e) => Math.max(max, Number(e.amount) || 0), 0);

  const years = [...new Set(expenses.map(e => e.date?.split('-')[0]).filter(Boolean))].sort().reverse();
  if (!years.includes(new Date().getFullYear().toString())) years.unshift(new Date().getFullYear().toString());

  const pieFilteredExpenses = onlyExpenses.filter(e => {
    if (pieFilterType === 'year') return e.date?.startsWith(pieYear);
    if (pieFilterType === 'month') return e.date?.startsWith(`${pieYear}-${pieMonth}`);
    return true;
  });

  const categoryData = pieFilteredExpenses.reduce((acc, e) => {
    const cat = e.expenseType || e.category;
    if (!cat || cat === 'Other') return acc;
    acc[cat] = (acc[cat] || 0) + Number(e.amount);
    return acc;
  }, {});

  const categoryList = Object.entries(categoryData)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total);

  const pieTotalExpense = pieFilteredExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);

  let cumDeg = 0;
  const pieSegments = categoryList.map((cat, i) => {
    const pct = pieTotalExpense > 0 ? (cat.total / pieTotalExpense) * 100 : 0;
    const startDeg = cumDeg;
    cumDeg += (pct / 100) * 360;
    return {
      name: cat.name,
      total: cat.total,
      pct: pct.toFixed(1),
      startDeg,
      endDeg: cumDeg,
      color: PIE_COLORS[i % PIE_COLORS.length],
    };
  });

  const centerLabel = hoveredSlice !== null
    ? pieSegments[hoveredSlice].name.slice(0, 11)
    : 'Total';
  const centerValue = hoveredSlice !== null
    ? `${pieSegments[hoveredSlice].pct}%`
    : pieTotalExpense >= 1000
      ? `₹${(pieTotalExpense / 1000).toFixed(1)}k`
      : `₹${pieTotalExpense}`;

  return (
    <div className="ea-wrapper">

      {/* Header */}
      <section className="ea-header">
        <div className="ea-header-left">
          <h2 className="ea-title">Expense Analytics</h2>
          <p className="ea-subtitle">Advanced insights for your spending patterns</p>
        </div>
      </section>

      {/* Stats */}
      <section className="ea-stats">
        {[
          { label: 'Total Spent', value: `₹${totalSpent.toLocaleString('en-IN')}` },
          { label: 'Avg / Expense', value: `₹${Math.round(avgPerExpense).toLocaleString('en-IN')}` },
          { label: 'Highest Single', value: `₹${highestSingle.toLocaleString('en-IN')}` },
          { label: 'Entries', value: expenses.length },
        ].map(s => (
          <div key={s.label} className="ea-stat-box">
            <span className="ea-stat-label">{s.label}</span>
            <strong className="ea-stat-value">{s.value}</strong>
          </div>
        ))}
      </section>

      {/* Monthly chart */}
      <section className="ea-card">
        <div className="ea-card-header">
          <h3>Monthly Spending</h3>
          <select className="ea-select" value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="ea-bar-chart">
          {monthlyData.map(m => (
            <div key={m.month} className="ea-bar-col">
              <div className="ea-bar-wrapper">
                <div className="ea-bar" style={{ height: `${(m.total / maxMonthly) * 100}%` }}>
                  <div className="ea-bar-tooltip">₹{m.total.toLocaleString('en-IN')}</div>
                </div>
              </div>
              <span className="ea-bar-label">{m.month}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Category breakdown bars */}
      <section className="ea-card">
        <div className="ea-card-header"><h3>Category Breakdown</h3></div>
        {categoryList.length === 0 ? (
          <p className="ea-empty">No category data yet.</p>
        ) : (
          <div className="ea-cat-list">
            {categoryList.map((cat, i) => (
              <div key={cat.name} className="ea-cat-item">
                <div className="ea-cat-meta">
                  <span className="ea-cat-name">{cat.name}</span>
                  <span className="ea-cat-val">₹{cat.total.toLocaleString('en-IN')}</span>
                </div>
                <div className="ea-cat-track">
                  <div
                    className="ea-cat-fill"
                    style={{
                      width: `${totalExpenseOnly > 0 ? (cat.total / totalExpenseOnly) * 100 : 0}%`,
                      background: PIE_COLORS[i % PIE_COLORS.length],
                      animationDelay: `${i * 60}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pie / Donut chart */}
      <section className="ea-card">
        <div className="ea-card-header">
          <h3>Spending by Category</h3>
          <div className="ea-pie-filters">
            <select className="ea-select" value={pieFilterType} onChange={e => setPieFilterType(e.target.value)}>
              <option value="all">All Time</option>
              <option value="year">By Year</option>
              <option value="month">By Month</option>
            </select>
            {(pieFilterType === 'year' || pieFilterType === 'month') && (
              <select className="ea-select" value={pieYear} onChange={e => setPieYear(e.target.value)}>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            )}
            {pieFilterType === 'month' && (
              <select className="ea-select" value={pieMonth} onChange={e => setPieMonth(e.target.value)}>
                {Array.from({ length: 12 }, (_, i) => {
                  const val = String(i + 1).padStart(2, '0');
                  const label = new Date(2000, i).toLocaleString('default', { month: 'short' });
                  return <option key={val} value={val}>{label}</option>;
                })}
              </select>
            )}
          </div>
        </div>
        {pieSegments.length === 0 ? (
          <p className="ea-empty">No data to display.</p>
        ) : (
          <div className="ea-pie-container">
            <div className="ea-pie-wrap">
              <svg viewBox="0 0 100 100" className="ea-pie-svg">
                {pieSegments.map((seg, i) => (
                  <path
                    key={seg.name}
                    d={describeArc(50, 50, 38, seg.startDeg, seg.endDeg)}
                    fill={seg.color}
                    stroke="var(--ea-surface)"
                    strokeWidth="0.8"
                    style={{
                      cursor: 'pointer',
                      opacity: hoveredSlice === null || hoveredSlice === i ? 1 : 0.4,
                      transform: hoveredSlice === i ? 'scale(1.05)' : 'scale(1)',
                      transformOrigin: '50px 50px',
                      transition: 'opacity 0.2s, transform 0.2s',
                    }}
                    onMouseEnter={() => setHoveredSlice(i)}
                    onMouseLeave={() => setHoveredSlice(null)}
                  />
                ))}
                <circle cx="50" cy="50" r="23" fill="var(--ea-surface)" />
                <text x="50" y="46" textAnchor="middle" fill="#7a8099" fontSize="5" fontFamily="monospace">
                  {centerLabel}
                </text>
                <text x="50" y="56" textAnchor="middle" fill="#e8eaf0" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
                  {centerValue}
                </text>
              </svg>
            </div>

            <div className="ea-pie-legend">
              {pieSegments.map((seg, i) => (
                <div
                  key={seg.name}
                  className="ea-pie-legend-item"
                  style={{ opacity: hoveredSlice === null || hoveredSlice === i ? 1 : 0.45 }}
                  onMouseEnter={() => setHoveredSlice(i)}
                  onMouseLeave={() => setHoveredSlice(null)}
                >
                  <span className="ea-pie-dot" style={{ background: seg.color }} />
                  <span className="ea-pie-legend-name">{seg.name}</span>
                  <span className="ea-pie-legend-pct">{seg.pct}%</span>
                  <span className="ea-pie-legend-val">₹{seg.total.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Top expenses */}
      <section className="ea-card">
        <div className="ea-card-header"><h3>Top 5 Expenses</h3></div>
        {topExpenses.length === 0 ? (
          <p className="ea-empty">No expenses recorded yet.</p>
        ) : (
          <div className="ea-top-list">
            {topExpenses.map((expense, i) => (
              <div key={expense._id || i} className="ea-top-item">
                <span className="ea-top-rank">#{i + 1}</span>
                <div className="ea-top-info">
                  <span className="ea-top-title">{expense.title || expense.description || 'No description'}</span>
                  <span className="ea-top-cat">{expense.expenseType || expense.category || 'Other'}</span>
                </div>
                <span className="ea-top-amount">₹{Number(expense.amount).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default ExpenseAnalytics;