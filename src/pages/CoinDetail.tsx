import { useMemo, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { cryptos, generatePriceHistory } from '../data/cryptoData';
import { useCurrency } from '../context/CurrencyContext';
import { useWatchlist } from '../hooks/useWatchlist';
import { Sparkline, PercentChange, CryptoIcon, formatNumber } from '../components/ui';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart, Bar, BarChart } from 'recharts';
import { Star, ExternalLink, ArrowLeft, Clock, Activity, BarChart3, LineChart, CandlestickChart as CandlestickIcon, TrendingUp } from 'lucide-react';
import { CandlestickChart, generateCandlestickData } from '../components/CandlestickChart';
import { TechnicalIndicators } from '../components/TechnicalIndicators';
import { FearGreedIndex } from '../components/FearGreedIndex';
import { AIPrediction } from '../components/AIPrediction';

type TimeRange = '1h' | '24h' | '7d' | '30d' | '1y';
type ChartType = 'area' | 'line' | 'candle';

export function CoinDetail() {
  const { watchlist, toggle } = useWatchlist();
  const { id } = useParams();
  const { format, currency } = useCurrency();
  const [range, setRange] = useState<TimeRange>('30d');

  const coin = cryptos.find((c) => c.id === id);
  if (!coin) return <Navigate to="/" replace />;

  const [chartType, setChartType] = useState<ChartType>('area');

  const rangeDays = { '1h': 0.04, '24h': 1, '7d': 7, '30d': 30, '1y': 365 }[range];
  const volatility = rangeDays <= 1 ? 0.02 : rangeDays <= 7 ? 0.05 : rangeDays <= 30 ? 0.1 : 0.2;
  const history = useMemo(() => generatePriceHistory(coin.price, volatility, Math.max(Math.ceil(rangeDays), 1)), [coin.id, range]);
  const candleData = useMemo(() => generateCandlestickData(coin.price, 60), [coin.id]);
  const priceArray = useMemo(() => history.map((h) => h.price), [history]);

  // Volume data
  const volumeData = useMemo(() => {
    return history.slice(-30).map((h, i) => ({
      date: h.date,
      volume: Math.random() * coin.volume24h / 30 + coin.volume24h / 60,
      index: i,
    }));
  }, [history, coin.volume24h]);

  const priceAtStart = history[0].price;
  const priceChange = ((coin.price - priceAtStart) / priceAtStart) * 100;
  const isPositive = priceChange >= 0;

  const inWatchlist = watchlist.includes(coin.id);

  const allTimeHigh = coin.price * 1.45;
  const allTimeLow = coin.price * 0.3;

  // Estatísticas
  const stats = [
    { label: 'Capitalização de Mercado', value: format(coin.marketCap, { compact: true }) },
    { label: 'Volume (24h)', value: format(coin.volume24h, { compact: true }) },
    { label: 'Oferta Circulante', value: `${formatNumber(coin.circulatingSupply, 0)} ${coin.symbol}` },
    { label: 'Oferta Máxima', value: coin.maxSupply ? `${formatNumber(coin.maxSupply, 0)} ${coin.symbol}` : '∞ Ilimitado' },
    { label: 'Máxima Histórica', value: format(allTimeHigh, { maxDecimals: coin.price < 1 ? 6 : 2 }) },
    { label: 'Mínima Histórica', value: format(allTimeLow, { maxDecimals: coin.price < 1 ? 6 : 2 }) },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" />
        Voltar ao mercado
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <CryptoIcon symbol={coin.symbol} color={coin.color} icon={coin.icon} size={56} />
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-white">{coin.name}</h1>
              <span className="text-slate-400 uppercase font-medium">{coin.symbol}</span>
              <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full">
                #{coin.rank}
              </span>
              <button
                onClick={() => toggle(coin.id)}
                className={`p-1.5 rounded-lg transition-colors ${
                  inWatchlist ? 'text-yellow-400 bg-yellow-400/10' : 'text-slate-500 hover:text-yellow-400 hover:bg-slate-800'
                }`}
                aria-label="Watchlist"
              >
                <Star className="w-4 h-4" fill={inWatchlist ? 'currentColor' : 'none'} />
              </button>
            </div>
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              <div className="text-3xl md:text-4xl font-bold text-white">
                {format(coin.price, { maxDecimals: coin.price < 1 ? 8 : 2 })}
              </div>
              <div className="flex items-center gap-3">
                <PercentChange value={coin.change24h} size="md" />
                <span className="text-slate-500 text-sm">24h</span>
              </div>
            </div>
          </div>
        </div>

        <a
          href={coin.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded-lg border border-slate-700"
        >
          Site Oficial
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                Gráfico de Preço ({currency})
              </h3>
              <p className={`text-sm ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositive ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)}% no período
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
                {(['1h', '24h', '7d', '30d', '1y'] as TimeRange[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`px-2 md:px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      range === r
                        ? 'bg-indigo-500 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="flex gap-1 bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setChartType('area')}
                  className={`p-1.5 rounded-md transition-colors ${chartType === 'area' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}
                  title="Área"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`p-1.5 rounded-md transition-colors ${chartType === 'line' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}
                  title="Linha"
                >
                  <LineChart className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setChartType('candle')}
                  className={`p-1.5 rounded-md transition-colors ${chartType === 'candle' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'}`}
                  title="Candlestick"
                >
                  <CandlestickIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="h-80">
            {chartType === 'candle' ? (
              <CandlestickChart data={candleData} width={800} height={320} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={chartType === 'area' ? 0.3 : 0} />
                      <stop offset="100%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    domain={['auto', 'auto']}
                    tickFormatter={(v) => {
                      const n = Number(v);
                      if (n >= 1000) return new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
                      return n.toFixed(coin.price < 1 ? 4 : 2);
                    }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#94a3b8' }}
                    formatter={(value: any) => [format(Number(value), { maxDecimals: coin.price < 1 ? 6 : 2 }), 'Preço']}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke={isPositive ? '#10b981' : '#ef4444'}
                    strokeWidth={2}
                    fill={chartType === 'area' ? 'url(#chartGradient)' : 'transparent'}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Volume chart */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <div className="text-xs text-slate-400 mb-2 flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              Volume (24h)
            </div>
            <div className="h-20">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData}>
                  <Bar dataKey="volume" fill="#6366f1" opacity={0.6} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: 11 }}
                    formatter={(v: any) => [format(Number(v), { compact: true }), 'Volume']}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sidebar stats */}
        <div className="space-y-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            Estatísticas
          </h3>
          <div className="space-y-3">
            {stats.map((s) => (
              <div key={s.label} className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800 last:border-0">
                <span className="text-sm text-slate-400">{s.label}</span>
                <span className="text-sm font-medium text-slate-100 text-right">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fear & Greed */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-400" />
            Fear & Greed
          </h3>
          <FearGreedIndex size="md" />
        </div>
        </div>
      </div>

      {/* AI Prediction */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <AIPrediction
          symbol={coin.symbol}
          currentPrice={coin.price}
          change24h={coin.change24h}
          change7d={coin.change7d}
        />

        {/* Technical Indicators */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Indicadores Técnicos
          </h3>
          <TechnicalIndicators prices={priceArray} />
        </div>
      </div>

      {/* About */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 mt-6">
        <h3 className="text-white font-semibold mb-3">Sobre {coin.name}</h3>
        <p className="text-slate-300 leading-relaxed">{coin.description}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-slate-800 text-sm">
          <div>
            <div className="text-slate-500 text-xs mb-1">Ano de Lançamento</div>
            <div className="text-white font-medium">{coin.launchYear}</div>
          </div>
          <div>
            <div className="text-slate-500 text-xs mb-1">Alteração 1h</div>
            <PercentChange value={coin.change1h} />
          </div>
          <div>
            <div className="text-slate-500 text-xs mb-1">Alteração 24h</div>
            <PercentChange value={coin.change24h} />
          </div>
          <div>
            <div className="text-slate-500 text-xs mb-1">Alteração 7d</div>
            <PercentChange value={coin.change7d} />
          </div>
        </div>
      </div>

      {/* Related coins */}
      <div className="mt-8">
        <h3 className="text-white font-semibold mb-4">Outras Moedas em Destaque</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cryptos
            .filter((c) => c.id !== coin.id)
            .slice(0, 4)
            .map((c) => (
              <Link
                key={c.id}
                to={`/coin/${c.id}`}
                className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 hover:border-indigo-500/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-3">
                  <CryptoIcon symbol={c.symbol} color={c.color} icon={c.icon} size={28} />
                  <div>
                    <div className="text-sm font-medium text-white truncate">{c.name}</div>
                    <div className="text-xs text-slate-500 uppercase">{c.symbol}</div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-white mb-1">
                  {format(c.price, { maxDecimals: c.price < 1 ? 4 : 2 })}
                </div>
                <div className="flex items-center justify-between">
                  <PercentChange value={c.change24h} />
                  <Sparkline data={c.sparkline} positive={c.change7d >= 0} width={60} height={20} />
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
