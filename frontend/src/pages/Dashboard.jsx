import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

const FEATURES = [
  { icon: "◈", title: "Smart Expense Tracking", desc: "Log every rupee in seconds. Categorise automatically, edit anytime. No spreadsheet juggling.", colorClass: "feat-yellow" },
  { icon: "⌇", title: "Visual Spending Insights", desc: "Beautiful charts that surface your patterns — weekly, monthly, yearly. Know where it all goes.", colorClass: "feat-teal" },
  { icon: "◎", title: "Savings Goals", desc: "Set a goal, track progress, celebrate wins. Trip to Goa or a new laptop — we keep you on course.", colorClass: "feat-purple" },
  { icon: "⚡", title: "Budget Alerts", desc: "Set monthly limits per category. Get nudged before you overspend — not after.", colorClass: "feat-orange" },
  { icon: "⇄", title: "Income & Cash Flow", desc: "Track salary, freelance income, interest — all in one place. See your real net position.", colorClass: "feat-pink" },
  { icon: "🔒", title: "Private & Secure", desc: "Your data is yours. No ads, no selling your info. End-to-end encrypted and always private.", colorClass: "feat-teal" },
];

const STEPS = [
  { num: "01", title: "Create your account", desc: "Sign up free in 30 seconds. No credit card, no catch." },
  { num: "02", title: "Add your expenses", desc: "Log manually or import from your bank statement in one click." },
  { num: "03", title: "See the full picture", desc: "Charts, trends, and insights update instantly as you track." },
  { num: "04", title: "Take control", desc: "Set budgets, build goals, and actually stick to them." },
];

const TESTIMONIALS = [
  { name: "Priya S.", role: "Freelance Designer · Bangalore", quote: "I finally stopped wondering where my money went. TrackMyCash showed me I was spending ₹6,000/month on food delivery. Eye-opening.", avatar: "P" },
  { name: "Rahul M.", role: "Software Engineer · Pune", quote: "The goals feature is addictive. Saved for my Goa trip in 3 months while tracking every expense. Highly recommend.", avatar: "R" },
  { name: "Anika T.", role: "Student · Delhi", quote: "Simple, beautiful, and actually useful. Other apps felt complicated. This one just works.", avatar: "A" },
];

const PLANS = [
  {
  name: "Free", price: "0 XP", period: "to unlock",
  features: ["Up to 50 transactions/month", "3 spending categories", "Basic charts", "1 savings goal"],
  cta: "Get Started", highlight: false,
},
{
  name: "Pro", price: "1,500 XP", period: "per month",
  features: ["Unlimited transactions", "Unlimited categories", "Advanced analytics", "Unlimited goals", "Budget alerts", "CSV export", "Priority support"],
  cta: "Unlock with XP", highlight: true,
},
{
  name: "Family", price: "2,500 XP", period: "per month",
  features: ["Everything in Pro", "Up to 5 members", "Shared expense tracking", "Family budget view", "Dedicated support"],
  cta: "Unlock with XP", highlight: false,
},
];

const STATS = [
  { value: "6", label: "Powerful features" },
{ value: "3", label: "Flexible plans" },
{ value: "100%", label: "Free to start" },
{ value: "0", label: "Hidden charges" }
];

function Section({ children, className = "", id = "" }) {
  const [ref, visible] = useReveal();
  return (
    <section ref={ref} id={id} className={`lp-section ${visible ? "lp-section--visible" : ""} ${className}`}>
      {children}
    </section>
  );
}

export default function LandingPage() {
  const [dark, setDark] = useState(true);
  const [hovered, setHovered] = useState(null);
  const navigate = useNavigate();

  return (
    <div className={`lp-root ${dark ? "theme-dark" : "theme-light"}`}>
      <div className="lp-orb lp-orb-1" />
      <div className="lp-orb lp-orb-2" />
      <div className="lp-grid-overlay" />

      {/* ── NAVBAR ── */}
      <nav className="lp-nav lp-nav--full">
        <div className="lp-logo">
          <span className="lp-logo-mark">⬡</span>
          <span className="lp-logo-text">TrackMyCash</span>
        </div>
        <div className="lp-nav-links">
          <a href="#features" className="lp-nav-link">Features</a>
          <a href="#how-it-works" className="lp-nav-link">How it Works</a>
          <a href="#pricing" className="lp-nav-link">Pricing</a>
        </div>
        <div className="lp-nav-actions">
          <button className="lp-theme-toggle" onClick={() => setDark(!dark)} aria-label="Toggle theme">
            <div className={`lp-toggle-track ${dark ? "is-dark" : "is-light"}`}>
              <div className="lp-toggle-thumb">
                {dark ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" fill="currentColor" />
                  </svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="4" fill="currentColor" />
                    <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                )}
              </div>
            </div>
          </button>
          <button className="lp-btn lp-btn-ghost lp-btn--sm" onClick={() => navigate("/login")}>Sign In</button>
          <button className="lp-btn lp-btn-primary lp-btn--sm" onClick={() => navigate("/signup")}>Get Started →</button>
        </div>
      </nav>

      {/* ── 1. HERO ── */}
      <section className="lp-hero lp-hero--full">
        <div className="lp-badge lp-delay-1">✦ Smart Finance Tracking</div>
        <h1 className="lp-headline">
          <span className="lp-headline-line lp-delay-2">Your money,</span>
          <span className="lp-headline-line lp-headline-accent lp-delay-3">finally clear.</span>
        </h1>
        <p className="lp-slogan lp-delay-4">
          Track every rupee. Spot every pattern.<br />
          Take control before your next expense takes control of you.
        </p>
        <div className="lp-actions lp-delay-5">
          <button
            className={`lp-btn lp-btn-primary lp-btn--lg ${hovered === "signup" ? "active" : ""}`}
            onMouseEnter={() => setHovered("signup")}
            onMouseLeave={() => setHovered(null)}
            onClick={() => navigate("/signup")}
          >
            <span>Start for Free</span>
            <span className="lp-btn-arrow">→</span>
          </button>
          <button
            className={`lp-btn lp-btn-ghost lp-btn--lg ${hovered === "login" ? "active" : ""}`}
            onMouseEnter={() => setHovered("login")}
            onMouseLeave={() => setHovered(null)}
            onClick={() => navigate("/login")}
          >
            Sign In
          </button>
        </div>
        <p className="lp-footnote lp-delay-6">No credit card required &nbsp;·&nbsp; Free forever plan &nbsp;·&nbsp; Setup in 30 seconds</p>
        <div className="lp-float lp-float-left lp-delay-7">
          <div className="lp-float-label">Monthly Saved</div>
          <div className="lp-float-value">₹12,400</div>
          <div className="lp-float-tag up">↑ 18% this month</div>
        </div>
        <div className="lp-float lp-float-right lp-delay-8">
          <div className="lp-float-label">Top Expense</div>
          <div className="lp-float-value">Groceries</div>
          <div className="lp-float-tag neutral">₹3,280 · Mar</div>
        </div>
      </section>

      {/* ── 2. STATS ── */}
      <Section className="lp-stats-section">
        <div className="lp-stats-grid">
          {STATS.map((s, i) => (
            <div key={i} className="lp-stat-card">
              <p className="lp-stat-value">{s.value}</p>
              <p className="lp-stat-label">{s.label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 3. FEATURES ── */}
      <Section className="lp-features-section" id="features">
        <div className="lp-section-header">
          <p className="lp-section-tag">✦ Features</p>
          <h2 className="lp-section-title">
            Everything you need to<br />
            <span className="lp-title-outline">own your finances</span>
          </h2>
          <p className="lp-section-sub">No bloat. No complexity. Just the tools that actually help you spend smarter and save more.</p>
        </div>
        <div className="lp-features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className={`lp-feature-card ${f.colorClass}`}>
              <div className="lp-feature-icon">{f.icon}</div>
              <h3 className="lp-feature-title">{f.title}</h3>
              <p className="lp-feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 4. HOW IT WORKS ── */}
      <Section className="lp-how-section" id="how-it-works">
        <div className="lp-how-inner">
          <div className="lp-section-header">
            <p className="lp-section-tag">✦ How it Works</p>
            <h2 className="lp-section-title">
              Up and running in<br />
              <span className="lp-title-outline">under 2 minutes</span>
            </h2>
          </div>
          <div className="lp-steps-grid">
            <div className="lp-steps-connector" />
            {STEPS.map((step, i) => (
              <div key={i} className={`lp-step ${i === 0 ? "lp-step--active" : ""}`}>
                <div className="lp-step-num">{step.num}</div>
                <h4 className="lp-step-title">{step.title}</h4>
                <p className="lp-step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── 5. TESTIMONIALS ── */}
      <Section className="lp-testimonials-section">
        <div className="lp-section-header">
          <p className="lp-section-tag">✦ Testimonials</p>
          <h2 className="lp-section-title">
            Loved by people who<br />
            <span className="lp-title-outline">take money seriously</span>
          </h2>
        </div>
        <div className="lp-testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="lp-testimonial-card">
              <div className="lp-stars">{"★".repeat(5)}</div>
              <p className="lp-testimonial-quote">"{t.quote}"</p>
              <div className="lp-testimonial-author">
                <div className="lp-testimonial-avatar">{t.avatar}</div>
                <div>
                  <p className="lp-testimonial-name">{t.name}</p>
                  <p className="lp-testimonial-role">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 6. PRICING ── */}
      <Section className="lp-pricing-section" id="pricing">
        <div className="lp-section-header">
          <p className="lp-section-tag">✦ Pricing</p>
          <h2 className="lp-section-title">
            Simple, honest pricing.<br />
            <span className="lp-title-outline">No surprises.</span>
          </h2>
          <p className="lp-section-sub">Start free. Upgrade when you're ready. Cancel anytime.</p>
        </div>
        <div className="lp-pricing-grid">
          {PLANS.map((plan, i) => (
            <div key={i} className={`lp-plan-card ${plan.highlight ? "lp-plan-card--highlight" : ""}`}>
              {plan.highlight && <div className="lp-plan-badge">MOST POPULAR</div>}
              <p className="lp-plan-name">{plan.name}</p>
              <p className="lp-plan-price">{plan.price}</p>
              <p className="lp-plan-period">{plan.period}</p>
              <ul className="lp-plan-features">
                {plan.features.map((feat, j) => (
                  <li key={j} className="lp-plan-feature">
                    <span className="lp-plan-check">✓</span>
                    {feat}
                  </li>
                ))}
              </ul>
              <button
                className={`lp-btn ${plan.highlight ? "lp-btn-primary" : "lp-btn-ghost"} lp-plan-cta`}
                onClick={() => navigate("/signup")}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 7. FINAL CTA ── */}
      <Section className="lp-cta-section">
        <div className="lp-cta-inner">
          <div className="lp-cta-glow" />
          <p className="lp-section-tag">✦ Get Started Today</p>
          <h2 className="lp-cta-title">
            Stop wondering.<br />
            <span className="lp-title-outline">Start knowing.</span>
          </h2>
          <p className="lp-cta-sub">Join 12,000+ people who took control of their finances with TrackMyCash. It's free to start.</p>
          <div className="lp-actions">
            <button className="lp-btn lp-btn-primary lp-btn--lg" onClick={() => navigate("/signup")}>
              <span>Create Free Account</span>
              <span className="lp-btn-arrow">→</span>
            </button>
            <button className="lp-btn lp-btn-ghost lp-btn--lg" onClick={() => navigate("/login")}>Sign In</button>
          </div>
          <p className="lp-footnote">No credit card · Free forever plan · Cancel Pro anytime</p>
        </div>
      </Section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer lp-footer--full">
        <div className="lp-logo">
          <span className="lp-logo-mark">⬡</span>
          <span className="lp-logo-text">TrackMyCash</span>
        </div>
        <div className="lp-footer-links">
          <span>© 2026 TrackMyCash</span>
          <span>·</span>
          <span>Privacy</span>
          <span>·</span>
          <span>Terms</span>
          <span>·</span>
          <span>Contact</span>
        </div>
      </footer>
    </div>
  );
}