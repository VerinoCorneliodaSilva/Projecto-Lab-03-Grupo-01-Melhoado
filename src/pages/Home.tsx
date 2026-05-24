import { useMemo, useState } from 'react';
import { CryptoTable } from '../components/CryptoTable';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { useRealtimePrices } from '../hooks/useRealtimePrices';
import { useWatchlist } from '../hooks/useWatchlist';
import { TrendingUp, TrendingDown, Flame, Zap, BarChart3, Globe, ChevronRight, Gift, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatNumber } from '../components/ui';

type FilterType = 'all' | 'gainers' | 'losers' | 'new';

export function Home() {
  const { format, symbol } = useCurrency();
  const { cryptos: allCryptos } = useRealtimePrices();
  const { watchlist, toggle } = useWatchlist();
  const { user } = useAuth();
  const [filter, setFilter] = useState<FilterType>('all');
  const [showCount, setShowCount] = useState(20);
  const [showBanner, setShowBanner] = useState(!localStorage.getItem('cn_banner_dismissed'));

  const globalStats = useMemo(() => {
    const totalMcap = allCryptos.reduce((s, c) => s + c.marketCap, 0);
    const totalVol = allCryptos.reduce((s, c) => s + c.volume24h, 0);
    const btcDom = (allCryptos.find((c) => c.id === 'bitcoin')?.marketCap || 0) / totalMcap * 100;
    const ethDom = (allCryptos.find((c) => c.id === 'ethereum')?.marketCap || 0) / totalMcap * 100;
    const avgChange = allCryptos.reduce((s, c) => s + c.change24h, 0) / allCryptos.length;
    return { totalMcap, totalVol, btcDom, ethDom, avgChange, count: allCryptos.length };
  }, []);

  const filteredCryptos = useMemo(() => {
    let list = [...allCryptos];
    if (filter === 'gainers') list.sort((a, b) => b.change24h - a.change24h);
    else if (filter === 'losers') list.sort((a, b) => a.change24h - b.change24h);
    else if (filter === 'new') list.sort((a, b) => b.launchYear - a.launchYear);
    return list.slice(0, showCount);
  }, [filter, showCount]);

  const topGainers = [...allCryptos].sort((a, b) => b.change24h - a.change24h).slice(0, 3);
  const topLosers = [...allCryptos].sort((a, b) => a.change24h - b.change24h).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Promo banner for non-logged users */}
      {!user && showBanner && (
        <div className="mb-6 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 border border-indigo-500/30 rounded-2xl p-5 md:p-6 relative overflow-hidden">
          <button
            onClick={() => { setShowBanner(false); localStorage.setItem('cn_banner_dismissed', '1'); }}
            className="absolute top-3 right-3 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg md:text-xl font-bold text-white mb-1">
                Comece a negociar com $10.000 de bônus!
              </h3>
              <p className="text-slate-300 text-sm">
                Crie sua conta gratuita e receba saldo virtual para comprar e vender criptomoedas. Sem riscos, sem compromisso.
              </p>
            </div>
            <Link
              to="/auth"
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium px-6 py-2.5 rounded-lg whitespace-nowrap"
            >
              Cadastrar Grátis
            </Link>
          </div>
        </div>
      )}

      {/* Hero / Global stats */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Hoje no Mercado de Criptoativos {symbol}
            </h1>
            <p className="text-slate-400 text-sm md:text-base">
              Preços por capitalização de mercado • Atualizado agora
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Atualização ao vivo
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <StatCard label="Capitalização de Mercado" value={format(globalStats.totalMcap, { compact: true })} change={globalStats.avgChange} />
          <StatCard label="Volume (24h)" value={format(globalStats.totalVol, { compact: true })} />
          <StatCard label="Dominância BTC" value={`${globalStats.btcDom.toFixed(1)}%`} icon={<span className="text-orange-400">₿</span>} />
          <StatCard label="Dominância ETH" value={`${globalStats.ethDom.toFixed(1)}%`} icon={<span className="text-indigo-400">Ξ</span>} />
          <StatCard label="Criptomoedas Ativas" value={formatNumber(globalStats.count, 0)} icon={<Globe className="w-4 h-4 text-indigo-400" />} />
        </div>
      </div>

      {/* Trending strip */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <TrendingStrip title="Maiores Altas (24h)" icon={<TrendingUp className="w-4 h-4 text-emerald-400" />} items={topGainers} color="emerald" />
        <TrendingStrip title="Maiores Baixas (24h)" icon={<TrendingDown className="w-4 h-4 text-red-400" />} items={topLosers} color="red" />
      </div>

      {/* Main table section */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 md:px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-1 overflow-x-auto">
            <FilterButton active={filter === 'all'} onClick={() => setFilter('all')} icon={<BarChart3 className="w-4 h-4" />}>
              Todos
            </FilterButton>
            <FilterButton active={filter === 'gainers'} onClick={() => setFilter('gainers')} icon={<TrendingUp className="w-4 h-4" />}>
              Altas
            </FilterButton>
            <FilterButton active={filter === 'losers'} onClick={() => setFilter('losers')} icon={<TrendingDown className="w-4 h-4" />}>
              Baixas
            </FilterButton>
            <FilterButton active={filter === 'new'} onClick={() => setFilter('new')} icon={<Flame className="w-4 h-4" />}>
              Recentes
            </FilterButton>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <label className="text-slate-400">Mostrar:</label>
            <select
              value={showCount}
              onChange={(e) => setShowCount(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-slate-100 text-sm rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={allCryptos.length}>Todos</option>
            </select>
          </div>
        </div>
        <CryptoTable cryptos={filteredCryptos} watchlist={watchlist} onToggleWatchlist={toggle} />
      </div>

      {/* Quick info cards */}
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <InfoCard
          title="Conversor de Moedas"
          description="Converta qualquer criptomoeda em moedas fiduciárias instantaneamente."
          icon={<Zap className="w-5 h-5 text-indigo-400" />}
          to="/converter"
        />
        <InfoCard
          title="Sua Watchlist"
          description="Acompanhe suas criptomoedas favoritas em um só lugar."
          icon={<Flame className="w-5 h-5 text-orange-400" />}
          to="/watchlist"
        />
        <InfoCard
          title="Tendências"
          description="Descubra as criptomoedas mais buscadas e em alta no momento."
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
          to="/trending"
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, change, icon }: { label: string; value: string; change?: number; icon?: React.ReactNode }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
      <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
        {icon}
        {label}
      </div>
      <div className="text-lg md:text-xl font-bold text-white">{value}</div>
      {change !== undefined && (
        <div className={`text-xs mt-1 ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
        </div>
      )}
    </div>
  );
}

function FilterButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
        active
          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
          : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function TrendingStrip({ title, icon, items, color }: { title: string; icon: React.ReactNode; items: any[]; color: 'emerald' | 'red' }) {
  const textColor = color === 'emerald' ? 'text-emerald-400' : 'text-red-400';
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <div className="space-y-2">
        {items.map((c, i) => (
          <Link
            key={c.id}
            to={`/coin/${c.id}`}
            className="flex items-center gap-3 hover:bg-slate-800/60 p-2 -m-2 rounded-lg"
          >
            <span className="text-xs text-slate-500 w-4">{i + 1}</span>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ backgroundColor: c.color }}
            >
              {c.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-slate-100 truncate">{c.name}</div>
              <div className="text-xs text-slate-500 uppercase">{c.symbol}</div>
            </div>
            <div className={`text-sm font-medium ${textColor}`}>
              {c.change24h >= 0 ? '+' : ''}{c.change24h.toFixed(2)}%
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function InfoCard({ title, description, icon, to }: { title: string; description: string; icon: React.ReactNode; to: string }) {
  return (
    <Link
      to={to}
      className="group bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 hover:bg-slate-900 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
          {icon}
        </div>
        <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
      </div>
      <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </Link>
  );
}
