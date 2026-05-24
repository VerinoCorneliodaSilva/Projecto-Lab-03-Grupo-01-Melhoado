import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CurrencyCode, currencies } from '../data/cryptoData';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  format: (value: number, opts?: { maxDecimals?: number; compact?: boolean }) => string;
  convert: (usd: number) => number;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const stored = localStorage.getItem('cn_currency');
    if (stored && stored in currencies) return stored as CurrencyCode;
    return 'USD';
  });

  useEffect(() => {
    localStorage.setItem('cn_currency', currency);
  }, [currency]);

  const setCurrency = (c: CurrencyCode) => setCurrencyState(c);

  const convert = (usd: number) => usd * currencies[currency].rate;

  const format = (value: number, opts?: { maxDecimals?: number; compact?: boolean }) => {
    const converted = convert(value);
    const cur = currencies[currency];
    const maxDec = opts?.maxDecimals ?? (converted < 1 ? 6 : 2);

    if (opts?.compact && converted >= 1000) {
      return new Intl.NumberFormat(cur.locale, {
        style: 'currency',
        currency: currency,
        notation: 'compact',
        maximumFractionDigits: 2,
      }).format(converted);
    }

    return new Intl.NumberFormat(cur.locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: converted < 0.01 ? 6 : 2,
      maximumFractionDigits: maxDec,
    }).format(converted);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, format, convert, symbol: currencies[currency].symbol }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
