/** Enterprise vector lines & mesh behind the login card (dashboard-style). */
export function LoginAtmosphere() {
  return (
    <div className="login-atmosphere pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="login-atmosphere-glow absolute inset-x-0 top-0" />
      <div className="login-atmosphere-mesh absolute inset-0" />
      <div className="login-atmosphere-grid absolute inset-0" />
      <div className="login-atmosphere-network absolute inset-x-0 top-0" />
      <svg className="login-atmosphere-vectors absolute inset-x-0 top-0" viewBox="0 0 1440 420" preserveAspectRatio="xMidYMin slice">
        <defs>
          <linearGradient id="loginLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#003818" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#2dd47a" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        <g fill="none" stroke="url(#loginLineGrad)" strokeWidth="1.2" opacity="0.65">
          <path d="M0 88 H1440" strokeDasharray="6 10" opacity="0.35" />
          <path d="M120 40 L320 120 L540 56 L760 132 L980 72 L1200 118 L1440 48" />
          <path d="M0 168 L240 108 L420 196 L640 124 L860 204 L1080 140 L1440 176" />
          <path d="M320 120 L420 196" />
          <path d="M540 56 L640 124" />
          <path d="M760 132 L860 204" />
          <path d="M980 72 L1080 140" />
          <path d="M180 248 L360 188 L520 268 L720 210 L920 278 L1120 220" opacity="0.45" />
        </g>
        <g fill="#003818" opacity="0.75">
          <circle cx="120" cy="40" r="3" />
          <circle cx="320" cy="120" r="2.5" />
          <circle cx="540" cy="56" r="3" />
          <circle cx="760" cy="132" r="2.5" />
          <circle cx="980" cy="72" r="3" />
          <circle cx="1200" cy="118" r="2.5" />
          <circle cx="420" cy="196" r="2" />
          <circle cx="640" cy="124" r="2.5" />
          <circle cx="860" cy="204" r="2" />
        </g>
      </svg>
    </div>
  );
}
