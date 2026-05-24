import { useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useRealtimePrices } from '../hooks/useRealtimePrices';
import { usePortfolio } from '../hooks/usePortfolio';
import { CryptoIcon, PercentChange } from '../components/ui';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, PieChart, ArrowUpRight, ArrowDownRight, History, DollarSign, Activity } from 'lucide-react';

export function PortfolioPage() {
  const { user } = useAuth();
  const { format } = useCurrency();
  const { cryptos } = useRealtimePrices();
  const { holdings, transactions } = usePortfolio();

  if (!user) return <Navigate to="/auth" replace />;

  const portfolioData = useMemo(() => {
    const holdingsData = holdings.map((h) => {
      const crypto = cryptos.find((c) => c.id === h.cryptoId);
      if (!crypto) return null;
      const currentValue = h.amount * crypto.price;
      const profit = currentValue - h.totalInvested;
      const profitPercent = h.totalInvested > 0 ? (profit / h.totalInvested) * 100 : 0;
      return { ...h, crypto, currentValue, profit, profitPercent };
    }).filter(Boolean) as Array<any>;

    const totalInvested = holdingsData.reduce((sum, h) => sum + h.totalInvested, 0);
    const totalCurrentValue = holdingsData.reduce((sum, h) => sum + h.currentValue, 0);
    const totalProfit = totalCurrentValue - totalInvested;
    const totalProfitPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

    return { holdingsData, totalInvested, totalCurrentValue, totalProfit, totalProfitPercent };
  }, [holdings, cryptos]);

  const totalPortfolioValue = user.balance + portfolioData.totalCurrentValue;
  const distributionData = portfolioData.holdingsData.map((h: any) => ({
    name: h.symbol,
    value: h.currentValue,
    color: h.crypto.color,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Wallet className="w-8 h-8 text-indigo-400" />
          Meu Portfólio
        </h1>
        <p className="text-slate-400">Olá, {user.name}! Aqui está o resumo do seu portfólio.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Valor Total" value={format(totalPortfolioValue, { compact: true })} icon={<DollarSign className="w-5 h-5 text-emerald-400" />} trend={portfolioData.totalProfitPercent} />
        <StatCard label="Saldo Disponível" value={format(user.balance)} icon={<Wallet className="w-5 h-5 text-indigo-400" />} />
        <StatCard label="Valor Investido" value={format(portfolioData.totalInvested, { compact: true })} icon={<PieChart className="w-5 h-5 text-purple-400" />} />
        <StatCard label="Lucro/Prejuízo" value={format(portfolioData.totalProfit)} trend={portfolioData.totalProfitPercent} icon={portfolioData.totalProfit >= 0 ? <TrendingUp className="w-5 h-5 text-emerald-400" /> : <TrendingDown className="w-5 h-5 text-red-400" />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              Performance do Portfólio
            </h3>
          </div>
          <div className="h-64">
            {portfolioData.holdingsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={generatePortfolioHistory(portfolioData.totalCurrentValue)}>
                  <defs>
                    <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                    formatter={(v: any) => [format(Number(v)), 'Valor']}
                  />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="url(#portfolioGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                <div className="text-center">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Faça sua primeira compra para ver o gráfico</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-400" />
            Distribuição
          </h3>
          {distributionData.length > 0 ? (
            <div className="space-y-3">
              {distributionData.map((d: any) => {
                const percent = (d.value / portfolioData.totalCurrentValue) * 100;
                return (
                  <div key={d.name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-300">{d.name}</span>
                      <span className="text-slate-400">{percent.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, backgroundColor: d.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-slate-500 py-8">
              <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhum ativo ainda</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            Histórico de Transações ({transactions.length})
          </h3>
        </div>

        {transactions.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet className="w-16 h-16 mx-auto mb-4 text-slate-700" />
            <h3 className="text-lg font-medium text-white mb-2">Você ainda não possui transações</h3>
            <p className="text-slate-400 mb-4">Comece a negociar agora e construa seu portfólio</p>
            <Link to="/" className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium px-4 py-2 rounded-lg">
              Explorar Mercado
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-800">
                  <th className="text-left py-3 px-4 font-medium">Data</th>
                  <th className="text-left py-3 px-4 font-medium">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium">Ativo</th>
                  <th className="text-right py-3 px-4 font-medium">Quantidade</th>
                  <th className="text-right py-3 px-4 font-medium">Preço</th>
                  <th className="text-right py-3 px-4 font-medium">Total</th>
                  <th className="text-right py-3 px-4 font-medium hidden sm:table-cell">Taxa</th>
                </tr>
              </thead>
              <tbody>
                {transactions.slice(0, 20).map((tx) => {
                  const crypto = cryptos.find((c) => c.id === tx.cryptoId);
                  return (
                    <tr key={tx.id} className="border-b border-slate-800/60 hover:bg-slate-900/60">
                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {new Date(tx.timestamp).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          tx.type === 'buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}>
                          {tx.type === 'buy' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {tx.type === 'buy' ? 'Compra' : 'Venda'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {crypto && <CryptoIcon symbol={tx.symbol} color={crypto.color} icon={crypto.icon} size={24} />}
                          <span className="text-slate-200">{tx.symbol}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-100">{tx.amount.toFixed(6)}</td>
                      <td className="py-3 px-4 text-right text-slate-300">{format(tx.price, { maxDecimals: tx.price < 1 ? 6 : 2 })}</td>
                      <td className="py-3 px-4 text-right text-slate-100 font-medium">{format(tx.total)}</td>
                      <td className="py-3 px-4 text-right text-slate-400 hidden sm:table-cell">{format(tx.fee)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {portfolioData.holdingsData.length > 0 && (
        <div className="mt-8 bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-400" />
              Suas Posições ({portfolioData.holdingsData.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 border-b border-slate-800">
                  <th className="text-left py-3 px-4 font-medium">Ativo</th>
                  <th className="text-right py-3 px-4 font-medium">Quantidade</th>
                  <th className="text-right py-3 px-4 font-medium hidden sm:table-cell">Preço Médio</th>
                  <th className="text-right py-3 px-4 font-medium">Preço Atual</th>
                  <th className="text-right py-3 px-4 font-medium">Valor</th>
                  <th className="text-right py-3 px-4 font-medium">P/L</th>
                  <th className="text-right py-3 px-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {portfolioData.holdingsData.map((h: any) => (
                  <tr key={h.cryptoId} className="border-b border-slate-800/60 hover:bg-slate-900/60">
                    <td className="py-4 px-4">
                      <Link to={`/coin/${h.cryptoId}`} className="flex items-center gap-3">
                        <CryptoIcon symbol={h.symbol} color={h.crypto.color} icon={h.crypto.icon} />
                        <div>
                          <div className="text-white font-medium">{h.crypto.name}</div>
                          <div className="text-xs text-slate-500 uppercase">{h.symbol}</div>
                        </div>
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-right text-slate-100">{h.amount.toFixed(6)}</td>
                    <td className="py-4 px-4 text-right text-slate-300 hidden sm:table-cell">{format(h.avgBuyPrice)}</td>
                    <td className="py-4 px-4 text-right text-slate-100">{format(h.crypto.price, { maxDecimals: h.crypto.price < 1 ? 4 : 2 })}</td>
                    <td className="py-4 px-4 text-right text-slate-100 font-medium">{format(h.currentValue)}</td>
                    <td className="py-4 px-4 text-right">
                      <div className={`font-medium ${h.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {h.profit >= 0 ? '+' : ''}{format(h.profit)}
                      </div>
                      <PercentChange value={h.profitPercent} />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link to={`/trade/${h.cryptoId}`} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                        Negociar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, trend }: { label: string; value: string; icon: React.ReactNode; trend?: number }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400">{label}</span>
        {icon}
      </div>
      <div className="text-xl md:text-2xl font-bold text-white">{value}</div>
      {trend !== undefined && (
        <div className={`text-xs mt-1 ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(2)}%
        </div>
      )}
    </div>
  );
}

function generatePortfolioHistory(currentValue: number) {
  const points = 30;
  const data = [];
  let value = currentValue * 0.8;
  for (let i = points; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    value = value + (Math.random() - 0.4) * currentValue * 0.02;
    value = Math.max(0, value);
    data.push({
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      value: Number(value.toFixed(2)),
    });
  }
  data[data.length - 1].value = currentValue;
  return data;
}
