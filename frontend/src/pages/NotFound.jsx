import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080A0F',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '24px',
      fontFamily: 'DM Sans, sans-serif',
      color: '#EEF0F6'
    }}>
      <div style={{ fontSize: '80px' }}>⬡</div>
      <h1 style={{ fontSize: '48px', color: '#E8C547' }}>404</h1>
      <p style={{ fontSize: '16px', color: '#5A5C6E' }}>Page not found</p>
      <button
        onClick={() => navigate('/expense-tracker')}
        style={{
          padding: '12px 32px',
          background: '#E8C547',
          color: '#080A0F',
          border: 'none',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: '700',
          cursor: 'pointer',
          letterSpacing: '0.04em'
        }}
      >
        Go to Dashboard
      </button>
    </div>
  );
};

export default NotFound;