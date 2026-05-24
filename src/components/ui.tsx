import { ReactNode } from 'react';
import { currencies, CurrencyCode } from '../data/cryptoData';

interface SparklineProps {
  data: number[];
  positive: boolean;
  width?: number;
  height?: number;
}

export function Sparkline({ data, positive, width = 120, height = 40 }: SparklineProps) {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const color = positive ? '#10b981' : '#ef4444';

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${positive}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#grad-${positive})`}
      />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

interface PercentChangeProps {
  value: number;
  size?: 'sm' | 'md';
}

export function PercentChange({ value, size = 'sm' }: PercentChangeProps) {
  const isPositive = value >= 0;
  const arrow = isPositive ? '▲' : '▼';
  const color = isPositive ? 'text-emerald-500' : 'text-red-500';
  const sizeClass = size === 'sm' ? 'text-xs' : 'text-sm';
  return (
    <span className={`${color} ${sizeClass} font-medium whitespace-nowrap`}>
      {arrow} {Math.abs(value).toFixed(2)}%
    </span>
  );
}

export function formatNumber(num: number, maxDecimals = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  }).format(num);
}

export function formatCompact(num: number): string {
  return new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(num);
}

export function CryptoIcon({ symbol, color, size = 32, icon }: { symbol: string; color: string; size?: number; icon?: string }) {
  return (
    <div
      className="flex items-center justify-center rounded-full font-bold text-white shrink-0"
      style={{ backgroundColor: color, width: size, height: size, fontSize: size * 0.5 }}
      aria-label={symbol}
    >
      {icon || symbol.charAt(0)}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-slate-900/60 border border-slate-800 rounded-xl ${className}`}>
      {children}
    </div>
  );
}

export function CurrencySelector({ currency, onChange }: { currency: CurrencyCode; onChange: (c: CurrencyCode) => void }) {
  return (
    <select
      value={currency}
      onChange={(e) => onChange(e.target.value as CurrencyCode)}
      className="bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
    >
      {(Object.keys(currencies) as CurrencyCode[]).map((c) => (
        <option key={c} value={c}>
          {c} ({currencies[c].symbol})
        </option>
      ))}
    </select>
  );
}
