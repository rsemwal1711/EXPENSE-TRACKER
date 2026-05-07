import './Analytics.css';
import { useExpenseSummary } from '../hooks/useExpenseSummary';
import IncomeExpenseArea from '../components/charts/IncomeExpenseArea';
import CategoryPie       from '../components/charts/CategoryPie';
import MonthlyBar        from '../components/charts/MonthlyBar';

export default function Analytics() {
  const user = JSON.parse(localStorage.getItem('user'));
  const { monthly, byCategory, loading, error } = useExpenseSummary(user?._id);

  return (
    <div className="analytics-page">

      <div className="analytics-header">
        <h1>Analytics</h1>
        <p>Track your spending patterns over time</p>
      </div>

      {error && (
        <div className="analytics-error">
          Failed to load data: {error}
        </div>
      )}

      {loading ? (
        <div className="analytics-loading">
          <div className="loading-spinner" />
          <p>Loading charts...</p>
        </div>
      ) : (
        <div className="analytics-grid">

          <div className="chart-card">
            <div className="chart-card-header">
              <h2>Income vs expenses</h2>
              <p>Monthly comparison over time</p>
            </div>
            <IncomeExpenseArea data={monthly} />
          </div>

          <div className="chart-card">
            <div className="chart-card-header">
              <h2>Monthly breakdown</h2>
              <p>Side by side per month</p>
            </div>
            <MonthlyBar data={monthly} />
          </div>

          <div className="chart-card chart-card--half">
            <div className="chart-card-header">
              <h2>Spending by category</h2>
              <p>Where your money goes</p>
            </div>
            <CategoryPie data={byCategory} />
          </div>

          <div className="chart-card chart-card--half">
            <div className="chart-card-header">
              <h2>Summary</h2>
              <p>This month at a glance</p>
            </div>
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-label">Total income</span>
                <span className="stat-value stat-value--income">
                  ₹{monthly.reduce((s, m) => s + (m.income || 0), 0).toLocaleString()}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total expenses</span>
                <span className="stat-value stat-value--expense">
                  ₹{monthly.reduce((s, m) => s + (m.expense || 0), 0).toLocaleString()}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Net savings</span>
                <span className="stat-value stat-value--savings">
                  ₹{monthly.reduce((s, m) => s + ((m.income || 0) - (m.expense || 0)), 0).toLocaleString()}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Top category</span>
                <span className="stat-value">
                  {byCategory.length > 0
                    ? byCategory.sort((a, b) => b.value - a.value)[0].name
                    : '—'}
                </span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}