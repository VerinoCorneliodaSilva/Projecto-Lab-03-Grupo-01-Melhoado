import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { Search, Menu, X, TrendingUp, Star, ArrowLeftRight, LayoutGrid, Sun, Moon, LogOut, Settings, Wallet, ChevronDown, Flame, Newspaper, Bell, Calculator, Fish, Calendar, GitCompareArrows } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage, Language } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { cryptos } from '../data/cryptoData';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const { user, logout } = useAuth();
  const { format } = useCurrency();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark';

  const filtered = searchQuery.length > 0
    ? cryptos.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  // Fechar menus ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { to: '/', label: t('nav.market'), icon: LayoutGrid },
    { to: '/heatmap', label: t('nav.heatmap'), icon: Flame },
    { to: '/trending', label: t('nav.trending'), icon: TrendingUp },
    { to: '/news', label: t('nav.news'), icon: Newspaper },
    ...(user ? [
      { to: '/portfolio', label: t('nav.portfolio'), icon: Wallet },
      { to: '/alerts', label: t('nav.alerts'), icon: Bell },
    ] : []),
  ];

  const moreItems = [
    { to: '/converter', label: t('nav.converter'), icon: ArrowLeftRight },
    { to: '/compare', label: t('nav.compare'), icon: GitCompareArrows },
    { to: '/simulator', label: t('nav.simulator'), icon: Calculator },
    { to: '/whales', label: t('nav.whales'), icon: Fish },
    { to: '/calendar', label: t('nav.calendar'), icon: Calendar },
    { to: '/watchlist', label: t('nav.watchlist'), icon: Star },
  ];

  const languageFlags: Record<Language, string> = {
    'pt-BR': '🇧🇷',
    'en-US': '🇺🇸',
    'es-ES': '🇪🇸',
  };

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b ${isDark ? 'bg-slate-950/95 border-slate-800' : 'bg-white/95 border-slate-200'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 17l6-6 4 4 8-8" />
                <path d="M14 7h7v7" />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent hidden sm:inline">
              CryptoNova
            </span>
          </Link>

          {/* Nav - Desktop */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? isDark ? 'bg-slate-800 text-white' : 'bg-indigo-50 text-indigo-600'
                      : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/60' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="text"
                placeholder={t('common.search')}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                className={`rounded-lg pl-9 pr-3 py-2 text-sm w-40 lg:w-56 focus:outline-none focus:border-indigo-500 border ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
              {searchOpen && filtered.length > 0 && (
                <div className={`absolute top-full mt-1 right-0 w-72 border rounded-lg shadow-xl overflow-hidden ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  {filtered.map((c) => (
                    <button
                      key={c.id}
                      onMouseDown={() => { navigate(`/coin/${c.id}`); setSearchQuery(''); }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-left ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
                    >
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: c.color }}>
                        {c.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm truncate ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{c.name}</div>
                        <div className="text-xs text-slate-500 uppercase">{c.symbol}</div>
                      </div>
                      <div className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {format(c.price, { maxDecimals: c.price < 1 ? 4 : 2 })}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language selector */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className={`p-2 rounded-lg transition-colors flex items-center gap-1 ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                aria-label="Language"
              >
                <span className="text-base">{languageFlags[lang]}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {langMenuOpen && (
                <div className={`absolute top-full mt-1 right-0 w-40 border rounded-lg shadow-xl overflow-hidden ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  {(Object.keys(languageFlags) as Language[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => { setLang(l); setLangMenuOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm ${
                        lang === l 
                          ? isDark ? 'bg-slate-800 text-white' : 'bg-indigo-50 text-indigo-600'
                          : isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{languageFlags[l]}</span>
                      <span>{l === 'pt-BR' ? 'Português' : l === 'en-US' ? 'English' : 'Español'}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className={`text-xs font-medium ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{user.name.split(' ')[0]}</div>
                    <div className="text-xs text-emerald-500 font-medium">{format(user.balance, { compact: true })}</div>
                  </div>
                  <ChevronDown className={`w-3 h-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                </button>
                {userMenuOpen && (
                  <div className={`absolute top-full mt-1 right-0 w-56 border rounded-lg shadow-xl overflow-hidden ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <div className={`px-4 py-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                      <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{user.name}</div>
                      <div className="text-xs text-slate-500 truncate">{user.email}</div>
                    </div>
                    <div className="py-1">
                      <MenuItem to="/portfolio" icon={<Wallet className="w-4 h-4" />} label={t('nav.portfolio')} onClick={() => setUserMenuOpen(false)} isDark={isDark} />
                      <MenuItem to="/watchlist" icon={<Star className="w-4 h-4" />} label={t('nav.watchlist')} onClick={() => setUserMenuOpen(false)} isDark={isDark} />
                      <MenuItem to="/settings" icon={<Settings className="w-4 h-4" />} label={t('settings.title')} onClick={() => setUserMenuOpen(false)} isDark={isDark} />
                    </div>
                    <div className={`py-1 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); navigate('/'); }}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 ${isDark ? '' : 'hover:bg-red-50'}`}
                      >
                        <LogOut className="w-4 h-4" />
                        {t('nav.logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="hidden md:inline-flex bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-sm px-4 py-2 rounded-lg"
              >
                {t('nav.login')}
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`xl:hidden p-2 ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <nav className={`xl:hidden pb-4 flex flex-col gap-1 border-t pt-3 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className={`text-xs font-semibold uppercase text-slate-500 px-3 py-1 ${isDark ? '' : ''}`}>{t('nav.principal')}</div>
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                  isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
            <div className={`text-xs font-semibold uppercase text-slate-500 px-3 py-1 mt-2`}>{t('nav.moreTools')}</div>
            {moreItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                  isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
            {!user && (
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-sm px-4 py-2 rounded-lg mt-2"
              >
                {t('nav.login')} / {t('nav.register')}
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}

function MenuItem({ to, icon, label, onClick, isDark }: { to: string; icon: React.ReactNode; label: string; onClick: () => void; isDark: boolean }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
        isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
