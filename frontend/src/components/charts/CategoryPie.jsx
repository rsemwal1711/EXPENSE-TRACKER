import {
  PieChart, Pie, Cell,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = {
  grocery:       '#E8C547',
  food:          '#FF6B35',
  transport:     '#4ECDC4',
  electronics:   '#45B7D1',
  entertainment: '#96CEB4',
  utilities:     '#DDA0DD',
  healthcare:    '#98D8C8',
  education:     '#F7DC6F',
  shopping:      '#F0A500',
  other:         '#888780',
};

export default function CategoryPie({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={110}
          innerRadius={55}
          paddingAngle={3}
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
          labelLine={false}
        >
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={COLORS[entry.name] || COLORS.other}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(v) => `₹${v.toLocaleString()}`}
          contentStyle={{
            background: '#12141A',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8
          }}
          labelStyle={{ color: '#EEF0F6' }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}