import { useState } from 'react';
import { newsData, News } from '../data/newsData';
import { Newspaper, Flame, Clock, ExternalLink, Search } from 'lucide-react';

const categories = [
  { id: 'all', label: 'Todas', icon: Flame },
  { id: 'bitcoin', label: 'Bitcoin', icon: Flame },
  { id: 'ethereum', label: 'Ethereum', icon: Flame },
  { id: 'altcoins', label: 'Altcoins', icon: Flame },
  { id: 'defi', label: 'DeFi', icon: Flame },
  { id: 'nft', label: 'NFT', icon: Flame },
  { id: 'regulation', label: 'Regulação', icon: Flame },
  { id: 'market', label: 'Mercado', icon: Flame },
];

const categoryColors: Record<News['category'], string> = {
  bitcoin: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  ethereum: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
  altcoins: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  defi: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  nft: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
  regulation: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  market: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
};

export function NewsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = newsData.filter((n) => {
    const matchCat = activeCategory === 'all' || n.category === activeCategory;
    const matchSearch = !searchQuery ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const trending = newsData.filter((n) => n.trending).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Newspaper className="w-8 h-8 text-indigo-400" />
          Notícias do Mercado Cripto
        </h1>
        <p className="text-slate-400">Últimas notícias de CoinMarketCap, CoinGecko, Binance e mais</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar notícias..."
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.id
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main feed */}
        <div className="lg:col-span-2 space-y-4">
          {filtered.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center">
              <Newspaper className="w-12 h-12 mx-auto mb-3 text-slate-700" />
              <p className="text-slate-400">Nenhuma notícia encontrada</p>
            </div>
          ) : (
            filtered.map((news) => (
              <article
                key={news.id}
                className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-indigo-500/50 transition-colors group"
              >
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center text-3xl shrink-0">
                    {news.image}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryColors[news.category]}`}>
                        {categories.find((c) => c.id === news.category)?.label}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(news.publishedAt)}
                      </span>
                      {news.trending && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          Trending
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-indigo-400 transition-colors">
                      {news.title}
                    </h3>
                    <p className="text-sm text-slate-400 mb-3">{news.summary}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{news.source} • {news.readTime} min leitura</span>
                      <a
                        href={news.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        Ler mais <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Trending sidebar */}
        <div className="space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-400" />
              Em Alta
            </h3>
            <div className="space-y-4">
              {trending.map((news, i) => (
                <div key={news.id} className="flex gap-3">
                  <div className="text-2xl font-bold text-slate-700 shrink-0">{String(i + 1).padStart(2, '0')}</div>
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1 line-clamp-2">{news.title}</h4>
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span>{news.source}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(news.publishedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-2">📬 Newsletter Diária</h3>
            <p className="text-sm text-slate-400 mb-4">
              Receba as principais notícias do mercado cripto no seu email.
            </p>
            <input
              type="email"
              placeholder="seu@email.com"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-indigo-500 text-slate-100"
            />
            <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium py-2 rounded-lg">
              Inscrever-se
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 60) return `${minutes}m atrás`;
  if (hours < 24) return `${hours}h atrás`;
  return `${days}d atrás`;
}
