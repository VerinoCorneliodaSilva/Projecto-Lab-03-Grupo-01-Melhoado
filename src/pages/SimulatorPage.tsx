import { useState, useMemo } from 'react';
import { cryptos } from '../data/cryptoData';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Calculator, TrendingUp, Target, Calendar, DollarSign } from 'lucide-react';

export function SimulatorPage() {
  const [cryptoId, setCryptoId] = useState('bitcoin');
  const [investment, setInvestment] = useState('1000');
  const [months, setMonths] = useState('12');
  const [monthlyRate, setMonthlyRate] = useState('5');
  const [monthlyContribution, setMonthlyContribution] = useState('100');

  const crypto = cryptos.find((c) => c.id === cryptoId)!;
  const inv = parseFloat(investment) || 0;
  const mo = parseInt(months) || 0;
  const rate = parseFloat(monthlyRate) / 100 || 0;
  const contrib = parseFloat(monthlyContribution) || 0;

  const projection = useMemo(() => {
    const data = [];
    let balance = inv;
    let totalContributed = inv;
    
    data.push({
      month: 0,
      balance: Number(balance.toFixed(2)),
      contributed: totalContributed,
    });

    for (let i = 1; i <= mo; i++) {
      balance = balance * (1 + rate) + contrib;
      totalContributed += contrib;
      data.push({
        month: i,
        balance: Number(balance.toFixed(2)),
        contributed: Number(totalContributed.toFixed(2)),
      });
    }
    return data;
  }, [inv, mo, rate, contrib]);

  const finalBalance = projection[projection.length - 1]?.balance || 0;
  const totalContributed = projection[projection.length - 1]?.contributed || 0;
  const profit = finalBalance - totalContributed;
  const roi = totalContributed > 0 ? (profit / totalContributed) * 100 : 0;
  const coinsBought = totalContributed / crypto.price;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Calculator className="w-8 h-8 text-indigo-400" />
          Simulador de Investimento
        </h1>
        <p className="text-slate-400">Projete seus retornos com juros compostos e aportes mensais</p>
      </div>

      <div className="grid lg:grid-cols-[400px_1fr] gap-6">
        {/* Config */}
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Configuração</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Criptomoeda</label>
                <select
                  value={cryptoId}
                  onChange={(e) => setCryptoId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  {cryptos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.symbol}) - ${c.price < 1 ? c.price.toFixed(4) : c.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Investimento Inicial (USD)</label>
                <input
                  type="number"
                  value={investment}
                  onChange={(e) => setInvestment(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Aporte Mensal (USD)</label>
                <input
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Taxa Mensal de Retorno (%)</label>
                <input
                  type="number"
                  value={monthlyRate}
                  onChange={(e) => setMonthlyRate(e.target.value)}
                  step="0.1"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
                <div className="flex gap-1 mt-2">
                  {['2', '5', '10', '15', '20'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setMonthlyRate(r)}
                      className="flex-1 text-xs text-slate-400 hover:text-white hover:bg-slate-800 py-1 rounded"
                    >
                      {r}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Período (meses)</label>
                <input
                  type="range"
                  min="1"
                  max="120"
                  value={months}
                  onChange={(e) => setMonths(e.target.value)}
                  className="w-full accent-indigo-500"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>1 mês</span>
                  <span className="text-indigo-400 font-medium">{months} meses ({(parseInt(months) / 12).toFixed(1)} anos)</span>
                  <span>10 anos</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <ResultCard
              icon={<Target className="w-4 h-4 text-indigo-400" />}
              label="Saldo Final"
              value={`$${finalBalance.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
              color="text-white"
            />
            <ResultCard
              icon={<DollarSign className="w-4 h-4 text-emerald-400" />}
              label="Lucro Total"
              value={`$${profit.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
              color="text-emerald-400"
            />
            <ResultCard
              icon={<TrendingUp className="w-4 h-4 text-purple-400" />}
              label="ROI"
              value={`${roi.toFixed(1)}%`}
              color="text-purple-400"
            />
            <ResultCard
              icon={<Calendar className="w-4 h-4 text-orange-400" />}
              label={`≈ ${crypto.symbol}`}
              value={coinsBought.toFixed(4)}
              color="text-orange-400"
            />
          </div>

          {/* Chart */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Evolução do Patrimônio</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={projection}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} label={{ value: 'Meses', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                    formatter={(v: any) => [`$${Number(v).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`]}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="balance" name="Saldo" stroke="#6366f1" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="contributed" name="Investido" stroke="#64748b" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3">💡 Análise</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>• Você investirá um total de <strong className="text-white">${totalContributed.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</strong> ao longo de {months} meses</li>
              <li>• Com retorno médio de <strong className="text-emerald-400">{monthlyRate}% ao mês</strong>, seu patrimônio pode crescer <strong className="text-emerald-400">{roi.toFixed(0)}%</strong></li>
              <li>• O equivalente a aproximadamente <strong className="text-orange-400">{coinsBought.toFixed(4)} {crypto.symbol}</strong> no preço atual</li>
              <li className="text-xs text-slate-500 pt-2 italic">
                ⚠️ Projeção baseada em retornos constantes. Resultados reais podem variar significativamente.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
