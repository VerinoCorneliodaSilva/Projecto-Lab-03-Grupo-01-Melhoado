import { useState } from 'react';
import { whaleData, onChainStats } from '../data/whalesData';
import { Fish, ArrowRight, ArrowUpRight, ArrowDownRight, Activity, Database, Cpu, Zap } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

export function WhalesPage() {
  const { format } = useCurrency();
  const [tab, setTab] = useState<'whales' | 'onchain'>('whales');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Fish className="w-8 h-8 text-blue-400" />
          Whales & On-Chain Analytics
        </h1>
        <p className="text-slate-400">Monitore grandes movimentações e métricas blockchain em tempo real</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900/60 border border-slate-800 p-1 rounded-lg mb-6 w-fit">
        <button
          onClick={() => setTab('whales')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'whales' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          🐋 Movimentações de Whales
        </button>
        <button
          onClick={() => setTab('onchain')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'onchain' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          ⛓ Análise On-Chain
        </button>
      </div>

      {tab === 'whales' ? (
        <div className="space-y-3">
          {whaleData.map((w) => {
            const typeConfig = {
              exchange_in: { icon: <ArrowUpRight className="w-4 h-4" />, label: 'Entrada em Exchange', color: 'bg-red-500/10 text-red-400 border-red-500/30' },
              exchange_out: { icon: <ArrowDownRight className="w-4 h-4" />, label: 'Saída de Exchange', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
              transfer: { icon: <ArrowRight className="w-4 h-4" />, label: 'Transferência', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
            };
            const cfg = typeConfig[w.type];
            return (
              <div key={w.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 hover:border-indigo-500/30 transition-colors">
                <div className="flex items-center gap-4 flex-wrap">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                    style={{ backgroundColor: w.color }}
                  >
                    {w.symbol.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-white font-semibold">{w.crypto}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.color} flex items-center gap-1`}>
                        {cfg.icon}
                        {cfg.label}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {w.fromLabel && <span className="text-slate-300">{w.fromLabel}</span>}
                      {!w.fromLabel && <span>{w.from}</span>}
                      <ArrowRight className="w-3 h-3 inline mx-2" />
                      {w.toLabel && <span className="text-slate-300">{w.toLabel}</span>}
                      {!w.toLabel && <span>{w.to}</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">
                      {w.amount.toLocaleString('pt-BR')} {w.symbol}
                    </div>
                    <div className="text-sm text-slate-400">
                      ≈ {format(w.valueUsd, { compact: true })}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {formatTimeAgo(w.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <OnChainStat
              icon={<Activity className="w-5 h-5 text-emerald-400" />}
              label="Endereços Ativos"
              value={onChainStats.activeAddresses.toLocaleString('pt-BR')}
              change="+5.2%"
            />
            <OnChainStat
              icon={<Database className="w-5 h-5 text-indigo-400" />}
              label="Transações 24h"
              value={onChainStats.transactions24h.toLocaleString('pt-BR')}
              change="+12.8%"
            />
            <OnChainStat
              icon={<Zap className="w-5 h-5 text-yellow-400" />}
              label="Taxas 24h"
              value={format(onChainStats.totalFees24h, { compact: true })}
              change="-3.4%"
            />
            <OnChainStat
              icon={<Cpu className="w-5 h-5 text-purple-400" />}
              label="Hash Rate"
              value={onChainStats.hashRate}
              change="+2.1%"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">Métricas da Rede Bitcoin</h3>
              <div className="space-y-3">
                <MetricRow label="Tempo de Bloco" value={`${onChainStats.blockTime} min`} />
                <MetricRow label="Dificuldade" value={onChainStats.difficulty} />
                <MetricRow label="Hash Rate" value={onChainStats.hashRate} />
                <MetricRow label="Mempool" value={`${onChainStats.mempool.toLocaleString('pt-BR')} txs`} />
                <MetricRow label="Taxa Média" value={`${onChainStats.avgGasPrice} sat/vB`} />
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">Top Carteiras Ativas</h3>
              <div className="space-y-3">
                {[
                  { addr: 'bc1q...9f3e', balance: '245,678 BTC', label: 'Whale Unknown' },
                  { addr: '0x7c8d...4a2b', balance: '189,234 BTC', label: 'Binance' },
                  { addr: '0x3f4e...8b2c', balance: '152,000 BTC', label: 'MicroStrategy' },
                  { addr: 'bc1p...m3n4', balance: '134,890 BTC', label: 'Grayscale' },
                  { addr: '0x5e6f...1d2a', balance: '98,456 BTC', label: 'Coinbase' },
                ].map((w, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-xs w-5">{i + 1}</span>
                      <div>
                        <div className="text-white font-mono text-xs">{w.addr}</div>
                        <div className="text-xs text-slate-500">{w.label}</div>
                      </div>
                    </div>
                    <div className="text-slate-200 font-medium">{w.balance}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-2">📊 Análise On-Chain</h3>
            <div className="space-y-2 text-sm text-slate-300">
              <p>• <strong className="text-white">Exchange Inflows:</strong> Entradas em exchanges estão baixas, sinalizando acumulação.</p>
              <p>• <strong className="text-white">Active Addresses:</strong> Número de endereços ativos cresceu 5.2% nas últimas 24h.</p>
              <p>• <strong className="text-white">Whale Accumulation:</strong> Carteiras com +1000 BTC aumentaram posições em 2.3% esta semana.</p>
              <p>• <strong className="text-white">Network Activity:</strong> Volume on-chain está 18% acima da média de 30 dias.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OnChainStat({ icon, label, value, change }: { icon: React.ReactNode; label: string; value: string; change: string }) {
  const isPositive = change.startsWith('+');
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        {icon}
        <span className={`text-xs ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>{change}</span>
      </div>
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className="text-lg font-bold text-white">{value}</div>
    </div>
  );
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  );
}

function formatTimeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  if (minutes < 60) return `${minutes}min atrás`;
  if (hours < 24) return `${hours}h atrás`;
  return `${Math.floor(hours / 24)}d atrás`;
}
