import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CurrencyProvider } from './context/CurrencyContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Home } from './pages/Home';
import { CoinDetail } from './pages/CoinDetail';
import { Converter } from './pages/Converter';
import { Watchlist } from './pages/Watchlist';
import { Trending } from './pages/Trending';
import { AuthPage } from './pages/AuthPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { TradePage } from './pages/TradePage';
import { SettingsPage } from './pages/SettingsPage';
import { RecoverPasswordPage } from './pages/RecoverPasswordPage';
import { HeatmapPage } from './pages/HeatmapPage';
import { NewsPage } from './pages/NewsPage';
import { AlertsPage } from './pages/AlertsPage';
import { ComparePage } from './pages/ComparePage';
import { SimulatorPage } from './pages/SimulatorPage';
import { WhalesPage } from './pages/WhalesPage';
import { CalendarPage } from './pages/CalendarPage';
import { AdminPage } from './pages/AdminPage';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { useTheme } from './context/ThemeContext';

function AppShell() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-300/20'}`} />
        <div className={`absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] ${isDark ? 'bg-purple-500/10' : 'bg-purple-300/20'}`} />
      </div>

      <Header />
      <main className="flex-1">
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/coin/:id" element={<CoinDetail />} />
            <Route path="/converter" element={<Converter />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/portfolio" element={<ProtectedRoute><PortfolioPage /></ProtectedRoute>} />
            <Route path="/trade/:id" element={<ProtectedRoute><TradePage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/recover-password" element={<RecoverPasswordPage />} />
            <Route path="/heatmap" element={<HeatmapPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/simulator" element={<SimulatorPage />} />
            <Route path="/whales" element={<WhalesPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
          404
        </h1>
        <p className="text-slate-400 mb-6">Página não encontrada</p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg"
        >
          Voltar para Home
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <CurrencyProvider>
          <NotificationProvider>
            <AuthProvider>
              <BrowserRouter>
                <AppShell />
              </BrowserRouter>
            </AuthProvider>
          </NotificationProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
