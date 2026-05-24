import { useState, useMemo } from 'react';
import { cryptos as allCryptos } from '../data/cryptoData';
import { CryptoIcon, PercentChange, formatNumber } from '../components/ui';
import { useCurrency } from '../context/CurrencyContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { GitCompareArrows, X } from 'lucide-react';

export function ComparePage() {
  const { format } = useCurrency();
  const [selected, setSelected] = useState<string[]>(['bitcoin', 'ethereum']);

  const addCoin = (id: string) => {
    if (!selected.includes(id) && selected.length < 5) {
      setSelected([...selected, id]);
    }
  };

  const removeCoin = (id: string) => {
    if (selected.length > 1) {
      setSelected(selected.filter((s) => s !== id));
    }
  };

  const coins = selected.map((id) => allCryptos.find((c) => c.id === id)!).filter(Boolean);

  // Dados para gráfico comparativo (normalizado em %)
  const chartData = useMemo(() => {
    const points = 30;
    const data: { day: number; [key: string]: number }[] = [];
    
    for (let i = 0; i < points; i++) {
      const point: any = { day: i + 1 };
      coins.forEach((coin) => {
        // Simular variação histórica
        const variation = Math.sin(i * 0.3 + coin.rank) * 10 + (Math.random() - 0.5) * 8;
        point[coin.id] = variation;
      });
      data.push(point);
    }
    return data;
  }, [coins]);

  const colors = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <GitCompareArrows className="w-8 h-8 text-indigo-400" />
          Comparar Criptomoedas
        </h1>
        <p className="text-slate-400">Compare até 5 moedas lado a lado</p>
      </div>

      {/* Selected coins */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 flex-wrap mb-4">
          {coins.map((c, i) => (
            <div key={c.id} className="flex items-center gap-2 bg-slate-800 rounded-lg px-3 py-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i] }} />
              <CryptoIcon symbol={c.symbol} color={c.color} icon={c.icon} size={24} />
              <span className="text-sm text-white font-medium">{c.name}</span>
              {selected.length > 1 && (
                <button onClick={() => removeCoin(c.id)} className="text-slate-400 hover:text-red-400">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          {selected.length < 5 && (
            <select
              onChange={(e) => { addCoin(e.target.value); e.target.value = ''; }}
              value=""
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="">+ Adicionar moeda</option>
              {allCryptos.filter((c) => !selected.includes(c.id)).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.symbol})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={11} label={{ value: 'Dias', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }} />
              <YAxis stroke="#64748b" fontSize={11} label={{ value: 'Variação %', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                formatter={(v: any, name: any) => [`${Number(v).toFixed(2)}%`, coins.find((c) => c.id === name)?.symbol || name]}
              />
              <Legend />
              {coins.map((c, i) => (
                <Line
                  key={c.id}
                  type="monotone"
                  dataKey={c.id}
                  name={c.symbol}
                  stroke={colors[i]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparison table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Métrica</th>
                {coins.map((c) => (
                  <th key={c.id} className="text-right py-3 px-4 text-white font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <CryptoIcon symbol={c.symbol} color={c.color} icon={c.icon} size={24} />
                      {c.symbol}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <CompareRow label="Preço" values={coins.map((c) => format(c.price, { maxDecimals: c.price < 1 ? 6 : 2 }))} />
              <CompareRow label="Market Cap" values={coins.map((c) => format(c.marketCap, { compact: true }))} />
              <CompareRow label="Volume (24h)" values={coins.map((c) => format(c.volume24h, { compact: true }))} />
              <CompareRow label="Variação 1h" values={coins.map((c) => c.change1h)} percent />
              <CompareRow label="Variação 24h" values={coins.map((c) => c.change24h)} percent />
              <CompareRow label="Variação 7d" values={coins.map((c) => c.change7d)} percent />
              <CompareRow
                label="Oferta Circulante"
                values={coins.map((c) => `${formatNumber(c.circulatingSupply / 1000000, 0)}M`)}
              />
              <CompareRow
                label="Oferta Máxima"
                values={coins.map((c) => c.maxSupply ? `${formatNumber(c.maxSupply / 1000000, 0)}M` : '∞')}
              />
              <CompareRow label="Ranking" values={coins.map((c) => `#${c.rank}`)} />
              <CompareRow label="Ano de Lançamento" values={coins.map((c) => c.launchYear.toString())} />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CompareRow({ label, values, percent }: { label: string; values: (string | number)[]; percent?: boolean }) {
  return (
    <tr className="border-b border-slate-800/60">
      <td className="py-3 px-4 text-slate-400">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="py-3 px-4 text-right">
          {percent ? (
            <PercentChange value={v as number} />
          ) : (
            <span className="text-slate-200">{v}</span>
          )}
        </td>
      ))}
    </tr>
  );
}
