import {
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function MonthlyBar({ data }) {
  const fmt = (v) => `₹${v.toLocaleString()}`;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B6C7E' }} />
        <YAxis tick={{ fontSize: 12, fill: '#6B6C7E' }} tickFormatter={fmt} />
        <Tooltip
          formatter={fmt}
          contentStyle={{
            background: '#12141A',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8
          }}
          labelStyle={{ color: '#EEF0F6' }}
        />
        <Legend />
        <Bar dataKey="income"  fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}