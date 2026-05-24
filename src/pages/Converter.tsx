import { useState, useMemo } from 'react';
import { cryptos } from '../data/cryptoData';
import { useCurrency } from '../context/CurrencyContext';
import { CryptoIcon, PercentChange } from '../components/ui';
import { ArrowLeftRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Converter() {
  const [fromId, setFromId] = useState('bitcoin');
  const [toId, setToId] = useState('usd-coin');
  const [fromAmount, setFromAmount] = useState('1');
  const [flipped, setFlipped] = useState(false);

  const from = cryptos.find((c) => c.id === fromId)!;
  const to = cryptos.find((c) => c.id === toId)!;

  const { result, rate } = useMemo(() => {
    const amt = parseFloat(fromAmount) || 0;
    const fromPrice = from.price;
    const toPrice = to.price;
    const rate = fromPrice / toPrice;
    return { result: amt * rate, rate };
  }, [fromAmount, from, to]);

  const handleFlip = () => {
    setFromId(toId);
    setToId(fromId);
    setFromAmount(result.toFixed(8));
    setFlipped(!flipped);
  };

  // Popular pairs
  const popularPairs = [
    ['bitcoin', 'usd-coin'],
    ['ethereum', 'usd-coin'],
    ['solana', 'usd-coin'],
    ['bitcoin', 'ethereum'],
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Conversor de Criptomoedas</h1>
        <p className="text-slate-400">Converta qualquer criptomoeda com taxas em tempo real</p>
      </div>

      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6 md:p-8 mb-8">
        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
          {/* From */}
          <div>
            <label className="text-sm text-slate-400 mb-2 block">De</label>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="w-full bg-transparent text-2xl font-bold text-white focus:outline-none mb-3"
                placeholder="0.00"
              />
              <select
                value={fromId}
                onChange={(e) => setFromId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {cryptos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap */}
          <button
            onClick={handleFlip}
            className="w-12 h-12 bg-slate-800 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center mx-auto border border-slate-700 transition-colors"
            aria-label="Inverter"
          >
            <ArrowLeftRight className={`w-5 h-5 transition-transform ${flipped ? 'rotate-180' : ''}`} />
          </button>

          {/* To */}
          <div>
            <label className="text-sm text-slate-400 mb-2 block">Para</label>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <input
                type="text"
                value={result.toFixed(8).replace(/\.?0+$/, '')}
                readOnly
                className="w-full bg-transparent text-2xl font-bold text-emerald-400 focus:outline-none mb-3"
              />
              <select
                value={toId}
                onChange={(e) => setToId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                {cryptos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-between text-sm flex-wrap gap-3">
          <div className="text-slate-400">
            <span className="text-white font-medium">1 {from.symbol}</span> ={' '}
            <span className="text-white font-medium">{rate.toFixed(rate < 1 ? 8 : 4)} {to.symbol}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <RefreshCw className="w-3 h-3" />
            Atualizado em tempo real
          </div>
        </div>
      </div>

      {/* Coin info */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <CoinInfoCard coin={from} />
        <CoinInfoCard coin={to} />
      </div>

      {/* Popular pairs */}
      <div>
        <h3 className="text-white font-semibold mb-4">Pares Populares</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {popularPairs.map(([a, b]) => {
            const ca = cryptos.find((c) => c.id === a)!;
            const cb = cryptos.find((c) => c.id === b)!;
            const r = ca.price / cb.price;
            return (
              <button
                key={`${a}-${b}`}
                onClick={() => { setFromId(a); setToId(b); setFromAmount('1'); }}
                className="bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 text-left transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CryptoIcon symbol={ca.symbol} color={ca.color} icon={ca.icon} size={24} />
                  <CryptoIcon symbol={cb.symbol} color={cb.color} icon={cb.icon} size={24} />
                </div>
                <div className="text-xs text-slate-400">{ca.symbol}/{cb.symbol}</div>
                <div className="text-sm font-medium text-white">{r.toFixed(r < 1 ? 6 : 2)}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CoinInfoCard({ coin }: { coin: typeof cryptos[0] }) {
  const { format } = useCurrency();
  return (
    <Link
      to={`/coin/${coin.id}`}
      className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-4 hover:border-indigo-500/50 transition-colors"
    >
      <CryptoIcon symbol={coin.symbol} color={coin.color} icon={coin.icon} size={48} />
      <div className="flex-1 min-w-0">
        <div className="text-white font-semibold">{coin.name}</div>
        <div className="text-xs text-slate-500 uppercase">{coin.symbol}</div>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium text-white">{format(coin.price, { maxDecimals: coin.price < 1 ? 4 : 2 })}</div>
        <PercentChange value={coin.change24h} />
      </div>
    </Link>
  );
}
