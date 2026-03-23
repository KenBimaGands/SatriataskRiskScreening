import { RiskTier, getRiskColor, getRiskLabel } from '../data/mockData';

interface RiskBadgeProps {
  tier: RiskTier;
  size?: 'sm' | 'md';
}

export function RiskBadge({ tier, size = 'md' }: RiskBadgeProps) {
  const color = getRiskColor(tier);
  const label = getRiskLabel(tier);

  const bgOpacity = tier === 'critical' ? '22' : tier === 'high' ? '20' : tier === 'medium' ? '1f' : '1a';

  return (
    <span
      className="inline-flex items-center gap-1 rounded px-2 py-0.5"
      style={{
        background: `${color}22`,
        border: `1px solid ${color}44`,
        borderRadius: 'var(--radius-sm)',
        fontFamily: 'var(--text-label-family)',
        fontSize: size === 'sm' ? '11px' : 'var(--text-label-size)',
        fontWeight: 500,
        color,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full inline-block"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}
