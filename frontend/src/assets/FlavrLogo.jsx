// ─── Flavr Wordmark Logo — SVG ─────────────────────
// Premium scalable logo: icon mark + wordmark
// Dark/light mode aware via currentColor + gradient

export function FlavrLogoFull({ size = 32, className = '' }) {
  const w = size * 4.2;
  const h = size;
  return (
    <svg width={w} height={h} viewBox="0 0 168 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="flavrGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
      </defs>

      {/* Icon: Stylized fork-flame mark */}
      <g transform="translate(2, 2)">
        <circle cx="18" cy="18" r="17.5" fill="url(#flavrGrad)" opacity="0.08" />
        <circle cx="18" cy="18" r="17.5" stroke="url(#flavrGrad)" strokeWidth="1.2" opacity="0.3" />
        <path d="M12 26V14c0-2 1-4 2-5M18 26V10c0-2 1-3 2-4M24 26V14c0-2 1-3 2-4" stroke="url(#flavrGrad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 6c0 2-2 4-2 4s2 1 4 0c0 0-2-2-2-4z" fill="url(#flavrGrad)" opacity="0.6" />
        <path d="M14 26h8l-2 6h-4l-2-6z" fill="url(#flavrGrad)" opacity="0.9" />
      </g>

      {/* Wordmark */}
      <g transform="translate(48, 0)" fill="currentColor">
        <path d="M2 32V6h14v3H6v8h10v3H6v12H2z" />
        <path d="M22 6h4v26h-4V6z" />
        <path d="M36 18c-5 0-8 3-8 8s3 8 8 8c2 0 4-1 5-2v-2h-4c-2 0-4-1-4-4s2-4 4-4h7v8c0 5-3 8-8 8s-8-4-8-10 4-10 10-10c3 0 5 1 6 2v3c-1-1-3-2-6-2zm-4 9c0-2 2-3 4-3h3v2c0 1-1 2-3 2s-4-1-4-1z" />
        <path d="M54 6l5 18 5-18h5l-8 26h-4l-8-26h5z" />
        <path d="M76 10c-1-1-3-4-3-4h5l1 4h-3zm-2 22V8c0-2 2-4 5-4h5c4 0 6 2 6 5 0 2-1 4-3 5l3 4h-5l-2-4h-1v12h-4zm4-15h3c1 0 2 1 2 2s-1 2-2 2h-3v-4z" />
      </g>
    </svg>
  );
}

// ─── Icon-only version (favicon/badge) ─────────────
export function FlavrIcon({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="flavrIconGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#DC2626" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="19" fill="url(#flavrIconGrad)" opacity="0.1" />
      <circle cx="20" cy="20" r="19" stroke="url(#flavrIconGrad)" strokeWidth="1.2" opacity="0.3" />
      <path d="M14 30V16c0-2 1-4 2-5M20 30V12c0-2 1-3 2-4M26 30V16c0-2 1-3 2-4" stroke="url(#flavrIconGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 8c0 2-2 4-2 4s2 1 4 0c0 0-2-2-2-4z" fill="url(#flavrIconGrad)" opacity="0.6" />
      <path d="M16 30h8l-2 6h-4l-2-6z" fill="url(#flavrIconGrad)" opacity="0.9" />
    </svg>
  );
}
