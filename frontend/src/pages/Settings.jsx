import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Settings.css';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000' : 'https://expense-tracker-backend-1ttg.onrender.com');

const Settings = () => {
  const navigate = useNavigate();

  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem('notifications') !== 'false';
  });
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('currency') || 'INR';
  });
  const [dateFormat, setDateFormat] = useState(() => {
    return localStorage.getItem('dateFormat') || 'DD/MM/YYYY';
  });
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'auto';
  });
  const [compactView, setCompactView] = useState(() => {
    return localStorage.getItem('compactView') === 'true';
  });
  const [autoBackup, setAutoBackup] = useState(() => {
    return localStorage.getItem('autoBackup') !== 'false';
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expenses, setExpenses] = useState([]);

  // Fetch expenses for account stats
  useEffect(() => {
    const fetchExpenses = async () => {
      if (!user?._id) return;
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`${API_BASE}/expenses/${user._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch expenses');
        const data = await response.json();
        setExpenses(data);
      } catch (err) {
        console.error('Failed to fetch expenses:', err);
      }
    };

    if (user) {
      fetchExpenses();
    }
  }, [user]);

  // Calculate account stats
  const accountStats = {
    totalExpenses: expenses.length,
    totalAmount: expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0),
    avgExpense: expenses.length ? expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0) / expenses.length : 0,
    oldestExpense: expenses.length ? new Date(Math.min(...expenses.map(e => new Date(e.date)))) : null,
    newestExpense: expenses.length ? new Date(Math.max(...expenses.map(e => new Date(e.date)))) : null,
  };

  const handlePreferenceChange = (key, value) => {
    localStorage.setItem(key, value);
    if (key === 'theme') {
      setTheme(value);
      // Apply theme immediately
      if (value === 'dark') {
        document.body.classList.remove('light');
      } else if (value === 'light') {
        document.body.classList.add('light');
      } else {
        // auto theme based on system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.toggle('light', !prefersDark);
      }
    }
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) return setProfileMsg('Name cannot be empty.');
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE}/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email }),
      });
      if (!response.ok) throw new Error('Update failed');
      const updated = await response.json();
      localStorage.setItem('user', JSON.stringify({ ...user, name: updated.name, email: updated.email }));
      setProfileMsg('Profile updated successfully!');

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('userProfileUpdated'));
    } catch (err) {
      setProfileMsg('Failed to update profile. Please try again.');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword)
      return setPasswordMsg('Please fill all password fields.');
    if (newPassword !== confirmPassword)
      return setPasswordMsg('New passwords do not match.');
    if (newPassword.length < 6)
      return setPasswordMsg('Password must be at least 6 characters.');
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE}/users/${user._id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!response.ok) {
        const data = await response.json();
        return setPasswordMsg(data.message || 'Failed to change password.');
      }
      setPasswordMsg('Password changed successfully!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      setPasswordMsg('Server error. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_BASE}/users/${user._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('goals');
      navigate('/login');
    } catch (err) {
      alert('Failed to delete account. Try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleExportData = () => {
    const goals = localStorage.getItem('goals') || '[]';
    const dataStr = JSON.stringify({ user, goals: JSON.parse(goals) }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trackmycash_export_${user.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!user) return null;

  return (
    <div className="settings-wrapper">
      {/* Account Overview */}
      <section className="settings-card overview">
        <div className="settings-header">
          <h3>Account Overview</h3>
          <div className="user-avatar-large">
            {user.name.charAt(0).toUpperCase()}
          </div>
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
              {accountStats.oldestExpense ? accountStats.oldestExpense.toLocaleDateString() : 'N/A'}
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

      {/* Security Settings */}
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
          <select
            value={theme}
            onChange={e => handlePreferenceChange('theme', e.target.value)}
          >
            <option value="auto">Auto (System)</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div className="settings-field">
          <label>Currency</label>
          <select
            value={currency}
            onChange={e => handlePreferenceChange('currency', e.target.value)}
          >
            <option value="INR">Indian Rupee (₹)</option>
            <option value="USD">US Dollar ($)</option>
            <option value="EUR">Euro (€)</option>
            <option value="GBP">British Pound (£)</option>
          </select>
        </div>

        <div className="settings-field">
          <label>Date Format</label>
          <select
            value={dateFormat}
            onChange={e => handlePreferenceChange('dateFormat', e.target.value)}
          >
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
              onChange={e => {
                setCompactView(e.target.checked);
                handlePreferenceChange('compactView', e.target.checked.toString());
              }}
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
              onChange={e => {
                setNotifications(e.target.checked);
                handlePreferenceChange('notifications', e.target.checked.toString());
              }}
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
              onChange={e => {
                setAutoBackup(e.target.checked);
                handlePreferenceChange('autoBackup', e.target.checked.toString());
              }}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
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
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  try {
                    const data = JSON.parse(event.target.result);
                    if (data.goals) localStorage.setItem('goals', JSON.stringify(data.goals));
                    alert('Data imported successfully!');
                  } catch (err) {
                    alert('Invalid file format.');
                  }
                };
                reader.readAsText(file);
              }
            }}
            style={{ display: 'none' }}
            id="import-file"
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
            <button className="settings-outline-btn danger" onClick={() => setShowDeleteConfirm(true)}>
              Delete Account
            </button>
          ) : (
            <div className="settings-delete-confirm">
              <p className="confirm-message">
                Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.
              </p>
              <div className="confirm-actions">
                <button className="settings-btn danger" onClick={handleDeleteAccount}>
                  Yes, Delete My Account
                </button>
                <button className="settings-outline-btn" onClick={() => setShowDeleteConfirm(false)}>
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