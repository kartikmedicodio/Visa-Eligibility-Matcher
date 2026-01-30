import { useEffect } from 'react';
import './SplashPage.css';

const SPLASH_DURATION_MS = 5000;

const icons = [
  {
    id: 'visa',
    label: 'Visa',
    delay: 0.2,
    x: '12%',
    y: '18%',
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="splash-icon-svg">
        <rect x="4" y="8" width="40" height="32" rx="4" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M4 16h40M14 24h8M14 28h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="34" cy="24" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
    ),
  },
  {
    id: 'documents',
    label: 'Documents',
    delay: 0.4,
    x: '78%',
    y: '22%',
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="splash-icon-svg">
        <path d="M12 6h18l12 12v24a2 2 0 01-2 2H12a2 2 0 01-2-2V8a2 2 0 012-2z" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M30 6v12h12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M16 22h16M16 28h12M16 34h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'travel',
    label: 'Travel',
    delay: 0.5,
    x: '8%',
    y: '62%',
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="splash-icon-svg">
        <path d="M8 20h32l-4 20H12L8 20z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" />
        <path d="M16 20V14a4 4 0 018 0v6M20 40v4M28 40v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="24" cy="28" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
    ),
  },
  {
    id: 'flight',
    label: 'Flight',
    delay: 0.6,
    x: '82%',
    y: '58%',
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="splash-icon-svg">
        <path d="M44 28L28 24l6-14-8 4-6 10-12-4-4 6 12 2 16 8 6 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M14 20l-6 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'student',
    label: 'Student',
    delay: 0.35,
    x: '22%',
    y: '72%',
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="splash-icon-svg">
        <path d="M24 8L6 16v6l18 8 18-8v-6L24 8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" fill="none" />
        <path d="M6 22l18 8 18-8M12 26v10l12 6 12-6V26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'worker',
    label: 'Worker',
    delay: 0.55,
    x: '72%',
    y: '78%',
    svg: (
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="splash-icon-svg">
        <path d="M12 20h24v18a2 2 0 01-2 2H14a2 2 0 01-2-2V20z" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M16 20V14a4 4 0 018 0v6M24 38v4M20 42h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function SplashPage({ onComplete }) {
  useEffect(() => {
    const t = setTimeout(() => {
      onComplete?.();
    }, SPLASH_DURATION_MS);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div className="splash-page" role="presentation" aria-label="Loading">
      <div className="splash-background-orbs">
        <div className="splash-orb splash-orb-1" />
        <div className="splash-orb splash-orb-2" />
      </div>

      <div className="splash-icons">
        {icons.map(({ id, label, delay, x, y, svg }) => (
          <div
            key={id}
            className="splash-icon"
            style={{
              '--splash-x': x,
              '--splash-y': y,
              '--splash-delay': `${delay}s`,
            }}
            aria-hidden
          >
            <span className="splash-icon-inner" style={{ color: 'var(--purple-accent)' }}>
              {svg}
            </span>
          </div>
        ))}
      </div>

      <div className="splash-title-wrap">
        <h1 className="splash-title">Visa Eligibility Determination System</h1>
        <div className="splash-subtitle">Match profiles to visa petitions</div>
        <p className="splash-message">
          Check applicant profiles against visa petition criteria and get eligibility scores for visa.
        </p>
      </div>

      <div className="splash-progress">
        <div className="splash-progress-bar" />
      </div>
    </div>
  );
}
