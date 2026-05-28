export function TrendLine({ data, color = "#2563eb" }: { data: number[]; color?: string }) {
  const width = 320;
  const height = 96;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = Math.max(max - min, 1);
  const points = data
    .map((value, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * width;
      const y = height - ((value - min) / range) * (height - 14) - 7;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="trend-line" role="img" aria-label="Trend chart">
      <defs>
        <linearGradient id={`line-${color.replace("#", "")}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={`url(#line-${color.replace("#", "")})`} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" points={points} />
      {data.map((value, index) => {
        const x = (index / Math.max(data.length - 1, 1)) * width;
        const y = height - ((value - min) / range) * (height - 14) - 7;
        return <circle key={`${value}-${index}`} cx={x} cy={y} r="3.5" fill={color} opacity={index === data.length - 1 ? 1 : 0.35} />;
      })}
    </svg>
  );
}
