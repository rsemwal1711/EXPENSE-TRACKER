import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Settings.css';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000' : 'https://expense-tracker-backend-1ttg.onrender.com');

const Settings = () => {
  const navigate = useNavigate();

  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const token = localStorage.getItem('token');

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [prefMsg, setPrefMsg] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [currency, setCurrency] = useState('INR');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [theme, setTheme] = useState('auto');
  const [compactView, setCompactView] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [prefLoading, setPrefLoading] = useState(false);

  // ── Fetch preferences from localStorage (no backend route yet)
  useEffect(() => {
    setNotifications(localStorage.getItem('notifications') !== 'false');
    setCurrency(localStorage.getItem('currency') || 'INR');
    setDateFormat(localStorage.getItem('dateFormat') || 'DD/MM/YYYY');
    setTheme(localStorage.getItem('theme') || 'auto');
    setCompactView(localStorage.getItem('compactView') === 'true');
    setAutoBackup(localStorage.getItem('autoBackup') !== 'false');
  }, []);

  // ── Fetch expenses
  useEffect(() => {
    if (!user?._id) return;
    const fetchExpenses = async () => {
      try {
        const res = await fetch(`${API_BASE}/expenses/${user._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setExpenses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch expenses:', err);
        setExpenses([]);
      }
    };
    fetchExpenses();
  }, []);

  const accountStats = {
    totalExpenses: expenses.length,
    totalAmount: expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
    avgExpense: expenses.length
      ? expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) / expenses.length
      : 0,
    oldestExpense: expenses.length
      ? new Date(Math.min(...expenses.map(e => new Date(e.date).getTime())))
      : null,
  };

  // ── Save preferences to localStorage
  const handleSavePreferences = async () => {
    setPrefLoading(true);
    setPrefMsg('');
    const prefs = { notifications, currency, dateFormat, theme, compactView, autoBackup };

    Object.entries(prefs).forEach(([k, v]) => localStorage.setItem(k, String(v)));

    if (theme === 'dark') document.body.classList.remove('light');
    else if (theme === 'light') document.body.classList.add('light');
    else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.body.classList.toggle('light', !prefersDark);
    }

    setPrefMsg('Preferences saved!');
    setPrefLoading(false);
  };

  // ── Update profile
  const handleUpdateProfile = async () => {
    if (!name.trim()) return setProfileMsg('Name cannot be empty.');
    try {
      const res = await fetch(`${API_BASE}/users/update/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      // backend returns { user: { name, email } }
      const updatedName = updated.user?.name || name;
      const updatedEmail = updated.user?.email || email;
      localStorage.setItem('user', JSON.stringify({ ...user, name: updatedName, email: updatedEmail }));
      setProfileMsg('Profile updated successfully!');
      window.dispatchEvent(new CustomEvent('userProfileUpdated'));
    } catch {
      setProfileMsg('Failed to update profile. Please try again.');
    }
  };

  // ── Change password
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword)
      return setPasswordMsg('Please fill all password fields.');
    if (newPassword !== confirmPassword)
      return setPasswordMsg('New passwords do not match.');
    if (newPassword.length < 6)
      return setPasswordMsg('Password must be at least 6 characters.');
    try {
      const res = await fetch(`${API_BASE}/users/change-password/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) return setPasswordMsg(data.message || 'Failed to change password.');
      setPasswordMsg('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setPasswordMsg('Server error. Please try again.');
    }
  };

  // ── Delete account
  const handleDeleteAccount = async () => {
    try {
      await fetch(`${API_BASE}/users/delete/${user._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('goals');
      navigate('/login');
    } catch {
      alert('Failed to delete account. Try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleExportData = () => {
    try {
      const goals = localStorage.getItem('goals') || '[]';
      const dataStr = JSON.stringify({ user, goals: JSON.parse(goals) }, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trackmycash_export_${user.name}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export data.');
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="settings-wrapper">

      {/* Account Overview */}
      <section className="settings-card overview">
        <div className="settings-header">
          <h3>Account Overview</h3>
          <div className="user-avatar-large">{user.name?.charAt(0).toUpperCase()}</div>
        </div>
        <div className="account-stats">
          <div className="stat-item">
            <span className="stat-label">Total Expenses</span>
            <span className="stat-value">{accountStats.totalExpenses}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Total Amount</span>
            <span className="stat-value">₹{accountStats.totalAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average Expense</span>
            <span className="stat-value">₹{Math.round(accountStats.avgExpense).toLocaleString('en-IN')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Member Since</span>
            <span className="stat-value">
              {accountStats.oldestExpense
                ? accountStats.oldestExpense.toLocaleDateString()
                : 'N/A'}
            </span>
          </div>
        </div>
      </section>

      {/* Profile Settings */}
      <section className="settings-card">
        <h3>Profile Settings</h3>
        <div className="settings-field">
          <label>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your full name"
          />
        </div>
        <div className="settings-field">
          <label>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>
        <button className="settings-btn primary" onClick={handleUpdateProfile}>
          Update Profile
        </button>
        {profileMsg && (
          <p className={`settings-msg ${profileMsg.includes('successfully') ? 'success' : 'error'}`}>
            {profileMsg}
          </p>
        )}
      </section>

      {/* Security */}
      <section className="settings-card">
        <h3>Security Settings</h3>
        <div className="settings-field">
          <label>Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            placeholder="Enter current password"
          />
        </div>
        <div className="settings-field">
          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="Enter new password (min 6 characters)"
          />
        </div>
        <div className="settings-field">
          <label>Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />
        </div>
        <button className="settings-btn primary" onClick={handleChangePassword}>
          Change Password
        </button>
        {passwordMsg && (
          <p className={`settings-msg ${passwordMsg.includes('successfully') ? 'success' : 'error'}`}>
            {passwordMsg}
          </p>
        )}
      </section>

      {/* Preferences */}
      <section className="settings-card">
        <h3>Preferences</h3>

        <div className="settings-field">
          <label>Theme</label>
          <select value={theme} onChange={e => setTheme(e.target.value)}>
            <option value="auto">Auto (System)</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div className="settings-field">
          <label>Currency</label>
          <select value={currency} onChange={e => setCurrency(e.target.value)}>
            <option value="INR">Indian Rupee (₹)</option>
            <option value="USD">US Dollar ($)</option>
            <option value="EUR">Euro (€)</option>
            <option value="GBP">British Pound (£)</option>
          </select>
        </div>

        <div className="settings-field">
          <label>Date Format</label>
          <select value={dateFormat} onChange={e => setDateFormat(e.target.value)}>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        <div className="settings-toggle">
          <div className="toggle-content">
            <span>Compact View</span>
            <p className="toggle-description">Show more items in less space</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={compactView}
              onChange={e => setCompactView(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="settings-toggle">
          <div className="toggle-content">
            <span>Notifications</span>
            <p className="toggle-description">Receive app notifications</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={notifications}
              onChange={e => setNotifications(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="settings-toggle">
          <div className="toggle-content">
            <span>Auto Backup</span>
            <p className="toggle-description">Automatically backup data locally</p>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={autoBackup}
              onChange={e => setAutoBackup(e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <button
          className="settings-btn primary"
          onClick={handleSavePreferences}
          disabled={prefLoading}
        >
          {prefLoading ? 'Saving...' : 'Save Preferences'}
        </button>
        {prefMsg && (
          <p className={`settings-msg ${prefMsg.includes('saved!') ? 'success' : 'error'}`}>
            {prefMsg}
          </p>
        )}
      </section>

      {/* Data Management */}
      <section className="settings-card">
        <h3>Data Management</h3>
        <div className="settings-data-row">
          <div className="data-info">
            <span className="data-title">Export Data</span>
            <p className="data-description">Download all your expenses and goals as a JSON file</p>
          </div>
          <button className="settings-outline-btn" onClick={handleExportData}>
            Export Data
          </button>
        </div>
        <div className="settings-data-row">
          <div className="data-info">
            <span className="data-title">Clear Goals</span>
            <p className="data-description">Remove all saved goals from this device</p>
          </div>
          <button
            className="settings-outline-btn warning"
            onClick={() => {
              if (confirm('Are you sure you want to clear all goals?')) {
                localStorage.removeItem('goals');
                alert('Goals cleared successfully.');
              }
            }}
          >
            Clear Goals
          </button>
        </div>
        <div className="settings-data-row">
          <div className="data-info">
            <span className="data-title">Import Data</span>
            <p className="data-description">Import expenses and goals from a JSON file</p>
          </div>
          <input
            type="file"
            accept=".json"
            id="import-file"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (event) => {
                try {
                  const data = JSON.parse(event.target.result);
                  if (data.goals) localStorage.setItem('goals', JSON.stringify(data.goals));
                  alert('Data imported successfully!');
                } catch {
                  alert('Invalid file format.');
                }
              };
              reader.readAsText(file);
            }}
          />
          <button
            className="settings-outline-btn"
            onClick={() => document.getElementById('import-file').click()}
          >
            Import Data
          </button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="settings-card danger">
        <h3>Danger Zone</h3>
        <div className="settings-data-row">
          <div className="data-info">
            <span className="data-title">Logout</span>
            <p className="data-description">Sign out of your account on this device</p>
          </div>
          <button className="settings-outline-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
        <div className="settings-data-row">
          <div className="data-info">
            <span className="data-title">Delete Account</span>
            <p className="data-description">Permanently delete your account and all associated data</p>
          </div>
          {!showDeleteConfirm ? (
            <button
              className="settings-outline-btn danger"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Account
            </button>
          ) : (
            <div className="settings-delete-confirm">
              <p className="confirm-message">Are you sure? This cannot be undone.</p>
              <div className="confirm-actions">
                <button className="settings-btn danger" onClick={handleDeleteAccount}>
                  Yes, Delete My Account
                </button>
                <button
                  className="settings-outline-btn"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default Settings;