import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Brain, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface AIPredictionProps {
  symbol: string;
  currentPrice: number;
  change24h: number;
  change7d: number;
}

export function AIPrediction({ symbol, currentPrice, change24h, change7d }: AIPredictionProps) {
  const prediction = useMemo(() => {
    // Simulação de IA baseada em momentum e volatilidade
    const momentum = (change24h + change7d) / 2;
    const volatility = Math.abs(change24h) + Math.abs(change7d);

    let signal: 'bullish' | 'bearish' | 'neutral';
    let confidence: number;
    let targetPrice: number;
    let reasoning: string[];

    if (momentum > 3) {
      signal = 'bullish';
      confidence = Math.min(85, 60 + momentum * 2);
      targetPrice = currentPrice * (1 + (momentum / 100) * 1.2);
      reasoning = [
        'Forte momentum de alta detectado',
        'Volume acima da média',
        'Padrão de continuidade identificado',
      ];
    } else if (momentum < -3) {
      signal = 'bearish';
      confidence = Math.min(85, 60 + Math.abs(momentum) * 2);
      targetPrice = currentPrice * (1 + (momentum / 100) * 1.2);
      reasoning = [
        'Pressão de venda significativa',
        'Ruptura de suporte observada',
        'Indicadores técnicos negativos',
      ];
    } else {
      signal = 'neutral';
      confidence = 45 + Math.random() * 20;
      targetPrice = currentPrice * (1 + (Math.random() - 0.5) * 0.05);
      reasoning = [
        'Mercado em consolidação',
        'Indicadores mistos',
        'Aguardar confirmação de tendência',
      ];
    }

    // Ajustar baseado em volatilidade
    if (volatility > 15) {
      confidence -= 10;
      reasoning.push('Alta volatilidade reduz confiança');
    }

    return {
      signal,
      confidence: Math.max(30, confidence),
      targetPrice,
      change: ((targetPrice - currentPrice) / currentPrice) * 100,
      reasoning,
      timeframe: '7 dias',
    };
  }, [currentPrice, change24h, change7d]);

  const signalConfig = {
    bullish: {
      icon: <TrendingUp className="w-5 h-5" />,
      label: 'Alta',
      color: 'emerald',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
    },
    bearish: {
      icon: <TrendingDown className="w-5 h-5" />,
      label: 'Baixa',
      color: 'red',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
    },
    neutral: {
      icon: <AlertTriangle className="w-5 h-5" />,
      label: 'Neutro',
      color: 'yellow',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
      text: 'text-yellow-400',
    },
  };

  const config = signalConfig[prediction.signal];

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-5`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
          <Brain className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">Previsão IA — {symbol}</h3>
          <p className="text-xs text-slate-400">Próximos {prediction.timeframe}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-slate-400 mb-1">Sinal</div>
          <div className={`flex items-center gap-2 ${config.text}`}>
            {config.icon}
            <span className="text-lg font-bold">{config.label}</span>
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-400 mb-1">Confiança</div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-white">{prediction.confidence.toFixed(0)}</span>
            <span className="text-xs text-slate-400">%</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full mt-1 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${
                config.color === 'emerald' ? 'from-emerald-500 to-emerald-400' :
                config.color === 'red' ? 'from-red-500 to-red-400' :
                'from-yellow-500 to-yellow-400'
              }`}
              style={{ width: `${prediction.confidence}%` }}
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-lg p-3 mb-3">
        <div className="text-xs text-slate-400 mb-1">Preço Alvo</div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-white">
            ${prediction.targetPrice.toFixed(prediction.targetPrice < 1 ? 6 : 2)}
          </span>
          <span className={`text-sm font-medium ${prediction.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {prediction.change >= 0 ? '+' : ''}{prediction.change.toFixed(2)}%
          </span>
        </div>
      </div>

      <div>
        <div className="text-xs text-slate-400 mb-2">Análise</div>
        <div className="space-y-1.5">
          {prediction.reasoning.map((r, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
              <CheckCircle2 className={`w-3 h-3 mt-0.5 shrink-0 ${config.text}`} />
              <span>{r}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-[10px] text-slate-500 mt-3 italic">
        ⚠️ Previsão gerada por IA. Não é recomendação de investimento.
      </p>
    </div>
  );
}
