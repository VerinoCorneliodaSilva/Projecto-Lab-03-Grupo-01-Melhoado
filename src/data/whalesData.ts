export interface WhaleMovement {
  id: string;
  crypto: string;
  symbol: string;
  amount: number;
  valueUsd: number;
  from: string;
  to: string;
  fromLabel?: string;
  toLabel?: string;
  timestamp: string;
  txHash: string;
  type: 'transfer' | 'exchange_in' | 'exchange_out';
  color: string;
}

const wallets = [
  { addr: '0x1a2b...9f3e', label: 'Binance Hot Wallet' },
  { addr: '0x7c8d...4a2b', label: 'Coinbase Custody' },
  { addr: 'bc1q...x9k2', label: 'Whale Unknown' },
  { addr: '0x3f4e...8b2c', label: 'MicroStrategy' },
  { addr: '0x9a0b...7c3d', label: 'Grayscale Trust' },
  { addr: 'bc1p...m3n4', label: 'Exchange Wallet' },
  { addr: '0x5e6f...1d2a', label: 'Whale #156' },
  { addr: '0x2b3c...8e9f', label: 'Kraken' },
];

export const whaleData: WhaleMovement[] = [
  {
    id: '1', crypto: 'Bitcoin', symbol: 'BTC',
    amount: 2500, valueUsd: 168580000,
    from: wallets[2].addr, to: wallets[0].addr,
    fromLabel: wallets[2].label, toLabel: wallets[0].label,
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    txHash: '0x8a2f...9b3e', type: 'exchange_in', color: '#f7931a',
  },
  {
    id: '2', crypto: 'Ethereum', symbol: 'ETH',
    amount: 45000, valueUsd: 158466000,
    from: wallets[1].addr, to: wallets[4].addr,
    fromLabel: wallets[1].label, toLabel: wallets[4].label,
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    txHash: '0x7b3c...2a1d', type: 'exchange_out', color: '#627eea',
  },
  {
    id: '3', crypto: 'Tether', symbol: 'USDT',
    amount: 100000000, valueUsd: 100000000,
    from: wallets[3].addr, to: wallets[5].addr,
    fromLabel: wallets[3].label, toLabel: wallets[5].label,
    timestamp: new Date(Date.now() - 1000 * 60 * 32).toISOString(),
    txHash: '0x9c4d...3e2f', type: 'transfer', color: '#26a17b',
  },
  {
    id: '4', crypto: 'Solana', symbol: 'SOL',
    amount: 850000, valueUsd: 146965000,
    from: wallets[6].addr, to: wallets[7].addr,
    fromLabel: wallets[6].label, toLabel: wallets[7].label,
    timestamp: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
    txHash: '5xKq...8mNp', type: 'exchange_in', color: '#14f195',
  },
  {
    id: '5', crypto: 'BNB', symbol: 'BNB',
    amount: 180000, valueUsd: 106621200,
    from: wallets[0].addr, to: wallets[6].addr,
    fromLabel: wallets[0].label, toLabel: wallets[6].label,
    timestamp: new Date(Date.now() - 1000 * 60 * 67).toISOString(),
    txHash: '0xab3c...4f2e', type: 'exchange_out', color: '#f3ba2f',
  },
  {
    id: '6', crypto: 'Bitcoin', symbol: 'BTC',
    amount: 1200, valueUsd: 80918600,
    from: wallets[4].addr, to: wallets[1].addr,
    fromLabel: wallets[4].label, toLabel: wallets[1].label,
    timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    txHash: '0xcd4e...5g3f', type: 'exchange_in', color: '#f7931a',
  },
  {
    id: '7', crypto: 'Ethereum', symbol: 'ETH',
    amount: 28000, valueUsd: 98599160,
    from: wallets[6].addr, to: wallets[0].addr,
    fromLabel: wallets[6].label, toLabel: wallets[0].label,
    timestamp: new Date(Date.now() - 1000 * 60 * 128).toISOString(),
    txHash: '0xef5g...6h4g', type: 'exchange_in', color: '#627eea',
  },
  {
    id: '8', crypto: 'USD Coin', symbol: 'USDC',
    amount: 75000000, valueUsd: 75000000,
    from: wallets[1].addr, to: wallets[3].addr,
    fromLabel: wallets[1].label, toLabel: wallets[3].label,
    timestamp: new Date(Date.now() - 1000 * 60 * 156).toISOString(),
    txHash: '0xgh6h...7i5h', type: 'transfer', color: '#2775ca',
  },
];

export interface OnChainStats {
  activeAddresses: number;
  transactions24h: number;
  totalFees24h: number;
  avgGasPrice: number;
  hashRate: string;
  blockTime: number;
  difficulty: string;
  mempool: number;
}

export const onChainStats: OnChainStats = {
  activeAddresses: 1245678,
  transactions24h: 523489,
  totalFees24h: 12340000,
  avgGasPrice: 24.5,
  hashRate: '625 EH/s',
  blockTime: 10.2,
  difficulty: '88.4 T',
  mempool: 45230,
};
