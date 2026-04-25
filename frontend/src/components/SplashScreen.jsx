import { useEffect, useState } from 'react';
import './SplashScreen.css';

const SplashScreen = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out after 3.5 seconds
    const fadeTimer = setTimeout(() => setFadeOut(true), 3500);
    // Remove splash after 4.5 seconds
    const doneTimer = setTimeout(() => onComplete(), 4500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  return (
    <div className={`splash ${fadeOut ? 'splash--out' : ''}`}>
      <div className="splash-content">
        <div className="splash-logo-wrap">
          <div className="splash-icon">⬡</div>
          <div className="splash-ripple"></div>
          <div className="splash-ripple splash-ripple--2"></div>
        </div>
        <div className="splash-text">
          <span className="splash-brand">TRACKMYCASH</span>
          <span className="splash-tagline">Your money. Your control.</span>
        </div>
        <div className="splash-loader">
          <div className="splash-loader-bar"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;