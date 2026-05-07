import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const FILTERS = [
  { key: 'both',    label: 'Both'    },
  { key: 'income',  label: 'Income'  },
  { key: 'expense', label: 'Expense' },
];

export default function IncomeExpenseArea({ data }) {
  const [view, setView] = useState('both');
  const fmt = (v) => `₹${Number(v).toLocaleString()}`;

  const showIncome  = view === 'both' || view === 'income';
  const showExpense = view === 'both' || view === 'expense';

  return (
    <div>
      {/* Toggle buttons */}
      <div style={styles.toggleGroup}>
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            style={{
              ...styles.btn,
              ...(view === key ? styles.btnActive(key) : styles.btnInactive),
            }}
          >
            {key !== 'both' && (
              <span style={{
                ...styles.dot,
                background: key === 'income' ? '#22c55e' : '#ef4444',
                opacity: view === key ? 1 : 0.4,
              }} />
            )}
            {label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B6C7E' }} />
          <YAxis tick={{ fontSize: 12, fill: '#6B6C7E' }} tickFormatter={fmt} width={80} />
          <Tooltip
            formatter={(val, name) => [fmt(val), name.charAt(0).toUpperCase() + name.slice(1)]}
            contentStyle={{
              background: '#12141A',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              fontSize: 13,
            }}
            labelStyle={{ color: '#EEF0F6', marginBottom: 4 }}
          />
          <Legend
            formatter={(value) => (
              <span style={{ color: '#9394A5', fontSize: 12 }}>
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </span>
            )}
          />

          {showIncome && (
            <Area
              type="monotone"
              dataKey="income"
              stroke="#22c55e"
              fill="url(#incomeGrad)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          )}

          {showExpense && (
            <Area
              type="monotone"
              dataKey="expense"
              stroke="#ef4444"
              fill="url(#expenseGrad)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────── */

const styles = {
  toggleGroup: {
    display: 'flex',
    gap: 8,
    marginBottom: 16,
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 14px',
    borderRadius: 20,
    border: '1px solid rgba(255,255,255,0.1)',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    letterSpacing: '0.01em',
  },
  btnInactive: {
    background: 'transparent',
    color: '#6B6C7E',
  },
  btnActive: (key) => ({
    background:
      key === 'income'
        ? 'rgba(34,197,94,0.12)'
        : key === 'expense'
        ? 'rgba(239,68,68,0.12)'
        : 'rgba(232,197,71,0.12)',
    color:
      key === 'income'
        ? '#22c55e'
        : key === 'expense'
        ? '#ef4444'
        : '#E8C547',
    borderColor:
      key === 'income'
        ? 'rgba(34,197,94,0.35)'
        : key === 'expense'
        ? 'rgba(239,68,68,0.35)'
        : 'rgba(232,197,71,0.35)',
  }),
  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    display: 'inline-block',
    flexShrink: 0,
  },
};