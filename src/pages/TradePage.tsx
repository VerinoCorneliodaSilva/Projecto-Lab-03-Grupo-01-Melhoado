import { useState, useMemo } from 'react';
import { useParams, Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useNotification } from '../context/NotificationContext';
import { useRealtimePrices } from '../hooks/useRealtimePrices';
import { usePortfolio } from '../hooks/usePortfolio';
import { CryptoIcon, PercentChange, Sparkline } from '../components/ui';
import { useLanguage } from '../context/LanguageContext';
import { ArrowLeft, Wallet, TrendingUp, AlertCircle } from 'lucide-react';

type TradeType = 'buy' | 'sell';
const FEE_RATE = 0.001; // 0.1%

export function TradePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { format } = useCurrency();
  const notify = useNotification();
  const { t } = useLanguage();
  const { cryptos } = useRealtimePrices();
  const { holdings, buy, sell } = usePortfolio();

  const [tradeType, setTradeType] = useState<TradeType>('buy');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const coin = cryptos.find((c) => c.id === id);
  if (!coin) return <Navigate to="/" replace />;
  if (!user) return <Navigate to="/auth" replace />;

  const holding = holdings.find((h) => h.cryptoId === coin.id);
  const holdingAmount = holding?.amount || 0;
  const numAmount = parseFloat(amount) || 0;

  const totals = useMemo(() => {
    const subtotal = numAmount * coin.price;
    const fee = subtotal * FEE_RATE;
    const total = tradeType === 'buy' ? subtotal + fee : subtotal - fee;
    return { subtotal, fee, total };
  }, [numAmount, coin.price, tradeType]);

  const canTrade = useMemo(() => {
    if (numAmount <= 0) return false;
    if (tradeType === 'buy') return totals.total <= user.balance;
    return numAmount <= holdingAmount;
  }, [numAmount, tradeType, totals.total, user.balance, holdingAmount]);

  const handleTrade = async () => {
    setError('');
    if (!canTrade) {
      setError(tradeType === 'buy' ? t('portfolio.insufficientBalance') : t('portfolio.insufficientHoldings'));
      return;
    }

    setIsProcessing(true);
    try {
      let result;
      if (tradeType === 'buy') {
        result = await buy(coin.id, coin.symbol, numAmount, coin.price);
      } else {
        result = await sell(coin.id, coin.symbol, numAmount, coin.price);
      }

      if (result.success) {
        if (tradeType === 'buy') {
          notify.success(t('portfolio.buySuccess'), `Você comprou ${numAmount.toFixed(6)} ${coin.symbol}`);
        } else {
          notify.success(t('portfolio.sellSuccess'), `Você vendeu ${numAmount.toFixed(6)} ${coin.symbol}`);
        }
        setAmount('');
        setTimeout(() => navigate('/portfolio'), 1200);
      } else {
        setError(result.error || t('common.error'));
        notify.error(t('common.error'), result.error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const setMax = () => {
    if (tradeType === 'buy') {
      const maxAmount = user.balance / (coin.price * (1 + FEE_RATE));
      setAmount(maxAmount.toFixed(8));
    } else {
      setAmount(holdingAmount.toFixed(8));
    }
  };

  const setPercentage = (pct: number) => {
    if (tradeType === 'buy') {
      const available = user.balance * pct;
      setAmount((available / (coin.price * (1 + FEE_RATE))).toFixed(8));
    } else {
      setAmount((holdingAmount * pct).toFixed(8));
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to={`/coin/${coin.id}`} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" />
        {t('trade.backToCoin', { name: coin.name })}
      </Link>

      <div className="grid md:grid-cols-[1fr_400px] gap-6">
        {/* Left: Coin info */}
        <div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <CryptoIcon symbol={coin.symbol} color={coin.color} icon={coin.icon} size={64} />
              <div>
                <h1 className="text-2xl font-bold text-white">{coin.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-slate-400 uppercase">{coin.symbol}</span>
                  <PercentChange value={coin.change24h} size="md" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between py-4 border-t border-slate-800">
              <div>
                <div className="text-xs text-slate-400 mb-1">{t('trade.currentPrice')}</div>
                <div className="text-2xl font-bold text-white">
                  {format(coin.price, { maxDecimals: coin.price < 1 ? 8 : 2 })}
                </div>
              </div>
              <Sparkline data={coin.sparkline} positive={coin.change7d >= 0} width={120} height={40} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <StatBox label={t('trade.marketCap')} value={format(coin.marketCap, { compact: true })} />
            <StatBox label={t('trade.volume24h')} value={format(coin.volume24h, { compact: true })} />
            <StatBox label="Máxima 24h" value={`+${Math.abs(coin.change24h).toFixed(2)}%`} color="text-emerald-400" />
            <StatBox label={t('trade.youOwn')} value={`${holdingAmount.toFixed(6)} ${coin.symbol}`} />
          </div>
        </div>

        {/* Right: Trade form */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 sticky top-20 h-fit">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            {t('trade.title', { symbol: coin.symbol })}
          </h2>

          <div className="flex gap-1 bg-slate-800 p-1 rounded-lg mb-4">
            <button
              onClick={() => setTradeType('buy')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                tradeType === 'buy' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('trade.buy')}
            </button>
            <button
              onClick={() => setTradeType('sell')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                tradeType === 'sell' ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('trade.sell')}
            </button>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-slate-400">{t('trade.available')}</span>
              <Wallet className="w-4 h-4 text-slate-500" />
            </div>
            <div className="text-white font-medium">
              {tradeType === 'buy' 
                ? format(user.balance)
                : `${holdingAmount.toFixed(6)} ${coin.symbol}`
              }
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              {t('trade.quantityLabel', { symbol: coin.symbol })}
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setError(''); }}
                placeholder="0.00"
                step="any"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={setMax}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-indigo-400 hover:text-indigo-300 px-2 py-1 bg-indigo-500/10 rounded"
              >
                {t('trade.max')}
              </button>
            </div>
            <div className="flex gap-1 mt-2">
              {[0.25, 0.5, 0.75, 1].map((p) => (
                <button
                  key={p}
                  onClick={() => setPercentage(p)}
                  className="flex-1 py-1 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded"
                >
                  {p * 100}%
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 mb-4 pb-4 border-b border-slate-800">
            <Row label={t('trade.price')} value={format(coin.price, { maxDecimals: coin.price < 1 ? 6 : 2 })} />
            <Row label={t('trade.subtotal')} value={format(totals.subtotal)} />
            <Row label={t('trade.fee')} value={format(totals.fee)} muted />
            <Row
              label={tradeType === 'buy' ? t('trade.youPay') : t('trade.youReceive')}
              value={format(totals.total)}
              highlight
            />
          </div>

          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-2 flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button
            onClick={handleTrade}
            disabled={!canTrade || numAmount <= 0 || isProcessing}
            className={`w-full py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              tradeType === 'buy'
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {isProcessing ? t('trade.process') : tradeType === 'buy' ? `${t('trade.buy')} ${coin.symbol}` : `${t('trade.sell')} ${coin.symbol}`}
          </button>

          <p className="text-xs text-slate-500 text-center mt-3">
            {t('trade.secureNotice')}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color = 'text-white' }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className={`text-lg font-semibold ${color}`}>{value}</div>
    </div>
  );
}

function Row({ label, value, muted, highlight }: { label: string; value: string; muted?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={muted ? 'text-slate-500' : 'text-slate-400'}>{label}</span>
      <span className={highlight ? 'text-white font-semibold text-base' : muted ? 'text-slate-500' : 'text-slate-200'}>
        {value}
      </span>
    </div>
  );
}
