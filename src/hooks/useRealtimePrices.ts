import { useEffect, useState } from 'react';
import { cryptos as initialCryptos, Crypto } from '../data/cryptoData';

// Simula atualizações de preço em tempo real
export function useRealtimePrices() {
  const [cryptos, setCryptos] = useState<Crypto[]>(initialCryptos);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCryptos((prev) =>
        prev.map((c) => {
          // Variação aleatória pequena (-0.5% a +0.5%)
          const variation = (Math.random() - 0.5) * 0.01;
          const newPrice = c.price * (1 + variation);
          
          // Atualizar também as variações percentuais levemente
          const change1h = c.change1h + (Math.random() - 0.5) * 0.1;
          const change24h = c.change24h + (Math.random() - 0.5) * 0.05;
          
          // Atualizar sparkline com novo ponto
          const newSparkline = [...c.sparkline.slice(1), c.sparkline[c.sparkline.length - 1] + variation * 100];
          
          return {
            ...c,
            price: Number(newPrice.toFixed(newPrice < 1 ? 6 : 2)),
            change1h: Number(change1h.toFixed(2)),
            change24h: Number(change24h.toFixed(2)),
            marketCap: c.marketCap * (1 + variation),
            sparkline: newSparkline,
          };
        })
      );
      setLastUpdate(new Date());
    }, 3000); // Atualiza a cada 3 segundos

    return () => clearInterval(interval);
  }, []);

  return { cryptos, lastUpdate };
}
