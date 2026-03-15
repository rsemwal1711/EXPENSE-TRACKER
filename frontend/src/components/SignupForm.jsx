import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function getStrength(password) {
  if (!password) return 0;
  if (password.length < 5) return 1;
  if (password.length < 9 || !/[^a-zA-Z0-9]/.test(password)) return 2;
  return 3;
}

const SignupForm = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("https://expensetracker-rs17.onrender.com/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/expense-tracker");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  const strength = getStrength(formData.password);
  const strengthLabels = ["", "weak", "medium", "strong"];

  return (
    <>
      {/* <style>{styles}</style> */}
      <div className="lc-root">
        <div className="lc-orb lc-orb-1" />
        <div className="lc-orb lc-orb-2" />
        <div className="lc-grid" />

        <div className="login-container">
          <form className="login-form" onSubmit={handleSubmit}>

            <div className="lc-logo">
              <span className="lc-logo-mark">⬡</span>
              <span className="lc-logo-text">TrackMyCash</span>
            </div>

            <h2>Create Account</h2>
            <p className="lc-subtitle">Start tracking your finances today</p>

            <div className="input-group">
              <input
                type="text"
                name="name"
                placeholder=" "
                value={formData.name}
                onChange={handleChange}
                required
              />
              <label>Full Name</label>
            </div>

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

            {/* Password strength */}
            {formData.password.length > 0 && (
              <div className="lc-strength">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`lc-strength-seg ${i <= strength ? strengthLabels[strength] : ""}`}
                  />
                ))}
              </div>
            )}

            <p className="lc-terms">
              By signing up you agree to our{" "}
              <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
            </p>

            <button type="submit" disabled={loading}>
              {loading ? (
                <><div className="lc-spinner" /> Creating account…</>
              ) : (
                "Create Account →"
              )}
            </button>

            <div className="lc-divider">
              <div className="lc-divider-line" />
              <span>ALREADY A MEMBER?</span>
              <div className="lc-divider-line" />
            </div>

            <p className="signup-text">
              Already have an account?
              <Link to="/login" className="signup-link"> Login</Link>
            </p>

          </form>
        </div>
      </div>
    </>
  );
};

export default SignupForm;