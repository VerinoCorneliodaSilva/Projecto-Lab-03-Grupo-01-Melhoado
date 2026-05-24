import { usePortfolio } from './usePortfolio';

export function useWatchlist() {
  const { watchlist, toggleWatchlist } = usePortfolio();
  
  return {
    watchlist: watchlist?.cryptoIds || [],
    toggle: toggleWatchlist,
  };
}
