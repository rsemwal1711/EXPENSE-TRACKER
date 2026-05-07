import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [xp, setXp] = useState(null); // { earned, total }
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const email    = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res  = await fetch(`${API_BASE}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
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
        alert(data.message || 'Login failed');
      }
    } catch {
      alert('Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      <style>{css}</style>

      <div className="lc-root">
        {/* Background orbs */}
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

            <h2>Welcome Back</h2>
            <p className="lc-subtitle">Sign in to your account</p>

            <div className="input-group">
              <input type="email" name="email" id="email" placeholder=" " required />
              <label htmlFor="email">Email</label>
            </div>

            <div className="input-group">
              <input type="password" name="password" id="password" placeholder=" " required />
              <label htmlFor="password">Password</label>
            </div>

            <a href="#" className="lc-forgot">Forgot password?</a>

            <button type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>

            <p className="signup-text">
              Don't have an account?
              <Link to="/signup" className="signup-link">Sign up</Link>
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
  @keyframes driftA { from { transform: translate(0,0); } to { transform: translate(30px,20px); } }
  @keyframes driftB { from { transform: translate(0,0); } to { transform: translate(-20px,-15px); } }

  .lc-grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 100%);
  }

  .login-container {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 420px;
    padding: 20px;
    animation: cardIn 0.7s cubic-bezier(0.22,1,0.36,1) both;
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(28px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
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
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
    margin-bottom: 28px;
    animation: fadeUp 0.5s ease 0.15s both;
  }
  .lc-logo-mark { font-size: 18px; color: #E8C547; }
  .lc-logo-text {
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.22em;
    color: #EEF0F6;
  }

  .login-form h2 {
    font-family: 'Playfair Display', serif;
    font-size: 32px;
    font-weight: 900;
    color: #EEF0F6;
    text-align: center;
    margin-bottom: 6px;
    animation: fadeUp 0.5s ease 0.25s both;
  }
  .lc-subtitle {
    text-align: center;
    font-size: 13px;
    color: #6B6C7E;
    margin-bottom: 32px;
    animation: fadeUp 0.5s ease 0.32s both;
  }

  .input-group {
    position: relative;
    margin-bottom: 20px;
    animation: fadeUp 0.5s ease 0.4s both;
  }
  .input-group input {
    width: 100%;
    padding: 18px 16px 6px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    color: #EEF0F6;
    font-family: 'DM Sans', sans-serif;
    font-size: 14.5px;
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    caret-color: #E8C547;
    box-sizing: border-box;
  }
  .input-group input:focus {
    border-color: rgba(232,197,71,0.5);
    background: rgba(232,197,71,0.04);
    box-shadow: 0 0 0 3px rgba(232,197,71,0.08);
  }
  .input-group label {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    color: #5A5C6E;
    pointer-events: none;
    transition: all 0.2s ease;
  }
  .input-group input:focus ~ label,
  .input-group input:not(:placeholder-shown) ~ label {
    top: 10px;
    transform: translateY(0);
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #E8C547;
    font-family: 'DM Mono', monospace;
  }

  .lc-forgot {
    display: block;
    text-align: right;
    font-size: 11.5px;
    color: #5A5C6E;
    font-family: 'DM Mono', monospace;
    letter-spacing: 0.04em;
    margin-top: -10px;
    margin-bottom: 26px;
    text-decoration: none;
    transition: color 0.18s;
    animation: fadeUp 0.5s ease 0.55s both;
  }
  .lc-forgot:hover { color: #E8C547; }

  .login-form button[type="submit"] {
    width: 100%;
    padding: 14px;
    background: #E8C547;
    color: #080A0F;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 700;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    letter-spacing: 0.04em;
    box-shadow: 0 0 28px rgba(232,197,71,0.25);
    transition: all 0.22s ease;
    margin-bottom: 24px;
    animation: fadeUp 0.5s ease 0.6s both;
  }
  .login-form button[type="submit"]:hover {
    background: #f5d253;
    box-shadow: 0 0 44px rgba(232,197,71,0.4);
    transform: translateY(-2px);
  }
  .login-form button[type="submit"]:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }

  .signup-text {
    text-align: center;
    font-size: 13px;
    color: #5A5C6E;
    animation: fadeUp 0.5s ease 0.72s both;
  }
  .signup-link {
    color: #E8C547;
    font-weight: 600;
    text-decoration: none;
    margin-left: 4px;
    transition: color 0.18s;
  }
  .signup-link:hover { color: #f5d253; text-decoration: underline; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 480px) {
    .login-form { padding: 24px 16px 20px; }
    .login-form h2 { font-size: 24px; }
  }

  /* XP Popup */
  .xp-popup {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%) translateY(-100px);
    background: linear-gradient(135deg, #E8C547 0%, #f5d253 100%);
    color: #080A0F;
    padding: 14px 28px;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 700;
    font-size: 16px;
    box-shadow: 0 8px 32px rgba(232,197,71,0.4);
    z-index: 1000;
    opacity: 0;
    transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    text-align: center;
  }
  .xp-popup.show {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
  .xp-amount { font-size: 22px; font-weight: 900; }
  .xp-total  { font-size: 12px; font-weight: 500; opacity: 0.8; margin-top: 2px; }
`;