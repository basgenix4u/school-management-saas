export function RadialScore({ score, label }: { score: number; label: string }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="radial-wrap">
      <svg width="128" height="128" viewBox="0 0 128 128" aria-label={`${label} ${score}%`}>
        <circle cx="64" cy="64" r={radius} fill="none" stroke="rgba(15,23,42,.08)" strokeWidth="12" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 64 64)"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="#2563eb" />
            <stop offset="1" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>
      <div className="radial-center">
        <strong>{score}%</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}
