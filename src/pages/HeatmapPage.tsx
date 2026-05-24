import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRealtimePrices } from '../hooks/useRealtimePrices';
import { Flame, TrendingUp, TrendingDown } from 'lucide-react';

type HeatmapMode = 'change24h' | 'marketCap' | 'volume';

export function HeatmapPage() {
  const { cryptos } = useRealtimePrices();
  const [mode, setMode] = useState<HeatmapMode>('change24h');

  const data = useMemo(() => {
    return cryptos.map((c) => ({
      ...c,
      size: mode === 'marketCap' ? c.marketCap : mode === 'volume' ? c.volume24h : c.marketCap,
      value: mode === 'change24h' ? c.change24h : mode === 'marketCap' ? c.marketCap : c.volume24h,
    }));
  }, [cryptos, mode]);

  const maxMarketCap = Math.max(...cryptos.map((c) => c.marketCap));

  const getColor = (change: number) => {
    if (change > 10) return 'bg-emerald-600';
    if (change > 5) return 'bg-emerald-500';
    if (change > 2) return 'bg-emerald-400/80';
    if (change > 0) return 'bg-emerald-500/50';
    if (change > -2) return 'bg-red-500/50';
    if (change > -5) return 'bg-red-400/80';
    if (change > -10) return 'bg-red-500';
    return 'bg-red-600';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Flame className="w-8 h-8 text-orange-400" />
          Heatmap do Mercado
        </h1>
        <p className="text-slate-400">Visualização em tempo real do desempenho das principais criptomoedas</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 bg-slate-900/60 border border-slate-800 p-1 rounded-lg mb-6 w-fit">
        <button
          onClick={() => setMode('change24h')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'change24h' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Variação 24h
        </button>
        <button
          onClick={() => setMode('marketCap')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'marketCap' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Market Cap
        </button>
        <button
          onClick={() => setMode('volume')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            mode === 'volume' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          Volume
        </button>
      </div>

      {/* Heatmap grid - tree map simulation */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
          {data.map((c) => {
            const sizePercent = (c.marketCap / maxMarketCap) * 100;
            const sizeClass =
              sizePercent > 30 ? 'col-span-3 row-span-2 min-h-[200px]' :
              sizePercent > 15 ? 'col-span-2 row-span-2 min-h-[200px]' :
              sizePercent > 8 ? 'col-span-2 min-h-[140px]' :
              'min-h-[140px]';

            return (
              <Link
                key={c.id}
                to={`/coin/${c.id}`}
                className={`${sizeClass} ${getColor(c.change24h)} rounded-lg p-3 flex flex-col justify-between text-white hover:scale-[1.02] transition-transform relative overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs opacity-80">{c.symbol}</div>
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-white/20"
                    >
                      {c.icon}
                    </div>
                  </div>
                  <div className="text-sm font-bold truncate">{c.name}</div>
                </div>
                <div className="relative">
                  <div className="text-2xl font-bold">
                    {c.change24h >= 0 ? '+' : ''}{c.change24h.toFixed(2)}%
                  </div>
                  <div className="text-xs opacity-80 mt-0.5">
                    ${c.price < 1 ? c.price.toFixed(4) : c.price.toFixed(2)}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
        <div className="text-sm font-medium text-white mb-3">Legenda</div>
        <div className="flex items-center gap-2 flex-wrap">
          <LegendItem color="bg-red-600" label="< -10%" />
          <LegendItem color="bg-red-500" label="-10% a -5%" />
          <LegendItem color="bg-red-400/80" label="-5% a -2%" />
          <LegendItem color="bg-red-500/50" label="-2% a 0%" />
          <LegendItem color="bg-emerald-500/50" label="0% a 2%" />
          <LegendItem color="bg-emerald-400/80" label="2% a 5%" />
          <LegendItem color="bg-emerald-500" label="5% a 10%" />
          <LegendItem color="bg-emerald-600" label="> 10%" />
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <StatBox
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
          label="Em Alta"
          value={cryptos.filter((c) => c.change24h > 0).length}
          total={cryptos.length}
        />
        <StatBox
          icon={<TrendingDown className="w-5 h-5 text-red-400" />}
          label="Em Baixa"
          value={cryptos.filter((c) => c.change24h < 0).length}
          total={cryptos.length}
        />
        <StatBox
          label="Variação Média"
          value={`${(cryptos.reduce((s, c) => s + c.change24h, 0) / cryptos.length).toFixed(2)}%`}
        />
        <StatBox
          label="Maior Alta"
          value={`${Math.max(...cryptos.map((c) => c.change24h)).toFixed(2)}%`}
          color="text-emerald-400"
        />
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-6 h-4 rounded ${color}`} />
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  );
}

function StatBox({ icon, label, value, total, color = 'text-white' }: { icon?: React.ReactNode; label: string; value: string | number; total?: number; color?: string }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400">{label}</span>
        {icon}
      </div>
      <div className={`text-2xl font-bold ${color}`}>
        {value}
        {total !== undefined && <span className="text-sm text-slate-500 font-normal">/{total}</span>}
      </div>
    </div>
  );
}
