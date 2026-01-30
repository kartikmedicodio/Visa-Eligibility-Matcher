// Reusable SVG visa-related icons with unique IDs

export function UserIcon({ className = '', id = 'user' }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id={`user-g-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="36" r="16" fill={`url(#user-g-${id})`} opacity="0.95" />
      <path d="M24 88c0-14.4 11.6-26 26-26s26 11.6 26 26" fill={`url(#user-g-${id})`} opacity="0.9" />
    </svg>
  );
}

export function DocumentIcon({ className = '', id = 'document' }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id={`document-g-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      {/* Single document with folded corner */}
      <path
        d="M22 18 L22 82 L78 82 L78 28 L56 28 L56 18 Z"
        fill={`url(#document-g-${id})`}
        opacity="0.95"
      />
      <path d="M56 18 L56 28 L78 28 Z" fill="rgba(255,255,255,0.2)" />
      <rect x="30" y="38" width="44" height="5" rx="2" fill="rgba(255,255,255,0.35)" />
      <rect x="30" y="50" width="38" height="4" rx="2" fill="rgba(255,255,255,0.25)" />
      <rect x="30" y="60" width="42" height="4" rx="2" fill="rgba(255,255,255,0.25)" />
    </svg>
  );
}

export function PassportIcon({ className = '', id = 'passport' }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id={`passport-g-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <rect x="20" y="15" width="60" height="70" rx="4" fill={`url(#passport-g-${id})`} opacity="0.9" />
      <rect x="25" y="22" width="50" height="6" rx="2" fill="rgba(255,255,255,0.3)" />
      <rect x="25" y="35" width="50" height="4" rx="2" fill="rgba(255,255,255,0.2)" />
      <circle cx="50" cy="62" r="7" fill="rgba(255,255,255,0.3)" />
    </svg>
  );
}

export function DocumentStackIcon({ className = '', id = 'docs' }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id={`docs-g-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <rect x="28" y="28" width="50" height="58" rx="2" fill={`url(#docs-g-${id})`} opacity="0.4" transform="rotate(-4 53 57)" />
      <rect x="26" y="22" width="50" height="58" rx="2" fill={`url(#docs-g-${id})`} opacity="0.85" />
      <rect x="32" y="32" width="38" height="4" rx="1.5" fill="rgba(255,255,255,0.3)" />
      <rect x="32" y="40" width="34" height="4" rx="1.5" fill="rgba(255,255,255,0.2)" />
    </svg>
  );
}

export function VisaStampIcon({ className = '', id = 'stamp' }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id={`stamp-g-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="36" fill={`url(#stamp-g-${id})`} opacity="0.9" />
      <circle cx="50" cy="50" r="28" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
      <text x="50" y="48" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontSize="10" fontWeight="600">OK</text>
    </svg>
  );
}
