import { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
// import Login from "../pages/Login";
import './LoginForm.css';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email : '',
    password : ''
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try{
      const response = await fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: { 'Content-Type':'application/json'},
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if(response.ok){
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/expense-tracker');
      }
      else{
        alert(data.message);
      }
    }
    catch (error) {
      console.error('Error:', error);
      alert('Cannot connect to server');
    }

    setLoading(true);
    setTimeout(() => setLoading(false), 1800);
  };

  return (
    <div className="lc-root">
        <div className="lc-orb lc-orb-1" />
        <div className="lc-orb lc-orb-2" />
        <div className="lc-grid" />

        <div className="login-container">
          <form className="login-form" onSubmit={handleSubmit}>

            {/* Logo */}
            <div className="lc-logo">
              <span className="lc-logo-mark">⬡</span>
              <span className="lc-logo-text">TrackMyCash</span>
            </div>

            <h2>Welcome Back</h2>
            <p className="lc-subtitle">Sign in to your account</p>

            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder=" "
                value={formData.email}
                onChange={handleChange}
                required
              />
              <label>Email</label>
            </div>

            <div className="input-group">
              <input
                type="password"
                name="password"
                placeholder=" "
                value={formData.password}
                onChange={handleChange}
                required
              />
              <label>Password</label>
            </div>

            <a href="#" className="lc-forgot">Forgot password?</a>

            <button type="submit">
              {loading ? "Signing in…" : "Login"}
            </button>

            <div className="lc-divider">
              <div className="lc-divider-line" />
              <span>OR</span>
              <div className="lc-divider-line" />
            </div>

            <p className="signup-text">
              Don't have an account?
              <a href="/signup" className="signup-link">Sign up</a>
            </p>

          </form>
        </div>
      </div>
  )
}

export default LoginForm;