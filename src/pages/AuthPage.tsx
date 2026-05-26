import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, TrendingUp, DollarSign, BarChart3, Shield } from 'lucide-react';

type Mode = 'login' | 'register';

export function AuthPage() {
  const { login, register, user } = useAuth();
  const notify = useNotification();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (user) {
    return <Navigate to="/portfolio" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const nextPath = searchParams.get('next') || '/portfolio';

      if (mode === 'login') {
        const result = await login(email, password);

        if (result.success) {
          notify.success(t('auth.welcome'), t('auth.loginSuccess'));
          window.location.assign(nextPath);
        } else {
          notify.error(t('common.error'), result.error || t('auth.loginError'));
        }

        return;
      }

      if (password !== confirmPassword) {
        notify.error(t('common.error'), t('auth.passwordMismatch'));
        return;
      }

      const result = await register(name, email, password);

      if (result.success) {
        notify.success(t('auth.accountCreated'), t('auth.accountCreatedDesc'));
        window.location.assign(nextPath);
      } else {
        notify.error(t('common.error'), result.error || t('auth.registrationError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:block">
          <div className="inline-block px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-full text-indigo-400 text-sm font-medium mb-6">
            {t('auth.badge')}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {mode === 'login' ? 'Bem-vindo a Crypto Nova!' : t('auth.createAccount')}
          </h1>
          <p className="text-slate-400 text-lg mb-8">
            {t('auth.subtitle')}
          </p>

          {mode === 'login' && (
            <div className="mb-8 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-50">
              <div className="flex items-start gap-3">
                <span className="text-lg leading-none" aria-hidden="true">🎁</span>
                <div>
                  <p className="font-semibold">🎉 {t('auth.bonus')} 🎁</p>
                  <p className="mt-1 text-emerald-100/90">Comece com saldo virtual e explore o mercado sem riscos.</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <Feature icon={<DollarSign className="w-5 h-5" />} title={t('auth.featureTradeTitle')} desc={t('auth.featureTradeDesc')} />
            <Feature icon={<BarChart3 className="w-5 h-5" />} title={t('auth.featureDataTitle')} desc={t('auth.featureDataDesc')} />
            <Feature icon={<Shield className="w-5 h-5" />} title={t('auth.featureSecurityTitle')} desc={t('auth.featureSecurityDesc')} />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              CryptoNova
            </span>
          </div>

          <div className="flex gap-1 bg-slate-800 p-1 rounded-lg mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'login' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('auth.login')}
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'register' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('auth.register')}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('auth.name')}</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                    placeholder={t('auth.namePlaceholder')}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                  placeholder={t('auth.emailPlaceholder')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('auth.password')}</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-10 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                  placeholder={t('auth.passwordPlaceholder')}
                  title={t('auth.passwordHint')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('auth.confirmPassword')}</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                    placeholder={t('auth.passwordPlaceholder')}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t('auth.processing') : mode === 'login' ? t('auth.login') : t('auth.register')}
            </button>

            <p className="text-center text-sm text-slate-400 pt-2">
              {mode === 'login' ? (
                <>
                  {t('auth.noAccount')}{' '}
                  <button type="button" onClick={() => setMode('register')} className="text-indigo-400 hover:text-indigo-300">
                    {t('auth.register')}
                  </button>
                </>
              ) : (
                <>
                  {t('auth.hasAccount')}{' '}
                  <button type="button" onClick={() => setMode('login')} className="text-indigo-400 hover:text-indigo-300">
                    {t('auth.login')}
                  </button>
                </>
              )}
            </p>

            {mode === 'login' && (
              <p className="text-center text-sm">
                <Link to="/recover-password" className="text-indigo-400 hover:text-indigo-300">
                  {t('auth.forgotPassword')}
                </Link>
              </p>
            )}

            {mode === 'register' && (
              <div className="bg-gradient-to-r from-slate-500/10 to-indigo-500/10 border border-slate-500/30 rounded-lg p-3 text-xs text-slate-300">
                🔐 <strong className="text-indigo-400">{t('auth.realAuth')}</strong> {t('auth.realAuthDesc')}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-white font-medium mb-1">{title}</h3>
        <p className="text-slate-400 text-sm">{desc}</p>
      </div>
    </div>
  );
}
