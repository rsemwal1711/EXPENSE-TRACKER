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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
  }, []);

  const handleUpdateProfile = async () => {
    if (!name.trim()) return setProfileMsg('Name cannot be empty.');
    try {
      const response = await fetch(`${API_BASE}/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      if (!response.ok) throw new Error('Update failed');
      const updated = await response.json();
      localStorage.setItem('user', JSON.stringify({ ...user, name: updated.name, email: updated.email }));
      setProfileMsg('Profile updated successfully!');
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
    try {
      const response = await fetch(`${API_BASE}/users/${user._id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
    try {
      await fetch(`${API_BASE}/users/${user._id}`, { method: 'DELETE' });
      localStorage.removeItem('user');
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
      <section className="settings-card">
        <h3>Profile</h3>
        <div className="settings-field">
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div className="settings-field">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <button className="settings-btn" onClick={handleUpdateProfile}>Update Profile</button>
        {profileMsg && <p className="settings-msg">{profileMsg}</p>}
      </section>

      <section className="settings-card">
        <h3>Change Password</h3>
        <div className="settings-field">
          <label>Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
          />
        </div>
        <div className="settings-field">
          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
        </div>
        <div className="settings-field">
          <label>Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
        </div>
        <button className="settings-btn" onClick={handleChangePassword}>Change Password</button>
        {passwordMsg && <p className={`settings-msg ${passwordMsg.includes('failed') || passwordMsg.includes('Failed') ? 'error' : ''}`}>{passwordMsg}</p>}
      </section>

      <section className="settings-card">
        <h3>Data & Privacy</h3>
        <div className="settings-data-row">
          <p>Export all your data as a JSON file.</p>
          <button className="settings-outline-btn" onClick={handleExportData}>Export My Data</button>
        </div>
        <div className="settings-data-row">
          <p>Clear all saved goals from this device.</p>
          <button className="settings-outline-btn" onClick={() => { localStorage.removeItem('goals'); alert('Goals cleared.'); }}>Clear Goals Data</button>
        </div>
      </section>

      <section className="settings-card danger">
        <h3>Danger Zone</h3>
        <div className="settings-data-row">
          <p>Log out of your account.</p>
          <button className="settings-outline-btn" onClick={handleLogout}>Logout</button>
        </div>
        <div className="settings-data-row">
          <p>Permanently delete your account and all data. This cannot be undone.</p>
          {!showDeleteConfirm ? (
            <button className="settings-outline-btn" onClick={() => setShowDeleteConfirm(true)}>Delete Account</button>
          ) : (
            <div className="settings-delete-confirm">
              <p>Are you sure? This will delete everything permanently.</p>
              <button className="settings-btn" onClick={handleDeleteAccount}>Yes, Delete My Account</button>
              <button className="settings-outline-btn" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Settings;