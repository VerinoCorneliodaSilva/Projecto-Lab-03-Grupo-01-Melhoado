import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

export type Language = 'pt-BR' | 'en-US' | 'es-ES';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const translations: Record<Language, Record<string, string>> = {
  'pt-BR': {
    // Header
    'nav.market': 'Mercado',
    'nav.trending': 'Tendências',
    'nav.converter': 'Conversor',
    'nav.watchlist': 'Watchlist',
    'nav.portfolio': 'Portfólio',
    'nav.login': 'Entrar',
    'nav.register': 'Cadastrar',
    'nav.logout': 'Sair',
    'nav.profile': 'Perfil',
    
    // Home
    'home.title': 'Hoje no Mercado de Criptoativos',
    'home.subtitle': 'Preços por capitalização de mercado',
    'home.live': 'Atualização ao vivo',
    'home.marketCap': 'Capitalização de Mercado',
    'home.volume24h': 'Volume (24h)',
    'home.btcDominance': 'Dominância BTC',
    'home.ethDominance': 'Dominância ETH',
    'home.activeCryptos': 'Criptomoedas Ativas',
    'home.gainers': 'Maiores Altas (24h)',
    'home.losers': 'Maiores Baixas (24h)',
    
    // Table
    'table.rank': '#',
    'table.name': 'Nome',
    'table.price': 'Preço',
    'table.change1h': '1h %',
    'table.change24h': '24h %',
    'table.change7d': '7d %',
    'table.marketCap': 'Market Cap',
    'table.volume': 'Volume (24h)',
    'table.last7d': 'Últimos 7 dias',
    
    // Filters
    'filter.all': 'Todos',
    'filter.gainers': 'Altas',
    'filter.losers': 'Baixas',
    'filter.new': 'Recentes',
    'filter.show': 'Mostrar',
    
    // Auth
    'auth.login': 'Entrar',
    'auth.register': 'Cadastrar',
    'auth.email': 'Email',
    'auth.password': 'Senha',
    'auth.name': 'Nome',
    'auth.confirmPassword': 'Confirmar Senha',
    'auth.forgotPassword': 'Esqueceu a senha?',
    'auth.noAccount': 'Não tem uma conta?',
    'auth.hasAccount': 'Já tem uma conta?',
    'auth.welcome': 'Bem-vindo de volta!',
    'auth.createAccount': 'Crie sua conta',
    'auth.bonus': 'Ganhe $10.000 de bônus para começar a negociar!',
    'auth.userNotFound': 'Usuário não encontrado',
    'auth.wrongPassword': 'Senha incorreta',
    'auth.emailExists': 'Email já cadastrado',
    
    // Portfolio
    'portfolio.title': 'Meu Portfólio',
    'portfolio.balance': 'Saldo Disponível',
    'portfolio.totalValue': 'Valor Total',
    'portfolio.holdings': 'Posições',
    'portfolio.transactions': 'Transações',
    'portfolio.buy': 'Comprar',
    'portfolio.sell': 'Vender',
    'portfolio.amount': 'Quantidade',
    'portfolio.total': 'Total',
    'portfolio.profit': 'Lucro/Prejuízo',
    'portfolio.noHoldings': 'Você ainda não possui nenhuma criptomoeda',
    'portfolio.startTrading': 'Comece a negociar agora',
    'portfolio.buySuccess': 'Compra realizada com sucesso!',
    'portfolio.sellSuccess': 'Venda realizada com sucesso!',
    'portfolio.insufficientBalance': 'Saldo insuficiente',
    'portfolio.insufficientHoldings': 'Você não possui quantidade suficiente',
    
    // Trade
    'trade.buy': 'Comprar',
    'trade.sell': 'Vender',
    'trade.amount': 'Quantidade',
    'trade.price': 'Preço',
    'trade.total': 'Total',
    'trade.fee': 'Taxa (0.1%)',
    'trade.youPay': 'Você paga',
    'trade.youReceive': 'Você recebe',
    'trade.confirm': 'Confirmar',
    'trade.cancel': 'Cancelar',
    'trade.available': 'Disponível',
    
    // Common
    'common.search': 'Buscar...',
    'common.loading': 'Carregando...',
    'common.error': 'Erro',
    'common.success': 'Sucesso',
    'common.close': 'Fechar',
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'common.back': 'Voltar',
    'common.next': 'Próximo',
    'common.edit': 'Editar',
    'common.delete': 'Excluir',
    
    // Settings
    'settings.title': 'Configurações',
    'settings.theme': 'Tema',
    'settings.language': 'Idioma',
    'settings.currency': 'Moeda',
    'settings.dark': 'Escuro',
    'settings.light': 'Claro',
  },
  'en-US': {
    // Header
    'nav.market': 'Market',
    'nav.trending': 'Trending',
    'nav.converter': 'Converter',
    'nav.watchlist': 'Watchlist',
    'nav.portfolio': 'Portfolio',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    'nav.profile': 'Profile',
    
    // Home
    'home.title': 'Today\'s Cryptocurrency Market',
    'home.subtitle': 'Prices by market capitalization',
    'home.live': 'Live updates',
    'home.marketCap': 'Market Cap',
    'home.volume24h': 'Volume (24h)',
    'home.btcDominance': 'BTC Dominance',
    'home.ethDominance': 'ETH Dominance',
    'home.activeCryptos': 'Active Cryptocurrencies',
    'home.gainers': 'Top Gainers (24h)',
    'home.losers': 'Top Losers (24h)',
    
    // Table
    'table.rank': '#',
    'table.name': 'Name',
    'table.price': 'Price',
    'table.change1h': '1h %',
    'table.change24h': '24h %',
    'table.change7d': '7d %',
    'table.marketCap': 'Market Cap',
    'table.volume': 'Volume (24h)',
    'table.last7d': 'Last 7 days',
    
    // Filters
    'filter.all': 'All',
    'filter.gainers': 'Gainers',
    'filter.losers': 'Losers',
    'filter.new': 'New',
    'filter.show': 'Show',
    
    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Name',
    'auth.confirmPassword': 'Confirm Password',
    'auth.forgotPassword': 'Forgot password?',
    'auth.noAccount': 'Don\'t have an account?',
    'auth.hasAccount': 'Already have an account?',
    'auth.welcome': 'Welcome back!',
    'auth.createAccount': 'Create your account',
    'auth.bonus': 'Get $10,000 bonus to start trading!',
    'auth.userNotFound': 'User not found',
    'auth.wrongPassword': 'Wrong password',
    'auth.emailExists': 'Email already registered',
    
    // Portfolio
    'portfolio.title': 'My Portfolio',
    'portfolio.balance': 'Available Balance',
    'portfolio.totalValue': 'Total Value',
    'portfolio.holdings': 'Holdings',
    'portfolio.transactions': 'Transactions',
    'portfolio.buy': 'Buy',
    'portfolio.sell': 'Sell',
    'portfolio.amount': 'Amount',
    'portfolio.total': 'Total',
    'portfolio.profit': 'Profit/Loss',
    'portfolio.noHoldings': 'You don\'t own any cryptocurrency yet',
    'portfolio.startTrading': 'Start trading now',
    'portfolio.buySuccess': 'Purchase completed successfully!',
    'portfolio.sellSuccess': 'Sale completed successfully!',
    'portfolio.insufficientBalance': 'Insufficient balance',
    'portfolio.insufficientHoldings': 'You don\'t have enough holdings',
    
    // Trade
    'trade.buy': 'Buy',
    'trade.sell': 'Sell',
    'trade.amount': 'Amount',
    'trade.price': 'Price',
    'trade.total': 'Total',
    'trade.fee': 'Fee (0.1%)',
    'trade.youPay': 'You pay',
    'trade.youReceive': 'You receive',
    'trade.confirm': 'Confirm',
    'trade.cancel': 'Cancel',
    'trade.available': 'Available',
    
    // Common
    'common.search': 'Search...',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.close': 'Close',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    
    // Settings
    'settings.title': 'Settings',
    'settings.theme': 'Theme',
    'settings.language': 'Language',
    'settings.currency': 'Currency',
    'settings.dark': 'Dark',
    'settings.light': 'Light',
  },
  'es-ES': {
    // Header
    'nav.market': 'Mercado',
    'nav.trending': 'Tendencias',
    'nav.converter': 'Convertidor',
    'nav.watchlist': 'Lista de Seguimiento',
    'nav.portfolio': 'Portafolio',
    'nav.login': 'Iniciar Sesión',
    'nav.register': 'Registrarse',
    'nav.logout': 'Cerrar Sesión',
    'nav.profile': 'Perfil',
    
    // Home
    'home.title': 'Mercado de Criptomonedas de Hoy',
    'home.subtitle': 'Precios por capitalización de mercado',
    'home.live': 'Actualización en vivo',
    'home.marketCap': 'Capitalización de Mercado',
    'home.volume24h': 'Volumen (24h)',
    'home.btcDominance': 'Dominancia BTC',
    'home.ethDominance': 'Dominancia ETH',
    'home.activeCryptos': 'Criptomonedas Activas',
    'home.gainers': 'Mayores Alzas (24h)',
    'home.losers': 'Mayores Bajas (24h)',
    
    // Table
    'table.rank': '#',
    'table.name': 'Nombre',
    'table.price': 'Precio',
    'table.change1h': '1h %',
    'table.change24h': '24h %',
    'table.change7d': '7d %',
    'table.marketCap': 'Cap. Mercado',
    'table.volume': 'Volumen (24h)',
    'table.last7d': 'Últimos 7 días',
    
    // Filters
    'filter.all': 'Todos',
    'filter.gainers': 'Alzas',
    'filter.losers': 'Bajas',
    'filter.new': 'Nuevos',
    'filter.show': 'Mostrar',
    
    // Auth
    'auth.login': 'Iniciar Sesión',
    'auth.register': 'Registrarse',
    'auth.email': 'Correo',
    'auth.password': 'Contraseña',
    'auth.name': 'Nombre',
    'auth.confirmPassword': 'Confirmar Contraseña',
    'auth.forgotPassword': '¿Olvidaste tu contraseña?',
    'auth.noAccount': '¿No tienes una cuenta?',
    'auth.hasAccount': '¿Ya tienes una cuenta?',
    'auth.welcome': '¡Bienvenido de vuelta!',
    'auth.createAccount': 'Crea tu cuenta',
    'auth.bonus': '¡Obtén $10,000 de bono para comenzar a operar!',
    'auth.userNotFound': 'Usuario no encontrado',
    'auth.wrongPassword': 'Contraseña incorrecta',
    'auth.emailExists': 'Correo ya registrado',
    
    // Portfolio
    'portfolio.title': 'Mi Portafolio',
    'portfolio.balance': 'Saldo Disponible',
    'portfolio.totalValue': 'Valor Total',
    'portfolio.holdings': 'Posiciones',
    'portfolio.transactions': 'Transacciones',
    'portfolio.buy': 'Comprar',
    'portfolio.sell': 'Vender',
    'portfolio.amount': 'Cantidad',
    'portfolio.total': 'Total',
    'portfolio.profit': 'Ganancia/Pérdida',
    'portfolio.noHoldings': 'Aún no posees ninguna criptomoneda',
    'portfolio.startTrading': 'Comienza a operar ahora',
    'portfolio.buySuccess': '¡Compra realizada con éxito!',
    'portfolio.sellSuccess': '¡Venta realizada con éxito!',
    'portfolio.insufficientBalance': 'Saldo insuficiente',
    'portfolio.insufficientHoldings': 'No tienes suficientes posiciones',
    
    // Trade
    'trade.buy': 'Comprar',
    'trade.sell': 'Vender',
    'trade.amount': 'Cantidad',
    'trade.price': 'Precio',
    'trade.total': 'Total',
    'trade.fee': 'Comisión (0.1%)',
    'trade.youPay': 'Tú pagas',
    'trade.youReceive': 'Tú recibes',
    'trade.confirm': 'Confirmar',
    'trade.cancel': 'Cancelar',
    'trade.available': 'Disponible',
    
    // Common
    'common.search': 'Buscar...',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.close': 'Cerrar',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'common.back': 'Volver',
    'common.next': 'Siguiente',
    'common.edit': 'Editar',
    'common.delete': 'Eliminar',
    
    // Settings
    'settings.title': 'Configuración',
    'settings.theme': 'Tema',
    'settings.language': 'Idioma',
    'settings.currency': 'Moneda',
    'settings.dark': 'Oscuro',
    'settings.light': 'Claro',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const stored = localStorage.getItem('cn_language');
    if (stored && stored in translations) return stored as Language;
    return 'pt-BR';
  });

  useEffect(() => {
    localStorage.setItem('cn_language', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Language) => setLangState(l);

  const t = (key: string): string => {
    return (translations[lang] as Record<string, string>)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
