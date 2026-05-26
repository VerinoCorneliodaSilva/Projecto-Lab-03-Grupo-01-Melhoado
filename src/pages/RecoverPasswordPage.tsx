import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNotification } from '../context/NotificationContext';
import { changePasswordUser } from '../services/authApi';

export function RecoverPasswordPage() {
  const { user, isLoading: isAuthLoading, logout } = useAuth();
  const { t } = useLanguage();
  const notify = useNotification();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setEmail('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      notify.error(t('common.error'), 'Informe o email da sua conta.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      notify.error(t('common.error'), t('auth.passwordMismatch'));
      return;
    }

    setIsLoading(true);

    try {
      const result = await changePasswordUser({
        email,
        newPassword,
      });

      if (result.success) {
        notify.success(t('auth.passwordUpdatedTitle'), t('auth.passwordUpdatedDesc'));
        await logout();
        navigate('/auth');
        return;
      }

      notify.error(t('common.error'), result.error || t('auth.passwordUpdateError'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-[60vh] px-4 py-12">
        <div className="mx-auto max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/70 px-6 py-8 text-center text-slate-200">
          Validando sessão segura...
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 md:p-8">
          <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">{t('auth.recoveryTitle')}</p>
          <h1 className="mt-3 text-3xl font-bold text-white">Redefinir senha</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Você já está autenticado. Use este formulário para definir sua nova senha com segurança.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/settings"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-500"
            >
              Voltar para configurações
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Link
          to="/settings"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('settings.title')}
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm mb-4">
          <ShieldCheck className="w-4 h-4" />
          {t('auth.recoveryTitle')}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{t('auth.recoveryTitle')}</h1>
        <p className="text-slate-400">{t('auth.recoveryDescription')}</p>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('auth.email')}</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                placeholder={t('auth.emailPlaceholder')}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('auth.newPassword')}</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                minLength={8}
                autoComplete="off"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-10 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                placeholder={t('auth.newPasswordPlaceholder')}
                title={t('auth.passwordHint')}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('auth.confirmNewPassword')}</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type={showConfirmNewPassword ? 'text' : 'password'}
                required
                minLength={8}
                autoComplete="off"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-10 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                placeholder={t('auth.confirmNewPasswordPlaceholder')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-slate-300">
            {t('auth.passwordHint')}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t('auth.processing') : 'Criar nova senha'}
          </button>
        </form>
      </div>
    </div>
  );
}
