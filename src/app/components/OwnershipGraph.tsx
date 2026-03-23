import { Company } from '../data/mockData';

interface OwnershipGraphProps {
  company: Company;
}

const JURISDICTION_FLAGS: Record<string, string> = {
  'Indonesia': '🇮🇩',
  'Singapore': '🇸🇬',
  'British Virgin Islands': '🇻🇬',
  'Cayman Islands': '🇰🇾',
  'Netherlands': '🇳🇱',
  'United Kingdom': '🇬🇧',
  'Hong Kong': '🇭🇰',
  'Mauritius': '🇲🇺',
  'Jersey': '🇯🇪',
};

export function OwnershipGraph({ company }: OwnershipGraphProps) {
  const { ownershipNodes, ownershipEdges } = company;

  if (ownershipNodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-48" style={{ color: 'var(--muted-foreground)' }}>
        No ownership data available
      </div>
    );
  }

  // Calculate SVG bounds
  const padding = 60;
  const nodeW = 140;
  const nodeH = 52;

  const xs = ownershipNodes.map(n => n.x);
  const ys = ownershipNodes.map(n => n.y);
  const minX = Math.min(...xs) - padding;
  const maxX = Math.max(...xs) + nodeW + padding;
  const minY = Math.min(...ys) - padding;
  const maxY = Math.max(...ys) + nodeH + padding;
  const svgW = maxX - minX;
  const svgH = maxY - minY;

  const nodeMap = Object.fromEntries(ownershipNodes.map(n => [n.id, n]));

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`${minX} ${minY} ${svgW} ${svgH}`}
        width="100%"
        style={{ minHeight: 200, maxHeight: 340 }}
      >
        {/* Edges */}
        {ownershipEdges.map((edge, i) => {
          const src = nodeMap[edge.source];
          const tgt = nodeMap[edge.target];
          if (!src || !tgt) return null;
          const x1 = src.x + nodeW / 2;
          const y1 = src.y + nodeH;
          const x2 = tgt.x + nodeW / 2;
          const y2 = tgt.y;
          const midY = (y1 + y2) / 2;
          return (
            <g key={i}>
              <path
                d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                fill="none"
                stroke="var(--border)"
                strokeWidth={1.5}
                strokeDasharray={edge.sharePercent === 0 ? '4 3' : 'none'}
              />
              {edge.sharePercent > 0 && (
                <text
                  x={(x1 + x2) / 2}
                  y={midY - 4}
                  textAnchor="middle"
                  fill="var(--muted-foreground)"
                  fontSize={10}
                  fontFamily="var(--text-caption-family)"
                >
                  {edge.sharePercent}%
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {ownershipNodes.map(node => {
          const isHaven = node.isTaxHaven;
          const isTarget = node.type === 'operating';
          const isUnknown = node.type === 'unknown';
          const flag = JURISDICTION_FLAGS[node.jurisdiction] || '🏳';
          const borderColor = isTarget
            ? 'var(--accent)'
            : isHaven
            ? 'var(--destructive)'
            : isUnknown
            ? 'var(--primary)'
            : 'var(--border)';
          const bgColor = isTarget
            ? 'rgba(32,127,222,0.12)'
            : isHaven
            ? 'rgba(191,77,67,0.12)'
            : 'rgba(255,255,255,0.04)';

          return (
            <g key={node.id}>
              <rect
                x={node.x}
                y={node.y}
                width={nodeW}
                height={nodeH}
                rx={8}
                fill={bgColor}
                stroke={borderColor}
                strokeWidth={isTarget || isHaven ? 1.5 : 1}
              />
              {/* Flag + Jurisdiction */}
              <text
                x={node.x + 8}
                y={node.y + 16}
                fontSize={12}
              >
                {flag}
              </text>
              {isHaven && (
                <text
                  x={node.x + nodeW - 8}
                  y={node.y + 14}
                  textAnchor="end"
                  fontSize={9}
                  fontFamily="var(--text-caption-family)"
                  fill="var(--destructive)"
                  fontWeight={500}
                >
                  TAX HAVEN
                </text>
              )}
              {/* Entity name */}
              <text
                x={node.x + 8}
                y={node.y + 30}
                fontSize={10.5}
                fontFamily="var(--text-p-family)"
                fill={isHaven ? 'var(--destructive)' : 'var(--foreground)'}
                fontWeight={isTarget ? 500 : 400}
              >
                {node.name.length > 18 ? node.name.slice(0, 18) + '…' : node.name}
              </text>
              {/* Jurisdiction */}
              <text
                x={node.x + 8}
                y={node.y + 44}
                fontSize={9}
                fontFamily="var(--text-caption-family)"
                fill="var(--muted-foreground)"
              >
                {node.jurisdiction}
              </text>
              {node.type === 'unknown' && (
                <text
                  x={node.x + nodeW - 8}
                  y={node.y + 14}
                  textAnchor="end"
                  fontSize={9}
                  fontFamily="var(--text-caption-family)"
                  fill="var(--primary)"
                  fontWeight={500}
                >
                  UBO
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 px-2">
        {[
          { color: 'var(--accent)', label: 'Operating entity' },
          { color: 'var(--destructive)', label: 'Tax haven node' },
          { color: 'var(--primary)', label: 'UBO / Unknown beneficial owner' },
          { color: 'var(--border)', label: 'Holding / subsidiary' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm border" style={{ borderColor: item.color, background: `${item.color}22` }} />
            <span className="caption" style={{ color: 'var(--muted-foreground)' }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
