import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CryptoIcon, Sparkline, PercentChange } from '../components/ui';
import { useCurrency } from '../context/CurrencyContext';
import { useRealtimePrices } from '../hooks/useRealtimePrices';
import { TrendingUp, TrendingDown, Flame, Search, BarChart3, Activity, RefreshCw } from 'lucide-react';

export function Trending() {
  const { cryptos, lastUpdate } = useRealtimePrices();
  const { format } = useCurrency();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const gainers = useMemo(() => 
    [...cryptos].sort((a, b) => b.change24h - a.change24h).slice(0, 10), 
    [cryptos]
  );

  const losers = useMemo(() => 
    [...cryptos].sort((a, b) => a.change24h - b.change24h).slice(0, 10), 
    [cryptos]
  );

  const byVolume = useMemo(() => 
    [...cryptos].sort((a, b) => b.volume24h - a.volume24h).slice(0, 10), 
    [cryptos]
  );

  const trending = useMemo(() => 
    [...cryptos].sort((a, b) => b.volume24h * Math.abs(b.change24h) - a.volume24h * Math.abs(a.change24h)).slice(0, 10), 
    [cryptos]
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Flame className="w-8 h-8 text-orange-400" />
              Tendências do Mercado
            </h1>
            <p className="text-slate-400">Descubra as criptomoedas mais movimentadas em tempo real</p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm">Atualizar</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
            label="Maior Alta"
            value={`+${gainers[0]?.change24h.toFixed(2) || '0.00'}%`}
            subtitle={gainers[0]?.symbol || '-'}
            color="emerald"
          />
          <StatCard
            icon={<TrendingDown className="w-5 h-5 text-red-400" />}
            label="Maior Baixa"
            value={`${losers[0]?.change24h.toFixed(2) || '0.00'}%`}
            subtitle={losers[0]?.symbol || '-'}
            color="red"
          />
          <StatCard
            icon={<BarChart3 className="w-5 h-5 text-blue-400" />}
            label="Maior Volume"
            value={format(byVolume[0]?.volume24h || 0, { compact: true })}
            subtitle={byVolume[0]?.symbol || '-'}
            color="blue"
          />
          <StatCard
            icon={<Activity className="w-5 h-5 text-purple-400" />}
            label="Última Atualização"
            value={formatTime(lastUpdate)}
            subtitle="Em tempo real"
            color="purple"
          />
        </div>
      </div>

      {/* Grid Sections */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Section 
          title="Top Gainers (24h)" 
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />} 
          items={gainers}
          format={format}
        />
        <Section 
          title="Top Losers (24h)" 
          icon={<TrendingDown className="w-5 h-5 text-red-400" />} 
          items={losers}
          format={format}
        />
        <Section 
          title="Mais Negociadas" 
          icon={<Flame className="w-5 h-5 text-orange-400" />} 
          items={byVolume}
          sortByVolume
          format={format}
        />
        <Section 
          title="Em Alta no Momento" 
          icon={<Search className="w-5 h-5 text-indigo-400" />} 
          items={trending}
          format={format}
        />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subtitle, color }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  subtitle: string;
  color: 'emerald' | 'red' | 'blue' | 'purple';
}) {
  const colorClasses = {
    emerald: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20',
    red: 'from-red-500/10 to-red-500/5 border-red-500/20',
    blue: 'from-blue-500/10 to-blue-500/5 border-blue-500/20',
    purple: 'from-purple-500/10 to-purple-500/5 border-purple-500/20',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400 font-medium">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-xs text-slate-500">{subtitle}</div>
    </div>
  );
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  items: any[];
  sortByVolume?: boolean;
  format: (value: number, opts?: any) => string;
}

function Section({ title, icon, items, sortByVolume, format }: SectionProps) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
        {icon}
        <h2 className="text-base font-semibold text-white">{title}</h2>
      </div>
      <div className="divide-y divide-slate-800">
        {items.map((c, i) => (
          <Link
            key={c.id}
            to={`/coin/${c.id}`}
            className="flex items-center gap-3 px-5 py-3 hover:bg-slate-800/40 transition-colors group"
          >
            <span className="text-xs text-slate-500 w-5 font-medium">{i + 1}</span>
            <CryptoIcon symbol={c.symbol} color={c.color} icon={c.icon} size={36} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate group-hover:text-indigo-400 transition-colors">
                {c.name}
              </div>
              <div className="text-xs text-slate-500 uppercase">{c.symbol}</div>
            </div>
            <div className="hidden sm:block">
              <Sparkline data={c.sparkline} positive={c.change7d >= 0} width={60} height={24} />
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-white whitespace-nowrap">
                {format(c.price, { maxDecimals: c.price < 1 ? 4 : 2 })}
              </div>
              {sortByVolume ? (
                <div className="text-xs text-slate-500">Vol: {format(c.volume24h, { compact: true })}</div>
              ) : (
                <PercentChange value={c.change24h} />
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
