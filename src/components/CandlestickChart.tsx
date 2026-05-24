import { useMemo } from 'react';

interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CandlestickChartProps {
  data: Candle[];
  width?: number;
  height?: number;
  showVolume?: boolean;
}

export function generateCandlestickData(basePrice: number, periods: number = 60): Candle[] {
  const data: Candle[] = [];
  let price = basePrice * 0.85;
  const now = Date.now();

  for (let i = periods; i >= 0; i--) {
    const volatility = basePrice * 0.02;
    const open = price;
    const change = (Math.random() - 0.48) * volatility;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * volatility * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * 0.5;
    const volume = Math.random() * 1000000 + 500000;

    const date = new Date(now - i * 60 * 60 * 1000);
    data.push({
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      open: Number(open.toFixed(basePrice < 1 ? 6 : 2)),
      high: Number(high.toFixed(basePrice < 1 ? 6 : 2)),
      low: Number(low.toFixed(basePrice < 1 ? 6 : 2)),
      close: Number(close.toFixed(basePrice < 1 ? 6 : 2)),
      volume: Number(volume.toFixed(0)),
    });
    price = close;
  }

  // Ajustar último candle para preço atual
  if (data.length > 0) {
    data[data.length - 1].close = basePrice;
  }
  return data;
}

export function CandlestickChart({ data, width = 800, height = 400, showVolume = true }: CandlestickChartProps) {
  const { minPrice, maxPrice, candles } = useMemo(() => {
    if (!data.length) return { minPrice: 0, maxPrice: 0, maxVolume: 0, candles: [] };

    const prices = data.flatMap((c) => [c.high, c.low]);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1;
    const minPrice = min - padding;
    const maxPrice = max + padding;
    const maxVolume = Math.max(...data.map((c) => c.volume));

    const chartHeight = showVolume ? height * 0.8 : height;
    const volumeHeight = showVolume ? height * 0.2 : 0;
    const candleWidth = (width - 40) / data.length;

    const candles = data.map((c, i) => {
      const x = 20 + i * candleWidth + candleWidth / 2;
      const isUp = c.close >= c.open;
      const color = isUp ? '#10b981' : '#ef4444';

      // Preço -> Y
      const priceRange = maxPrice - minPrice;
      const openY = chartHeight - ((c.open - minPrice) / priceRange) * chartHeight;
      const closeY = chartHeight - ((c.close - minPrice) / priceRange) * chartHeight;
      const highY = chartHeight - ((c.high - minPrice) / priceRange) * chartHeight;
      const lowY = chartHeight - ((c.low - minPrice) / priceRange) * chartHeight;

      // Volume
      const volY = showVolume
        ? chartHeight + volumeHeight - (c.volume / maxVolume) * volumeHeight
        : 0;
      const volHeight = showVolume ? (c.volume / maxVolume) * volumeHeight : 0;

      return {
        ...c,
        x,
        openY,
        closeY,
        highY,
        lowY,
        color,
        isUp,
        bodyHeight: Math.max(1, Math.abs(closeY - openY)),
        bodyY: Math.min(openY, closeY),
        volY,
        volHeight,
        candleWidth: candleWidth * 0.7,
      };
    });

    return { minPrice, maxPrice, maxVolume, candles };
  }, [data, width, height, showVolume]);

  if (!data.length) return null;

  const priceLabels = Array.from({ length: 5 }, (_, i) => {
    const price = minPrice + ((maxPrice - minPrice) / 4) * i;
    const y = height - ((price - minPrice) / (maxPrice - minPrice)) * (showVolume ? height * 0.8 : height);
    return { price, y };
  });

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none" style={{ minHeight: 300 }}>
        {/* Grid lines */}
        {priceLabels.map((l, i) => (
          <g key={i}>
            <line x1="20" y1={l.y} x2={width - 10} y2={l.y} stroke="#1e293b" strokeDasharray="2,2" />
            <text x={width - 5} y={l.y + 3} fontSize="9" fill="#64748b" textAnchor="end">
              {l.price.toFixed(l.price < 1 ? 4 : 2)}
            </text>
          </g>
        ))}

        {/* Candles */}
        {candles.map((c, i) => (
          <g key={i}>
            {/* Wick */}
            <line
              x1={c.x}
              y1={c.highY}
              x2={c.x}
              y2={c.lowY}
              stroke={c.color}
              strokeWidth="1"
            />
            {/* Body */}
            <rect
              x={c.x - c.candleWidth / 2}
              y={c.bodyY}
              width={c.candleWidth}
              height={c.bodyHeight}
              fill={c.color}
              opacity={c.isUp ? 0.9 : 0.9}
            />
            {/* Volume bar */}
            {showVolume && (
              <rect
                x={c.x - c.candleWidth / 2}
                y={c.volY}
                width={c.candleWidth}
                height={c.volHeight}
                fill={c.color}
                opacity={0.3}
              />
            )}
          </g>
        ))}

        {/* Separator line */}
        {showVolume && (
          <line x1="20" y1={height * 0.8} x2={width - 10} y2={height * 0.8} stroke="#334155" strokeWidth="1" />
        )}
      </svg>
    </div>
  );
}
