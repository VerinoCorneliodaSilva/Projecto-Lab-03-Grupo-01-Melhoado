export interface CryptoEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'halving' | 'airdrop' | 'launch' | 'upgrade' | 'conference' | 'regulation';
  impact: 'low' | 'medium' | 'high';
  crypto?: string;
  color: string;
}

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

export const eventsData: CryptoEvent[] = [
  {
    id: '1',
    title: 'Bitcoin Halving 2028',
    description: 'Próximo halving do Bitcoin reduzirá a recompensa por bloco de 3.125 para 1.5625 BTC.',
    date: new Date(now + 1200 * day).toISOString(),
    category: 'halving',
    impact: 'high',
    crypto: 'BTC',
    color: '#f7931a',
  },
  {
    id: '2',
    title: 'Ethereum Pectra Upgrade',
    description: 'Atualização que melhora a escalabilidade e reduz custos de transação na rede Ethereum.',
    date: new Date(now + 45 * day).toISOString(),
    category: 'upgrade',
    impact: 'high',
    crypto: 'ETH',
    color: '#627eea',
  },
  {
    id: '3',
    title: 'Airdrop Layer3',
    description: 'Snapshot para distribuição de tokens L3 para usuários ativos da plataforma.',
    date: new Date(now + 12 * day).toISOString(),
    category: 'airdrop',
    impact: 'medium',
    color: '#8b5cf6',
  },
  {
    id: '4',
    title: 'Token Unlocks Arbitrum',
    description: 'Liberação de 92.65M tokens ARB (valor estimado: US$ 110M).',
    date: new Date(now + 5 * day).toISOString(),
    category: 'launch',
    impact: 'high',
    crypto: 'ARB',
    color: '#28a0f0',
  },
  {
    id: '5',
    title: 'Consensus 2026',
    description: 'Maior conferência de criptomoedas e blockchain do mundo, em Austin, Texas.',
    date: new Date(now + 30 * day).toISOString(),
    category: 'conference',
    impact: 'medium',
    color: '#10b981',
  },
  {
    id: '6',
    title: 'Decisão da SEC sobre ETF Ethereum',
    description: 'Prazo final para a SEC decidir sobre novos ETFs spot de Ethereum.',
    date: new Date(now + 18 * day).toISOString(),
    category: 'regulation',
    impact: 'high',
    crypto: 'ETH',
    color: '#ef4444',
  },
  {
    id: '7',
    title: 'Solana Breakpoint Conference',
    description: 'Conferência anual do ecossistema Solana com anúncios de novos recursos.',
    date: new Date(now + 60 * day).toISOString(),
    category: 'conference',
    impact: 'medium',
    crypto: 'SOL',
    color: '#14f195',
  },
  {
    id: '8',
    title: 'Lançamento zkEVM v2',
    description: 'Nova versão do zkEVM promete maior compatibilidade com Ethereum.',
    date: new Date(now + 22 * day).toISOString(),
    category: 'upgrade',
    impact: 'medium',
    crypto: 'MATIC',
    color: '#8247e5',
  },
  {
    id: '9',
    title: 'Airdrop zkSync Season 2',
    description: 'Segunda rodada de distribuição de tokens ZK para usuários qualificados.',
    date: new Date(now + 8 * day).toISOString(),
    category: 'airdrop',
    impact: 'high',
    crypto: 'ZK',
    color: '#8c8dfc',
  },
  {
    id: '10',
    title: 'Regulamentação MiCA - Fase 2',
    description: 'Segunda fase da regulamentação europeia de criptoativos entra em vigor.',
    date: new Date(now + 90 * day).toISOString(),
    category: 'regulation',
    impact: 'high',
    color: '#3b82f6',
  },
];

export const categoryLabels: Record<CryptoEvent['category'], string> = {
  halving: 'Halving',
  airdrop: 'Airdrop',
  launch: 'Lançamento',
  upgrade: 'Upgrade',
  conference: 'Conferência',
  regulation: 'Regulação',
};
