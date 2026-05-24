// Dados mockados das principais criptomoedas
// Valores simulados inspirados em dados reais do mercado

export interface Crypto {
  id: string;
  rank: number;
  name: string;
  symbol: string;
  price: number;
  change1h: number;
  change24h: number;
  change7d: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  maxSupply: number | null;
  sparkline: number[];
  color: string;
  icon: string;
  description: string;
  website: string;
  launchYear: number;
}

// Gera um sparkline determinístico mas realista baseado em seed
function generateSparkline(seed: number, trend: number, volatility: number): number[] {
  const points = 168; // 7 dias em horas
  const values: number[] = [];
  let value = 100;
  for (let i = 0; i < points; i++) {
    const noise = Math.sin(seed * 12.9898 + i * 0.78233) * volatility;
    const wave = Math.sin(i * 0.15 + seed) * volatility * 0.5;
    const trendComponent = (trend / 100) * (i / points) * 20;
    value = value + noise + wave * 0.1 + trendComponent * 0.1;
    values.push(Math.max(50, value));
  }
  // Normaliza
  const min = Math.min(...values);
  const max = Math.max(...values);
  return values.map((v) => ((v - min) / (max - min)) * 100);
}

// Gera histórico de preços (últimos 30 dias) baseado no preço atual
export function generatePriceHistory(currentPrice: number, volatility: number, days: number = 30): { date: string; price: number }[] {
  const history: { date: string; price: number }[] = [];
  const now = Date.now();
  let price = currentPrice * (0.85 + Math.random() * 0.3);
  for (let i = days; i >= 0; i--) {
    const variation = (Math.random() - 0.5) * volatility * currentPrice;
    price = Math.max(currentPrice * 0.5, price + variation);
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    history.push({
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      price: Number(price.toFixed(currentPrice < 1 ? 6 : 2)),
    });
  }
  // Ajusta último ponto para bater com preço atual
  history[history.length - 1].price = currentPrice;
  return history;
}

const icons = {
  btc: '₿',
  eth: 'Ξ',
  usdt: '₮',
  bnb: '◆',
  sol: '◎',
  usdc: '$',
  xrp: '✕',
  ada: '₳',
  doge: 'Ð',
  trx: '⊶',
  ton: '◇',
  dot: '●',
  link: '⬡',
  matic: '⬢',
  avax: '▲',
  shib: 'S',
  ltc: 'Ł',
  uni: '🦄',
  etc: 'Ξ',
  atom: '⚛',
};

export const cryptos: Crypto[] = [
  {
    id: 'bitcoin', rank: 1, name: 'Bitcoin', symbol: 'BTC',
    price: 67432.18, change1h: 0.24, change24h: 2.15, change7d: 5.82,
    marketCap: 1334000000000, volume24h: 28450000000,
    circulatingSupply: 19700000, maxSupply: 21000000,
    sparkline: generateSparkline(1, 5.82, 2),
    color: '#f7931a', icon: icons.btc,
    description: 'Bitcoin é a primeira criptomoeda descentralizada do mundo, uma rede peer-to-peer que permite pagamentos online sem intermediários. Criada em 2009 por uma pessoa (ou grupo) sob o pseudônimo Satoshi Nakamoto.',
    website: 'https://bitcoin.org', launchYear: 2009,
  },
  {
    id: 'ethereum', rank: 2, name: 'Ethereum', symbol: 'ETH',
    price: 3521.47, change1h: -0.18, change24h: 3.42, change7d: 8.15,
    marketCap: 423000000000, volume24h: 15230000000,
    circulatingSupply: 120200000, maxSupply: null,
    sparkline: generateSparkline(2, 8.15, 3),
    color: '#627eea', icon: icons.eth,
    description: 'Ethereum é uma plataforma blockchain descentralizada que permite a execução de contratos inteligentes e aplicações descentralizadas (dApps). Foi criado por Vitalik Buterin em 2015.',
    website: 'https://ethereum.org', launchYear: 2015,
  },
  {
    id: 'tether', rank: 3, name: 'Tether', symbol: 'USDT',
    price: 1.00, change1h: 0.01, change24h: -0.02, change7d: 0.01,
    marketCap: 118000000000, volume24h: 45600000000,
    circulatingSupply: 118000000000, maxSupply: null,
    sparkline: generateSparkline(3, 0.01, 0.1),
    color: '#26a17b', icon: icons.usdt,
    description: 'Tether é uma stablecoin lastreada em dólar americano. Cada USDT é mantido em reserva pela Tether Limited e equivale a 1 USD.',
    website: 'https://tether.to', launchYear: 2014,
  },
  {
    id: 'bnb', rank: 4, name: 'BNB', symbol: 'BNB',
    price: 592.34, change1h: 0.32, change24h: 1.87, change7d: 4.23,
    marketCap: 88900000000, volume24h: 1840000000,
    circulatingSupply: 150000000, maxSupply: 200000000,
    sparkline: generateSparkline(4, 4.23, 2.5),
    color: '#f3ba2f', icon: icons.bnb,
    description: 'BNB é a criptomoeda nativa da exchange Binance. É usada para pagar taxas na plataforma e alimentar a Binance Smart Chain.',
    website: 'https://www.binance.com', launchYear: 2017,
  },
  {
    id: 'solana', rank: 5, name: 'Solana', symbol: 'SOL',
    price: 172.89, change1h: -0.42, change24h: 4.56, change7d: 12.34,
    marketCap: 81200000000, volume24h: 3420000000,
    circulatingSupply: 469000000, maxSupply: null,
    sparkline: generateSparkline(5, 12.34, 4),
    color: '#14f195', icon: icons.sol,
    description: 'Solana é uma blockchain de alto desempenho projetada para aplicativos descentralizados escaláveis. Oferece transações rápidas e de baixo custo.',
    website: 'https://solana.com', launchYear: 2020,
  },
  {
    id: 'usd-coin', rank: 6, name: 'USD Coin', symbol: 'USDC',
    price: 1.00, change1h: 0.00, change24h: 0.01, change7d: 0.00,
    marketCap: 34500000000, volume24h: 4560000000,
    circulatingSupply: 34500000000, maxSupply: null,
    sparkline: generateSparkline(6, 0, 0.05),
    color: '#2775ca', icon: icons.usdc,
    description: 'USD Coin é uma stablecoin emitida pela Circle, totalmente lastreada em dólares americanos mantidos em reserva.',
    website: 'https://www.circle.com', launchYear: 2018,
  },
  {
    id: 'xrp', rank: 7, name: 'XRP', symbol: 'XRP',
    price: 0.5842, change1h: 0.15, change24h: -1.23, change7d: 2.45,
    marketCap: 32800000000, volume24h: 1230000000,
    circulatingSupply: 56000000000, maxSupply: 100000000000,
    sparkline: generateSparkline(7, 2.45, 3),
    color: '#23292f', icon: icons.xrp,
    description: 'XRP é a criptomoeda nativa da rede Ripple, projetada para pagamentos transfronteiriços rápidos e de baixo custo.',
    website: 'https://ripple.com', launchYear: 2012,
  },
  {
    id: 'cardano', rank: 8, name: 'Cardano', symbol: 'ADA',
    price: 0.4521, change1h: 0.08, change24h: 2.34, change7d: 6.78,
    marketCap: 16100000000, volume24h: 456000000,
    circulatingSupply: 35700000000, maxSupply: 45000000000,
    sparkline: generateSparkline(8, 6.78, 3.5),
    color: '#0033ad', icon: icons.ada,
    description: 'Cardano é uma plataforma blockchain baseada em pesquisa acadêmica, com foco em escalabilidade, sustentabilidade e interoperabilidade.',
    website: 'https://cardano.org', launchYear: 2017,
  },
  {
    id: 'dogecoin', rank: 9, name: 'Dogecoin', symbol: 'DOGE',
    price: 0.1623, change1h: -0.34, change24h: 5.67, change7d: 15.23,
    marketCap: 23500000000, volume24h: 2340000000,
    circulatingSupply: 144900000000, maxSupply: null,
    sparkline: generateSparkline(9, 15.23, 5),
    color: '#c2a633', icon: icons.doge,
    description: 'Dogecoin é uma criptomoeda meme inspirada no cachorro Shiba Inu. Criada como brincadeira, tornou-se uma das moedas mais populares.',
    website: 'https://dogecoin.com', launchYear: 2013,
  },
  {
    id: 'tron', rank: 10, name: 'TRON', symbol: 'TRX',
    price: 0.1423, change1h: 0.22, change24h: 1.12, change7d: 3.45,
    marketCap: 12400000000, volume24h: 345000000,
    circulatingSupply: 87200000000, maxSupply: null,
    sparkline: generateSparkline(10, 3.45, 2.8),
    color: '#ff060a', icon: icons.trx,
    description: 'TRON é uma plataforma descentralizada baseada em blockchain dedicada a construir um sistema de entretenimento de conteúdo gratuito em todo o mundo.',
    website: 'https://tron.network', launchYear: 2017,
  },
  {
    id: 'toncoin', rank: 11, name: 'Toncoin', symbol: 'TON',
    price: 5.82, change1h: 0.12, change24h: 3.21, change7d: 8.92,
    marketCap: 14300000000, volume24h: 234000000,
    circulatingSupply: 2450000000, maxSupply: 5000000000,
    sparkline: generateSparkline(11, 8.92, 3.2),
    color: '#0098ea', icon: icons.ton,
    description: 'Toncoin é a criptomoeda nativa da The Open Network, originalmente desenvolvida pelo Telegram, agora mantida pela comunidade.',
    website: 'https://ton.org', launchYear: 2021,
  },
  {
    id: 'polkadot', rank: 12, name: 'Polkadot', symbol: 'DOT',
    price: 6.78, change1h: -0.15, change24h: 2.45, change7d: 5.67,
    marketCap: 9120000000, volume24h: 189000000,
    circulatingSupply: 1345000000, maxSupply: null,
    sparkline: generateSparkline(12, 5.67, 3),
    color: '#e6007a', icon: icons.dot,
    description: 'Polkadot é um protocolo multi-chain que permite a interoperabilidade entre diferentes blockchains.',
    website: 'https://polkadot.network', launchYear: 2020,
  },
  {
    id: 'chainlink', rank: 13, name: 'Chainlink', symbol: 'LINK',
    price: 14.23, change1h: 0.34, change24h: 4.12, change7d: 9.45,
    marketCap: 8450000000, volume24h: 456000000,
    circulatingSupply: 587000000, maxSupply: 1000000000,
    sparkline: generateSparkline(13, 9.45, 3.5),
    color: '#2a5ada', icon: icons.link,
    description: 'Chainlink é uma rede de oráculos descentralizada que conecta contratos inteligentes a dados do mundo real.',
    website: 'https://chain.link', launchYear: 2017,
  },
  {
    id: 'polygon', rank: 14, name: 'Polygon', symbol: 'MATIC',
    price: 0.5634, change1h: -0.23, change24h: 1.78, change7d: 4.23,
    marketCap: 5230000000, volume24h: 234000000,
    circulatingSupply: 9280000000, maxSupply: 10000000000,
    sparkline: generateSparkline(14, 4.23, 3),
    color: '#8247e5', icon: icons.matic,
    description: 'Polygon é uma solução de escalabilidade Layer 2 para Ethereum, oferecendo transações rápidas e baratas.',
    website: 'https://polygon.technology', launchYear: 2017,
  },
  {
    id: 'avalanche', rank: 15, name: 'Avalanche', symbol: 'AVAX',
    price: 28.45, change1h: 0.18, change24h: 3.56, change7d: 7.89,
    marketCap: 11200000000, volume24h: 345000000,
    circulatingSupply: 393000000, maxSupply: 720000000,
    sparkline: generateSparkline(15, 7.89, 3.5),
    color: '#e84142', icon: icons.avax,
    description: 'Avalanche é uma plataforma de contratos inteligentes de alta velocidade, baixo custo e eco-friendly.',
    website: 'https://www.avax.network', launchYear: 2020,
  },
  {
    id: 'shiba-inu', rank: 16, name: 'Shiba Inu', symbol: 'SHIB',
    price: 0.00002145, change1h: -0.45, change24h: 6.78, change7d: 18.34,
    marketCap: 12600000000, volume24h: 876000000,
    circulatingSupply: 589000000000000, maxSupply: null,
    sparkline: generateSparkline(16, 18.34, 6),
    color: '#ffa409', icon: icons.shib,
    description: 'Shiba Inu é uma criptomoeda meme descentralizada criada em agosto de 2020. Conhecida como "Dogecoin Killer".',
    website: 'https://shibatoken.com', launchYear: 2020,
  },
  {
    id: 'litecoin', rank: 17, name: 'Litecoin', symbol: 'LTC',
    price: 82.34, change1h: 0.09, change24h: 1.45, change7d: 3.67,
    marketCap: 6120000000, volume24h: 234000000,
    circulatingSupply: 74300000, maxSupply: 84000000,
    sparkline: generateSparkline(17, 3.67, 2.5),
    color: '#bfbbbb', icon: icons.ltc,
    description: 'Litecoin é uma criptomoeda peer-to-peer criada por Charlie Lee como uma versão mais leve do Bitcoin.',
    website: 'https://litecoin.org', launchYear: 2011,
  },
  {
    id: 'uniswap', rank: 18, name: 'Uniswap', symbol: 'UNI',
    price: 7.89, change1h: 0.23, change24h: 3.12, change7d: 6.45,
    marketCap: 4730000000, volume24h: 156000000,
    circulatingSupply: 599000000, maxSupply: 1000000000,
    sparkline: generateSparkline(18, 6.45, 3.2),
    color: '#ff007a', icon: icons.uni,
    description: 'Uniswap é um protocolo de exchange descentralizado construído no Ethereum.',
    website: 'https://uniswap.org', launchYear: 2018,
  },
  {
    id: 'ethereum-classic', rank: 19, name: 'Ethereum Classic', symbol: 'ETC',
    price: 22.45, change1h: -0.12, change24h: 2.34, change7d: 4.89,
    marketCap: 3340000000, volume24h: 189000000,
    circulatingSupply: 149000000, maxSupply: 210700000,
    sparkline: generateSparkline(19, 4.89, 3),
    color: '#328332', icon: icons.etc,
    description: 'Ethereum Classic é a blockchain original do Ethereum que continuou após o hard fork do DAO em 2016.',
    website: 'https://ethereumclassic.org', launchYear: 2016,
  },
  {
    id: 'cosmos', rank: 20, name: 'Cosmos', symbol: 'ATOM',
    price: 7.23, change1h: 0.17, change24h: 2.89, change7d: 5.34,
    marketCap: 2810000000, volume24h: 123000000,
    circulatingSupply: 388000000, maxSupply: null,
    sparkline: generateSparkline(20, 5.34, 3),
    color: '#2e3148', icon: icons.atom,
    description: 'Cosmos é uma rede descentralizada de blockchains independentes e paralelas, conhecida como "Internet das Blockchains".',
    website: 'https://cosmos.network', launchYear: 2019,
  },
];

export const currencies = {
  USD: { symbol: '$', name: 'Dólar Americano', rate: 1, locale: 'en-US' },
  BRL: { symbol: 'R$', name: 'Real Brasileiro', rate: 5.12, locale: 'pt-BR' },
  EUR: { symbol: '€', name: 'Euro', rate: 0.92, locale: 'de-DE' },
  GBP: { symbol: '£', name: 'Libra Esterlina', rate: 0.79, locale: 'en-GB' },
  JPY: { symbol: '¥', name: 'Iene Japonês', rate: 149.5, locale: 'ja-JP' },
};

export type CurrencyCode = keyof typeof currencies;
