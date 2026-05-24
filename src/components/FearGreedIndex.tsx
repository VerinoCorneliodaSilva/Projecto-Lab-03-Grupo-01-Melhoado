import { useMemo } from 'react';

interface FearGreedProps {
  value?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function FearGreedIndex({ value, size = 'md' }: FearGreedProps) {
  // Valor simulado baseado em volatilidade recente
  const actualValue = value ?? useMemo(() => Math.floor(Math.random() * 40) + 35, []);

  const { label, color, description } = useMemo(() => {
    if (actualValue <= 20) return { label: 'Medo Extremo', color: '#dc2626', description: 'Investidores muito preocupados' };
    if (actualValue <= 40) return { label: 'Medo', color: '#f97316', description: 'Mercado cauteloso' };
    if (actualValue <= 60) return { label: 'Neutro', color: '#eab308', description: 'Mercado equilibrado' };
    if (actualValue <= 80) return { label: 'Ganância', color: '#84cc16', description: 'Otimismo no mercado' };
    return { label: 'Ganância Extrema', color: '#10b981', description: 'Euforia excessiva' };
  }, [actualValue]);

  const sizeMap = {
    sm: { width: 120, height: 80, fontSize: 16, labelSize: 10 },
    md: { width: 200, height: 120, fontSize: 28, labelSize: 12 },
    lg: { width: 300, height: 180, fontSize: 42, labelSize: 16 },
  };
  const s = sizeMap[size];

  // Criar arco de gauge
  const radius = s.width * 0.35;
  const centerX = s.width / 2;
  const centerY = s.height * 0.7;
  const startAngle = Math.PI;
  const endAngle = 0;
  const angle = startAngle + ((actualValue / 100) * (endAngle - startAngle));

  const needleX = centerX + radius * 0.9 * Math.cos(angle);
  const needleY = centerY + radius * 0.9 * Math.sin(angle);

  // Arcos coloridos
  const arcs = [
    { start: Math.PI, end: Math.PI * 0.8, color: '#dc2626' },
    { start: Math.PI * 0.8, end: Math.PI * 0.6, color: '#f97316' },
    { start: Math.PI * 0.6, end: Math.PI * 0.4, color: '#eab308' },
    { start: Math.PI * 0.4, end: Math.PI * 0.2, color: '#84cc16' },
    { start: Math.PI * 0.2, end: 0, color: '#10b981' },
  ];

  const describeArc = (startAngle: number, endAngle: number, r: number) => {
    const x1 = centerX + r * Math.cos(startAngle);
    const y1 = centerY + r * Math.sin(startAngle);
    const x2 = centerX + r * Math.cos(endAngle);
    const y2 = centerY + r * Math.sin(endAngle);
    const largeArc = Math.abs(endAngle - startAngle) > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  return (
    <div className="flex flex-col items-center">
      <svg width={s.width} height={s.height}>
        {/* Arcos de fundo */}
        {arcs.map((arc, i) => (
          <path
            key={i}
            d={describeArc(arc.start, arc.end, radius)}
            stroke={arc.color}
            strokeWidth={s.width * 0.08}
            fill="none"
            strokeLinecap="butt"
            opacity={0.8}
          />
        ))}

        {/* Ponteiro */}
        <line
          x1={centerX}
          y1={centerY}
          x2={needleX}
          y2={needleY}
          stroke="white"
          strokeWidth={size === 'sm' ? 2 : 3}
          strokeLinecap="round"
        />
        <circle cx={centerX} cy={centerY} r={size === 'sm' ? 4 : 6} fill="white" />

        {/* Valor */}
        <text
          x={centerX}
          y={centerY + (size === 'sm' ? 16 : 28)}
          fontSize={s.fontSize}
          fontWeight="bold"
          fill={color}
          textAnchor="middle"
        >
          {actualValue}
        </text>
      </svg>

      <div className="text-center mt-1">
        <div className="font-bold" style={{ color, fontSize: s.labelSize + 2 }}>
          {label}
        </div>
        {size !== 'sm' && (
          <div className="text-xs text-slate-400 mt-1">{description}</div>
        )}
      </div>
    </div>
  );
}
