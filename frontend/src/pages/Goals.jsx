import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Goals.css';

const Goals = () => {
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('goals');
    return saved ? JSON.parse(saved) : [];
  });
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [savedAmount, setSavedAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  useEffect(() => {
    if (!user) navigate('/login');
  }, []);

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  const handleAdd = () => {
    if (!name || !targetAmount) return alert('Please fill goal name and target amount');
    const goal = {
      id: isEditing ? editingId : Date.now().toString(),
      name,
      targetAmount: parseFloat(targetAmount),
      savedAmount: parseFloat(savedAmount) || 0,
      deadline,
      createdAt: isEditing
        ? goals.find(g => g.id === editingId)?.createdAt
        : new Date().toISOString().split('T')[0],
    };
    if (isEditing) {
      setGoals(prev => prev.map(g => g.id === editingId ? goal : g));
      setIsEditing(false);
      setEditingId(null);
    } else {
      setGoals(prev => [...prev, goal]);
    }
    setName(''); setTargetAmount(''); setSavedAmount(''); setDeadline('');
  };

  const handleEdit = (goal) => {
    setName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setSavedAmount(goal.savedAmount.toString());
    setDeadline(goal.deadline || '');
    setIsEditing(true);
    setEditingId(goal.id);
  };

  const handleDelete = (id) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const handleCancel = () => {
    setName(''); setTargetAmount(''); setSavedAmount(''); setDeadline('');
    setIsEditing(false); setEditingId(null);
  };

  const getProgress = (goal) => {
    if (!goal.targetAmount) return 0;
    return Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100));
  };

  const getDaysLeft = (deadline) => {
    if (!deadline) return null;
    const diff = new Date(deadline) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (!user) return null;

  return (
    <div className="goals-wrapper">
      <section className="goals-header">
        <h2>Goals</h2>
        <p>Set savings goals and track your progress.</p>
      </section>

      {/* Add / Edit Form */}
      <section className="goals-form-card">
        <h3>{isEditing ? 'Edit Goal' : 'Add New Goal'}</h3>
        <div className="goals-form-row">
          <input
            type="text"
            placeholder="Goal name (e.g. New Laptop)"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input
            type="number"
            placeholder="Target amount (₹)"
            value={targetAmount}
            onChange={e => setTargetAmount(e.target.value)}
          />
          <input
            type="number"
            placeholder="Amount saved so far (₹)"
            value={savedAmount}
            onChange={e => setSavedAmount(e.target.value)}
          />
          <input
            type="date"
            placeholder="Deadline (optional)"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
          />
          <button className="primary-btn" onClick={handleAdd}>{isEditing ? 'Update Goal' : 'Add Goal'}</button>
          {isEditing && <button className="cancel-btn" onClick={handleCancel}>Cancel</button>}
        </div>
      </section>

      {/* Goals List */}
      {goals.length === 0 ? (
        <p className="analytics-empty">No goals yet. Add one above to get started!</p>
      ) : (
        <div className="goals-list">
          {goals.map(goal => {
            const progress = getProgress(goal);
            const daysLeft = getDaysLeft(goal.deadline);
            const remaining = goal.targetAmount - goal.savedAmount;
            return (
              <div key={goal.id} className="goal-card">
                <div className="goal-top">
                  <h4 className="goal-name">{goal.name}</h4>
                  {goal.deadline && (
                    <span className={`goal-deadline-badge ${daysLeft < 0 ? 'overdue' : daysLeft <= 7 ? 'due-soon' : ''}`}>
                      {daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? 'Due today' : 'Overdue'}
                    </span>
                  )}
                </div>

                <div className="goal-progress-track">
                  <div className={`goal-progress-fill ${progress >= 100 ? 'complete' : ''}`} style={{ width: `${progress}%` }} />
                </div>
                <p className="goal-progress-pct">{progress}% complete</p>

                <div className="goal-amounts">
                  <span>Saved: <strong className="amount-value">₹{goal.savedAmount.toLocaleString('en-IN')}</strong></span>
                  <span>Target: <strong className="amount-value">₹{goal.targetAmount.toLocaleString('en-IN')}</strong></span>
                  {remaining > 0 ? (
                    <span>Remaining: <strong className="amount-value">₹{remaining.toLocaleString('en-IN')}</strong></span>
                  ) : (
                    <span className="goal-reached">🎉 Goal reached!</span>
                  )}
                </div>

                {goal.createdAt && <p className="goal-meta">Created: {goal.createdAt}</p>}

                <div className="goal-actions">
                  <button className="edit-btn" onClick={() => handleEdit(goal)}>Edit</button>
                  <button className="delete-btn" onClick={() => handleDelete(goal.id)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Goals;