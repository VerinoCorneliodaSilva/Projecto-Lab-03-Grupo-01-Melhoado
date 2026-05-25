import { Link } from 'react-router-dom';
import { Crypto } from '../data/cryptoData';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { Sparkline, PercentChange, CryptoIcon, formatNumber } from './ui';
import { useLanguage } from '../context/LanguageContext';
import { Star, Zap } from 'lucide-react';

interface CryptoTableProps {
  cryptos: Crypto[];
  watchlist: string[];
  onToggleWatchlist: (id: string) => void;
}

export function CryptoTable({ cryptos, watchlist, onToggleWatchlist }: CryptoTableProps) {
  const { format } = useCurrency();
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-slate-400 border-b border-slate-800">
            <th className="text-left py-3 px-2 font-medium w-8"></th>
            <th className="text-left py-3 px-2 font-medium w-12">{t('table.rank')}</th>
            {user && <th className="text-center py-3 px-2 font-medium w-16 hidden md:table-cell">{t('common.action')}</th>}
            <th className="text-left py-3 px-2 font-medium">{t('table.name')}</th>
            <th className="text-right py-3 px-2 font-medium">{t('table.price')}</th>
            <th className="text-right py-3 px-2 font-medium hidden sm:table-cell">{t('table.change1h')}</th>
            <th className="text-right py-3 px-2 font-medium">{t('table.change24h')}</th>
            <th className="text-right py-3 px-2 font-medium hidden md:table-cell">{t('table.change7d')}</th>
            <th className="text-right py-3 px-2 font-medium hidden lg:table-cell">{t('table.marketCap')}</th>
            <th className="text-right py-3 px-2 font-medium hidden xl:table-cell">{t('table.volume')}</th>
            <th className="text-right py-3 px-2 font-medium hidden lg:table-cell">{t('table.last7d')}</th>
          </tr>
        </thead>
        <tbody>
          {cryptos.map((c) => {
            const inWatchlist = watchlist.includes(c.id);
            return (
              <tr
                key={c.id}
                className="border-b border-slate-800/60 hover:bg-slate-900/60 transition-colors"
              >
                <td className="py-4 px-2">
                  <button
                    onClick={() => onToggleWatchlist(c.id)}
                    className={`transition-colors ${inWatchlist ? 'text-yellow-400' : 'text-slate-600 hover:text-slate-400'}`}
                    aria-label={inWatchlist ? 'Remover da watchlist' : 'Adicionar à watchlist'}
                  >
                    <Star className="w-4 h-4" fill={inWatchlist ? 'currentColor' : 'none'} />
                  </button>
                </td>
                <td className="py-4 px-2 text-slate-400">{c.rank}</td>
                {user && (
                  <td className="py-4 px-2 text-center hidden md:table-cell">
                    <Link
                      to={`/trade/${c.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2 py-1 rounded"
                    >
                      <Zap className="w-3 h-3" />
                      {t('common.trade')}
                    </Link>
                  </td>
                )}
                <td className="py-4 px-2">
                  <Link to={`/coin/${c.id}`} className="flex items-center gap-3 hover:text-indigo-400">
                    <CryptoIcon symbol={c.symbol} color={c.color} icon={c.icon} />
                    <div className="min-w-0">
                      <div className="font-medium text-slate-100 truncate">{c.name}</div>
                      <div className="text-xs text-slate-500 uppercase">{c.symbol}</div>
                    </div>
                  </Link>
                </td>
                <td className="py-4 px-2 text-right font-medium text-slate-100 whitespace-nowrap">
                  {format(c.price, { maxDecimals: c.price < 1 ? 6 : 2 })}
                </td>
                <td className="py-4 px-2 text-right hidden sm:table-cell">
                  <PercentChange value={c.change1h} />
                </td>
                <td className="py-4 px-2 text-right">
                  <PercentChange value={c.change24h} />
                </td>
                <td className="py-4 px-2 text-right hidden md:table-cell">
                  <PercentChange value={c.change7d} />
                </td>
                <td className="py-4 px-2 text-right text-slate-300 hidden lg:table-cell whitespace-nowrap">
                  {format(c.marketCap, { compact: true })}
                </td>
                <td className="py-4 px-2 text-right text-slate-300 hidden xl:table-cell whitespace-nowrap">
                  <div>{format(c.volume24h, { compact: true })}</div>
                  <div className="text-xs text-slate-500">
                    {formatNumber(c.circulatingSupply / 1000000, 0)}M {c.symbol}
                  </div>
                </td>
                <td className="py-4 px-2 hidden lg:table-cell">
                  <div className="flex justify-end">
                    <Sparkline data={c.sparkline} positive={c.change7d >= 0} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
