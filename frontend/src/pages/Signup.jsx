import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const API_BASE = 'https://expense-tracker-backend-1ttg.onrender.com';

const EYE_OPEN = (
  <>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </>
);
const EYE_CLOSED = (
  <>
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </>
);

function getStrength(pw) {
  if (!pw) return 0;
  if (pw.length < 5) return 1;
  if (pw.length < 9 || !/[^a-zA-Z0-9]/.test(pw)) return 2;
  return 3;
}
const strengthLabels = ['', 'weak', 'medium', 'strong'];

export default function Signup() {
  const navigate = useNavigate();

  const [password,   setPassword]   = useState('');
  const [confirm,    setConfirm]    = useState('');
  const [showPw,     setShowPw]     = useState(false);
  const [showCf,     setShowCf]     = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [xp,         setXp]         = useState(null);

  const strength    = getStrength(password);
  const pwMatch     = confirm.length > 0 && password === confirm;
  const pwMismatch  = confirm.length > 0 && password !== confirm;
  const canSubmit   = pwMatch && !loading;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pwMatch) return;
    setLoading(true);

    const name  = e.target.name.value;
    const email = e.target.email.value;

    try {
      const res  = await fetch(`${API_BASE}/users/signup`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('user',  JSON.stringify(data.user));
        localStorage.setItem('token', data.token);

        if (data.xpEarned) {
          setXp({ earned: data.xpEarned, total: data.user.xp });
          setTimeout(() => navigate('/expense-tracker'), 2000);
        } else {
          navigate('/expense-tracker');
        }
      } else {
        alert(data.message || 'Signup failed');
      }
    } catch {
      alert('Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />
      <style>{css}</style>

      <div className="lc-root">
        <div className="lc-orb lc-orb-1" />
        <div className="lc-orb lc-orb-2" />
        <div className="lc-grid" />

        {/* XP Popup */}
        <div className={`xp-popup ${xp ? 'show' : ''}`}>
          <div className="xp-amount">+{xp?.earned} XP</div>
          <div className="xp-total">Total: {xp?.total} XP</div>
        </div>

        <div className="login-container">
          <form className="login-form" onSubmit={handleSubmit}>

            <div className="lc-logo">
              <span className="lc-logo-mark">⬡</span>
              <span className="lc-logo-text">TRACKMYCASH</span>
            </div>

            <h2>Create Account</h2>
            <p className="lc-subtitle">Start tracking your finances today</p>

            {/* Name */}
            <div className="input-group">
              <input type="text" name="name" id="name" placeholder=" " required />
              <label htmlFor="name">Full Name</label>
            </div>

            {/* Email */}
            <div className="input-group">
              <input type="email" name="email" id="email" placeholder=" " required />
              <label htmlFor="email">Email</label>
            </div>

            {/* Password */}
            <div className="input-group">
              <input
                type={showPw ? 'text' : 'password'}
                name="password"
                id="password"
                placeholder=" "
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <label htmlFor="password">Password</label>
              <button
                type="button"
                className={`eye-toggle ${showPw ? 'active' : ''}`}
                onClick={() => setShowPw(v => !v)}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                <svg viewBox="0 0 24 24">{showPw ? EYE_CLOSED : EYE_OPEN}</svg>
              </button>
            </div>

            {/* Strength bars */}
            <div className="lc-strength">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className={`lc-strength-seg ${i < strength ? strengthLabels[strength] : ''}`}
                />
              ))}
            </div>

            {/* Confirm Password */}
            <div className="input-group">
              <input
                type={showCf ? 'text' : 'password'}
                name="confirmPassword"
                id="confirmPassword"
                placeholder=" "
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className={pwMatch ? 'match' : pwMismatch ? 'mismatch' : ''}
              />
              <label
                htmlFor="confirmPassword"
                className={pwMatch ? 'label-match' : pwMismatch ? 'label-mismatch' : ''}
              >
                Confirm Password
              </label>
              {confirm.length > 0 && (
                <span
                  className="input-match-icon visible"
                  style={{ color: pwMatch ? '#22c55e' : '#ef4444' }}
                >
                  {pwMatch ? '✓' : '✗'}
                </span>
              )}
              <button
                type="button"
                className={`eye-toggle ${showCf ? 'active' : ''}`}
                onClick={() => setShowCf(v => !v)}
                aria-label={showCf ? 'Hide password' : 'Show password'}
              >
                <svg viewBox="0 0 24 24">{showCf ? EYE_CLOSED : EYE_OPEN}</svg>
              </button>
            </div>

            {/* Match hint */}
            <div className={`lc-match-hint ${confirm.length === 0 ? 'hidden' : pwMatch ? 'ok' : 'err'}`}>
              {confirm.length > 0 && (pwMatch ? '✓ Passwords match' : '✗ Passwords do not match')}
            </div>

            <button type="submit" disabled={!canSubmit}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>

            <p className="signup-text">
              Already have an account?
              <Link to="/login" className="signup-link">Sign in</Link>
            </p>

          </form>
        </div>
      </div>
    </>
  );
}

const css = `
  .lc-root {
    min-height: 100vh;
    background: #080A0F;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    position: relative;
    overflow: hidden;
  }
  .lc-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    pointer-events: none;
  }
  .lc-orb-1 {
    width: 480px; height: 480px;
    background: radial-gradient(circle, rgba(232,197,71,0.10) 0%, transparent 70%);
    top: -160px; left: -140px;
    animation: driftA 16s ease-in-out infinite alternate;
  }
  .lc-orb-2 {
    width: 380px; height: 380px;
    background: radial-gradient(circle, rgba(255,107,53,0.09) 0%, transparent 70%);
    bottom: -100px; right: -100px;
    animation: driftB 20s ease-in-out infinite alternate;
  }
  @keyframes driftA { from{transform:translate(0,0)} to{transform:translate(30px,20px)} }
  @keyframes driftB { from{transform:translate(0,0)} to{transform:translate(-20px,-15px)} }

  .lc-grid {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 100%);
  }

  .login-container {
    position: relative; z-index: 10;
    width: 100%; max-width: 420px; padding: 20px;
    animation: cardIn 0.7s cubic-bezier(0.22,1,0.36,1) both;
  }
  @keyframes cardIn {
    from { opacity:0; transform:translateY(28px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }

  .login-form {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 20px;
    padding: 44px 40px 36px;
    backdrop-filter: blur(20px);
    box-shadow: 0 30px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(232,197,71,0.06) inset;
  }

  .lc-logo {
    display:flex; align-items:center; gap:8px;
    justify-content:center; margin-bottom:28px;
    animation: fadeUp 0.5s ease 0.15s both;
  }
  .lc-logo-mark { font-size:18px; color:#E8C547; }
  .lc-logo-text {
    font-family:'DM Mono',monospace; font-size:13px;
    font-weight:500; letter-spacing:0.22em; color:#EEF0F6;
  }

  .login-form h2 {
    font-family:'Playfair Display',serif; font-size:32px;
    font-weight:900; color:#EEF0F6; text-align:center;
    margin-bottom:6px; animation: fadeUp 0.5s ease 0.25s both;
  }
  .lc-subtitle {
    text-align:center; font-size:13px; color:#6B6C7E;
    margin-bottom:32px; animation: fadeUp 0.5s ease 0.32s both;
  }

  .input-group {
    position:relative; margin-bottom:20px;
    animation: fadeUp 0.5s ease 0.4s both;
  }
  .input-group input {
    width:100%; padding:18px 44px 6px 16px;
    background:rgba(255,255,255,0.04);
    border:1px solid rgba(255,255,255,0.1);
    border-radius:10px; color:#EEF0F6;
    font-family:'DM Sans',sans-serif; font-size:14.5px;
    outline:none; box-sizing:border-box;
    transition:border-color 0.2s,background 0.2s,box-shadow 0.2s;
    caret-color:#E8C547;
  }
  .input-group input:focus {
    border-color:rgba(232,197,71,0.5);
    background:rgba(232,197,71,0.04);
    box-shadow:0 0 0 3px rgba(232,197,71,0.08);
  }
  .input-group input.match {
    border-color:rgba(34,197,94,0.5);
    background:rgba(34,197,94,0.04);
  }
  .input-group input.mismatch {
    border-color:rgba(239,68,68,0.5);
    background:rgba(239,68,68,0.04);
    box-shadow:0 0 0 3px rgba(239,68,68,0.08);
  }
  .input-group label {
    position:absolute; left:16px; top:50%;
    transform:translateY(-50%); font-size:14px;
    color:#5A5C6E; pointer-events:none; transition:all 0.2s ease;
  }
  .input-group input:focus ~ label,
  .input-group input:not(:placeholder-shown) ~ label {
    top:10px; transform:translateY(0); font-size:10px;
    letter-spacing:0.08em; text-transform:uppercase;
    color:#E8C547; font-family:'DM Mono',monospace;
  }
  .input-group input.match ~ label { color:#22c55e; }
  .input-group input.mismatch ~ label { color:#ef4444; }

  .eye-toggle {
    position:absolute; right:12px; top:50%;
    transform:translateY(-50%);
    background:none; border:none; cursor:pointer;
    padding:4px; display:flex; align-items:center;
    color:#5A5C6E; transition:color 0.2s; z-index:2;
  }
  .eye-toggle:hover, .eye-toggle.active { color:#E8C547; }
  .eye-toggle svg {
    width:18px; height:18px;
    stroke:currentColor; fill:none;
    stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round;
  }

  .input-match-icon {
    position:absolute; right:40px; top:50%;
    transform:translateY(-50%); font-size:15px;
    pointer-events:none; opacity:0; transition:opacity 0.2s;
  }
  .input-match-icon.visible { opacity:1; }

  .lc-strength {
    display:flex; gap:6px;
    margin-top:-12px; margin-bottom:20px;
  }
  .lc-strength-seg {
    flex:1; height:3px;
    background:rgba(255,255,255,0.08);
    border-radius:2px; transition:all 0.3s;
  }
  .lc-strength-seg.weak   { background:#ef4444; }
  .lc-strength-seg.medium { background:#f59e0b; }
  .lc-strength-seg.strong { background:#22c55e; }

  .lc-match-hint {
    font-size:11px; font-family:'DM Mono',monospace;
    letter-spacing:0.06em;
    margin-top:-14px; margin-bottom:20px;
    padding-left:4px; height:14px; transition:color 0.2s;
  }
  .lc-match-hint.ok     { color:#22c55e; }
  .lc-match-hint.err    { color:#ef4444; }
  .lc-match-hint.hidden { visibility:hidden; }

  .login-form button[type="submit"] {
    width:100%; padding:14px;
    background:#E8C547; color:#080A0F;
    font-family:'DM Sans',sans-serif; font-size:14px;
    font-weight:700; border:none; border-radius:10px;
    cursor:pointer; letter-spacing:0.04em;
    box-shadow:0 0 28px rgba(232,197,71,0.25);
    transition:all 0.22s ease; margin-bottom:24px;
    animation: fadeUp 0.5s ease 0.6s both;
  }
  .login-form button[type="submit"]:hover:not(:disabled) {
    background:#f5d253;
    box-shadow:0 0 44px rgba(232,197,71,0.4);
    transform:translateY(-2px);
  }
  .login-form button[type="submit"]:disabled {
    opacity:0.45; cursor:not-allowed;
    box-shadow:none; transform:none;
  }

  .signup-text {
    text-align:center; font-size:13px; color:#5A5C6E;
    animation: fadeUp 0.5s ease 0.72s both;
  }
  .signup-link {
    color:#E8C547; font-weight:600;
    text-decoration:none; margin-left:4px; transition:color 0.18s;
  }
  .signup-link:hover { color:#f5d253; text-decoration:underline; }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(14px); }
    to   { opacity:1; transform:translateY(0); }
  }

  @media (max-width:480px) {
    .login-form { padding:24px 16px 20px; }
    .login-form h2 { font-size:24px; }
  }

  .xp-popup {
    position:fixed; top:20px; left:50%;
    transform:translateX(-50%) translateY(-100px);
    background:linear-gradient(135deg,#E8C547 0%,#f5d253 100%);
    color:#080A0F; padding:14px 28px; border-radius:12px;
    font-family:'DM Sans',sans-serif; font-weight:700;
    font-size:16px; box-shadow:0 8px 32px rgba(232,197,71,0.4);
    z-index:1000; opacity:0; text-align:center;
    transition:all 0.5s cubic-bezier(0.68,-0.55,0.265,1.55);
  }
  .xp-popup.show {
    transform:translateX(-50%) translateY(0); opacity:1;
  }
  .xp-amount { font-size:22px; font-weight:900; }
  .xp-total  { font-size:12px; font-weight:500; opacity:0.8; margin-top:2px; }
`;