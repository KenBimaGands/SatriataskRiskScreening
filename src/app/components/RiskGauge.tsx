import { getRiskColor } from '../data/mockData';

interface RiskGaugeProps {
  score: number;
  size?: number;
}

export function RiskGauge({ score, size = 96 }: RiskGaugeProps) {
  const tier = score >= 81 ? 'critical' : score >= 61 ? 'high' : score >= 31 ? 'medium' : 'low';
  const color = getRiskColor(tier);
  const radius = (size / 2) - 8;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  // Arc covers 270 degrees (from 135deg to 405deg / 45deg)
  const arcLength = circumference * 0.75;
  const filled = arcLength * (score / 100);
  const gap = arcLength - filled;

  // Starting at 135 degrees (bottom-left)
  const startAngle = 135;
  const startRad = (startAngle * Math.PI) / 180;
  const startX = cx + radius * Math.cos(startRad);
  const startY = cy + radius * Math.sin(startRad);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(0deg)' }}>
        {/* Background track */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={size <= 64 ? 5 : 7}
          strokeDasharray={`${arcLength} ${circumference - arcLength}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          style={{ transform: `rotate(135deg)`, transformOrigin: `${cx}px ${cy}px` }}
        />
        {/* Filled arc */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={size <= 64 ? 5 : 7}
          strokeDasharray={`${filled} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          style={{ transform: `rotate(135deg)`, transformOrigin: `${cx}px ${cy}px`, transition: 'stroke-dasharray 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          style={{
            fontFamily: 'var(--text-h2-family)',
            fontSize: size <= 64 ? '18px' : size <= 80 ? '22px' : '26px',
            color: color,
            lineHeight: 1,
            fontWeight: 400,
          }}
        >
          {score}
        </span>
        <span
          className="caption"
          style={{ color: 'var(--muted-foreground)', fontSize: '10px', marginTop: '2px' }}
        >
          / 100
        </span>
      </div>
    </div>
  );
}
