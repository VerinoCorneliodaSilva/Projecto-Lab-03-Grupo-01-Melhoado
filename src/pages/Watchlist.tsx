import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { cryptos } from '../data/cryptoData';
import { CryptoTable } from '../components/CryptoTable';
import { useWatchlist } from '../hooks/useWatchlist';
import { Star, StarOff, Plus, TrendingUp } from 'lucide-react';

export function Watchlist() {
  const { watchlist, toggle } = useWatchlist();

  const watchlistCryptos = useMemo(
    () => cryptos.filter((c) => watchlist.includes(c.id)),
    [watchlist]
  );

  const clearAll = () => {
    if (confirm('Deseja limpar toda a watchlist?')) {
      watchlist.forEach(toggle);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
            <Star className="w-7 h-7 text-yellow-400" fill="currentColor" />
            Minha Watchlist
          </h1>
          <p className="text-slate-400 text-sm">
            {watchlistCryptos.length === 0
              ? 'Sua watchlist está vazia'
              : `${watchlistCryptos.length} ${watchlistCryptos.length === 1 ? 'criptomoeda' : 'criptomoedas'} acompanhadas`}
          </p>
        </div>
        {watchlistCryptos.length > 0 && (
          <button
            onClick={clearAll}
            className="text-sm text-red-400 hover:text-red-300 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            <StarOff className="w-4 h-4" />
            Limpar tudo
          </button>
        )}
      </div>

      {watchlistCryptos.length === 0 ? (
        <EmptyWatchlist />
      ) : (
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden">
          <CryptoTable cryptos={watchlistCryptos} watchlist={watchlist} onToggleWatchlist={toggle} />
        </div>
      )}
    </div>
  );
}

function EmptyWatchlist() {
  const suggested = cryptos.slice(0, 6);
  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
      <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <Star className="w-10 h-10 text-slate-600" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">Sua watchlist está vazia</h3>
      <p className="text-slate-400 max-w-md mx-auto mb-8">
        Nenhuma criptomoeda foi adicionada aos seus favoritos. Comece adicionando moedas manualmente clicando no ícone de estrela (⭐) em qualquer moeda do mercado.
      </p>

      <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-sm text-indigo-300 mb-8">
        <TrendingUp className="w-4 h-4" />
        Dica: Explore o mercado e clique na estrela ao lado de cada moeda
      </div>

      <div className="text-left">
        <h4 className="text-sm font-medium text-slate-300 mb-3">Moedas populares para explorar:</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {suggested.map((c) => (
            <Link
              key={c.id}
              to={`/coin/${c.id}`}
              className="bg-slate-800/60 border border-slate-700 rounded-xl p-3 flex items-center gap-3 hover:border-indigo-500/50 transition-colors group"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                style={{ backgroundColor: c.color }}
              >
                {c.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-white truncate">{c.name}</div>
                <div className="text-xs text-slate-500 uppercase">{c.symbol}</div>
              </div>
              <Plus className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
