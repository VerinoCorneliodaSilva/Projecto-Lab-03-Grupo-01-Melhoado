import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

interface IndicatorsProps {
  prices: number[];
  chartHeight?: number;
}

// Calcula Média Móvel Simples
function sma(data: number[], period: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < period - 1) return null;
    const slice = data.slice(i - period + 1, i + 1);
    return slice.reduce((a, b) => a + b, 0) / period;
  });
}

// Calcula RSI (Relative Strength Index)
function calculateRSI(prices: number[], period: number = 14): (number | null)[] {
  const rsi: (number | null)[] = [];
  const changes: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i === 0) {
      changes.push(0);
      rsi.push(null);
      continue;
    }
    changes.push(prices[i] - prices[i - 1]);

    if (i < period) {
      rsi.push(null);
      continue;
    }

    const recentChanges = changes.slice(i - period + 1, i + 1);
    const gains = recentChanges.filter((c) => c > 0).reduce((a, b) => a + b, 0);
    const losses = Math.abs(recentChanges.filter((c) => c < 0).reduce((a, b) => a + b, 0));
    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(100 - 100 / (1 + rs));
  }

  return rsi;
}

// Calcula MACD
function calculateMACD(prices: number[]): { macd: (number | null)[]; signal: (number | null)[]; histogram: (number | null)[] } {
  const ema = (data: number[], period: number): (number | null)[] => {
    const k = 2 / (period + 1);
    const result: (number | null)[] = [];
    let prev: number | null = null;

    data.forEach((val, i) => {
      if (i < period - 1) {
        result.push(null);
      } else if (i === period - 1) {
        const smaVal = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
        prev = smaVal;
        result.push(smaVal);
      } else if (prev !== null) {
        const newVal = val * k + prev * (1 - k);
        prev = newVal;
        result.push(newVal);
      }
    });
    return result;
  };

  const ema12 = ema(prices, 12);
  const ema26 = ema(prices, 26);

  const macd = prices.map((_, i) => {
    if (ema12[i] === null || ema26[i] === null) return null;
    return (ema12[i] as number) - (ema26[i] as number);
  });

  const macdFiltered = macd.filter((v): v is number => v !== null);
  const signalRaw = ema(macdFiltered, 9);
  const signal: (number | null)[] = [];
  let signalIdx = 0;
  macd.forEach((v) => {
    if (v === null) {
      signal.push(null);
    } else {
      signal.push(signalRaw[signalIdx] ?? null);
      signalIdx++;
    }
  });

  const histogram = macd.map((m, i) => {
    if (m === null || signal[i] === null) return null;
    return m - (signal[i] as number);
  });

  return { macd, signal, histogram };
}

// Calcula Bollinger Bands
function calculateBollinger(prices: number[], period: number = 20, stdDev: number = 2) {
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  const middle: (number | null)[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      upper.push(null);
      lower.push(null);
      middle.push(null);
      continue;
    }
    const slice = prices.slice(i - period + 1, i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / period;
    const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
    const sd = Math.sqrt(variance);

    middle.push(mean);
    upper.push(mean + sd * stdDev);
    lower.push(mean - sd * stdDev);
  }

  return { upper, lower, middle };
}

export function TechnicalIndicators({ prices }: IndicatorsProps) {
  const data = useMemo(() => {
    const sma20 = sma(prices, 20);
    const sma50 = sma(prices, 50);
    const rsi = calculateRSI(prices);
    const macdData = calculateMACD(prices);
    const bollinger = calculateBollinger(prices);

    return prices.map((price, i) => ({
      index: i,
      price,
      sma20: sma20[i],
      sma50: sma50[i],
      rsi: rsi[i],
      macd: macdData.macd[i],
      signal: macdData.signal[i],
      histogram: macdData.histogram[i],
      bbUpper: bollinger.upper[i],
      bbLower: bollinger.lower[i],
      bbMiddle: bollinger.middle[i],
    }));
  }, [prices]);

  const lastRSI = data[data.length - 1]?.rsi;
  const lastMACD = data[data.length - 1]?.macd;

  const rsiStatus = lastRSI !== null && lastRSI !== undefined
    ? lastRSI > 70 ? { label: 'Sobrecomprado', color: 'text-red-400' }
    : lastRSI < 30 ? { label: 'Sobrevendido', color: 'text-emerald-400' }
    : { label: 'Neutro', color: 'text-slate-400' }
    : null;

  return (
    <div className="space-y-4">
      {/* RSI */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">RSI (14)</span>
            <span className="text-xs text-slate-500">Relative Strength Index</span>
          </div>
          {rsiStatus && (
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${rsiStatus.color}`}>
                {lastRSI?.toFixed(2)}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${rsiStatus.color} bg-slate-800`}>
                {rsiStatus.label}
              </span>
            </div>
          )}
        </div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="index" hide />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} width={30} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: 12 }}
                formatter={(v: any) => [Number(v).toFixed(2), 'RSI']}
              />
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '70', fill: '#ef4444', fontSize: 10 }} />
              <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" label={{ value: '30', fill: '#10b981', fontSize: 10 }} />
              <Line type="monotone" dataKey="rsi" stroke="#a855f7" strokeWidth={2} dot={false} connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* MACD */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">MACD</span>
            <span className="text-xs text-slate-500">(12, 26, 9)</span>
          </div>
          {lastMACD !== null && lastMACD !== undefined && (
            <span className={`text-sm font-bold ${lastMACD >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {lastMACD.toFixed(4)}
            </span>
          )}
        </div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="index" hide />
              <YAxis stroke="#64748b" fontSize={10} width={40} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: 12 }}
              />
              <ReferenceLine y={0} stroke="#475569" />
              <Line type="monotone" dataKey="macd" stroke="#3b82f6" strokeWidth={2} dot={false} name="MACD" connectNulls={false} />
              <Line type="monotone" dataKey="signal" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="Signal" connectNulls={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Moving Averages */}
      <div className="grid grid-cols-2 gap-3">
        <MAStat label="SMA 20" value={data[data.length - 1]?.sma20} currentPrice={prices[prices.length - 1]} color="#10b981" />
        <MAStat label="SMA 50" value={data[data.length - 1]?.sma50} currentPrice={prices[prices.length - 1]} color="#3b82f6" />
      </div>

      {/* Bollinger Bands */}
      <div className="bg-slate-800/50 rounded-lg p-3">
        <div className="text-sm font-medium text-white mb-2">Bollinger Bands (20, 2)</div>
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <div className="text-slate-500 mb-0.5">Superior</div>
            <div className="text-red-400 font-medium">{data[data.length - 1]?.bbUpper?.toFixed(2) ?? '—'}</div>
          </div>
          <div>
            <div className="text-slate-500 mb-0.5">Média</div>
            <div className="text-slate-300 font-medium">{data[data.length - 1]?.bbMiddle?.toFixed(2) ?? '—'}</div>
          </div>
          <div>
            <div className="text-slate-500 mb-0.5">Inferior</div>
            <div className="text-emerald-400 font-medium">{data[data.length - 1]?.bbLower?.toFixed(2) ?? '—'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MAStat({ label, value, currentPrice, color }: { label: string; value: number | null; currentPrice: number; color: string }) {
  if (value === null) {
    return (
      <div className="bg-slate-800/50 rounded-lg p-3">
        <div className="text-xs text-slate-500 mb-1">{label}</div>
        <div className="text-sm text-slate-400">Dados insuficientes</div>
      </div>
    );
  }
  const diff = ((currentPrice - value) / value) * 100;
  return (
    <div className="bg-slate-800/50 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs text-slate-500">{label}</span>
      </div>
      <div className="text-sm text-white font-medium">{value.toFixed(value < 1 ? 6 : 2)}</div>
      <div className={`text-xs ${diff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
        {diff >= 0 ? '+' : ''}{diff.toFixed(2)}% vs preço
      </div>
    </div>
  );
}
