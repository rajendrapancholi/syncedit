'use clien'
export function Logo({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg xmlns="http://w3.org" viewBox="0 0 240 240" className={className}>
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0b1220" />
          <stop offset="100%" stopColor="#060913" />
        </linearGradient>

        <linearGradient id="bracketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>

        <linearGradient id="pulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>

        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      <rect
        width="240"
        height="240"
        rx="52"
        fill="url(#bgGrad)"
        stroke="#1e293b"
        strokeWidth="1.5"
      />

      <circle
        cx="120"
        cy="120"
        r="90"
        fill="none"
        stroke="#22d3ee"
        strokeWidth="2"
        opacity="0.12"
      />

      <circle
        cx="120"
        cy="120"
        r="90"
        fill="none"
        stroke="#38bdf8"
        strokeWidth="2"
        strokeDasharray="8, 24"
        strokeLinecap="round"
        opacity="0.4"
      />
      <path
        d="M78 70 L48 120 L78 170"
        fill="none"
        stroke="url(#bracketGrad)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M162 70 L192 120 L162 170"
        fill="none"
        stroke="url(#bracketGrad)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <text
        x="120"
        y="134"
        fontFamily="ui-monospace, 'JetBrains Mono', 'Fira Code', Menlo, Monaco, Consolas, monospace"
        fontSize="42"
        fontWeight="800"
        fill="#ffffff"
        textAnchor="middle"
        letterSpacing="-1"
      >
        c0d3
      </text>

      <circle
        cx="120"
        cy="164"
        r="9"
        fill="#f43f5e"
        opacity="0.4"
        filter="url(#neonGlow)"
      />
      <circle cx="120" cy="164" r="4.5" fill="url(#pulseGrad)" />
    </svg>
  );
}
