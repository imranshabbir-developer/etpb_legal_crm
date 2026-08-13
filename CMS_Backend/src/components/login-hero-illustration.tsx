export function LoginHeroIllustration() {
  return (
    <div className="login-hero-illustration" aria-hidden>
      <div className="login-hero-media">
        <svg
          viewBox="0 0 420 420"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="login-hero-svg login-hero-justice"
        >
          <defs>
            <linearGradient id="justiceGlow" x1="60" y1="40" x2="360" y2="380" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E8F8F0" />
              <stop offset="1" stopColor="#CCE8D8" />
            </linearGradient>
            <linearGradient id="justiceMetal" x1="0" y1="0" x2="1" y2="1">
              <stop stopColor="#006b3f" />
              <stop offset="1" stopColor="#003818" />
            </linearGradient>
            <linearGradient id="justiceAccent" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#2dd47a" />
              <stop offset="1" stopColor="#003818" />
            </linearGradient>
            <filter id="justiceSoftShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#001a0c" floodOpacity="0.18" />
            </filter>
          </defs>

          {/* Soft backdrop */}
          <circle cx="210" cy="210" r="168" fill="url(#justiceGlow)" stroke="rgb(45 212 122 / 0.28)" strokeWidth="1.5" />
          <circle
            className="login-hero-justice-ring"
            cx="210"
            cy="210"
            r="132"
            stroke="url(#justiceAccent)"
            strokeWidth="1.2"
            strokeDasharray="5 9"
            opacity="0.55"
          />

          <g filter="url(#justiceSoftShadow)">
            {/* Pillar / stand */}
            <rect x="198" y="118" width="24" height="168" rx="8" fill="url(#justiceMetal)" />
            <rect x="168" y="286" width="84" height="18" rx="9" fill="url(#justiceMetal)" />
            <rect x="148" y="308" width="124" height="22" rx="11" fill="#00512a" />

            {/* Crossbeam */}
            <rect x="88" y="128" width="244" height="14" rx="7" fill="url(#justiceMetal)" />
            <circle cx="210" cy="135" r="16" fill="#003818" stroke="#2dd47a" strokeWidth="3" />
            <circle cx="210" cy="135" r="6" fill="#40e0a0" className="login-hero-justice-jewel" />

            {/* Left scale */}
            <g className="login-hero-justice-pan login-hero-justice-pan-left">
              <line x1="118" y1="142" x2="118" y2="214" stroke="#003818" strokeWidth="3" strokeLinecap="round" />
              <path d="M78 214 L158 214 L148 252 Q118 268 88 252 Z" fill="url(#justiceAccent)" opacity="0.95" />
              <path d="M88 252 Q118 268 148 252" stroke="#40e0a0" strokeWidth="2" fill="none" />
            </g>

            {/* Right scale */}
            <g className="login-hero-justice-pan login-hero-justice-pan-right">
              <line x1="302" y1="142" x2="302" y2="214" stroke="#003818" strokeWidth="3" strokeLinecap="round" />
              <path d="M262 214 L342 214 L332 252 Q302 268 272 252 Z" fill="url(#justiceAccent)" opacity="0.95" />
              <path d="M272 252 Q302 268 332 252" stroke="#40e0a0" strokeWidth="2" fill="none" />
            </g>
          </g>

          {/* Floating law marks */}
          <g className="login-hero-justice-marks" fill="#00512a">
            <text x="64" y="96" fontSize="20" fontFamily="Georgia, serif" fontWeight="700" opacity="0.75">
              §
            </text>
            <circle cx="348" cy="102" r="10" stroke="#00512a" strokeWidth="2" fill="none" opacity="0.55" />
            <path d="M342 102 H354 M348 96 V108" stroke="#00512a" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
            <text x="72" y="324" fontSize="16" fontFamily="Georgia, serif" fontWeight="700" opacity="0.5">
              ¶
            </text>
          </g>
        </svg>
      </div>

      <p className="login-hero-caption">
        IPS - Legal CRM Management System
      </p>
    </div>
  );
}
