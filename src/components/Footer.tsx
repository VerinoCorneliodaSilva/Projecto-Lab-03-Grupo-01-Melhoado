import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 17l6-6 4 4 8-8" />
                <path d="M14 7h7v7" />
              </svg>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              CryptoNova
            </span>
          </Link>
          <p className="text-sm text-slate-400">
            A plataforma profissional completa para acompanhar o mercado de criptomoedas.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Produtos</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/" className="hover:text-white">Mercado</Link></li>
            <li><Link to="/heatmap" className="hover:text-white">Heatmap</Link></li>
            <li><Link to="/converter" className="hover:text-white">Conversor</Link></li>
            <li><Link to="/compare" className="hover:text-white">Comparador</Link></li>
            <li><Link to="/simulator" className="hover:text-white">Simulador</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Trading</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/portfolio" className="hover:text-white">Portfólio</Link></li>
            <li><Link to="/watchlist" className="hover:text-white">Watchlist</Link></li>
            <li><Link to="/alerts" className="hover:text-white">Alertas</Link></li>
            <li><Link to="/trending" className="hover:text-white">Tendências</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Análises</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/whales" className="hover:text-white">Whales</Link></li>
            <li><Link to="/news" className="hover:text-white">Notícias</Link></li>
            <li><Link to="/calendar" className="hover:text-white">Calendário</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Legal</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><a href="#" className="hover:text-white">Termos de Uso</a></li>
            <li><a href="#" className="hover:text-white">Privacidade</a></li>
            <li><a href="#" className="hover:text-white">Cookies</a></li>
            <li><Link to="/admin" className="hover:text-white">Admin</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© 2026 CryptoNova. Todos os direitos reservados. Dados simulados para fins de demonstração.</p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Mercado ativo • Preços ao vivo
          </p>
        </div>
      </div>
    </footer>
  );
}
