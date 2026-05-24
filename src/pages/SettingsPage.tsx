import { useTheme } from '../context/ThemeContext';
import { useLanguage, Language } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { currencies, CurrencyCode } from '../data/cryptoData';
import { Settings as SettingsIcon, Sun, Moon, Globe, DollarSign, User, Shield, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { useState } from 'react';

const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
];

export function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const [saved, setSaved] = useState(false);

  if (!user) return <Navigate to="/auth" replace />;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-indigo-400" />
          {t('settings.title')}
        </h1>
        <p className="text-slate-400">Personalize sua experiência no CryptoNova</p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <SettingsSection title="Perfil" icon={<User className="w-5 h-5" />}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-white font-medium">{user.name}</div>
              <div className="text-slate-400 text-sm">{user.email}</div>
              <div className="text-xs text-slate-500 mt-1">
                Membro desde {new Date(user.createdAt).toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Theme */}
        <SettingsSection title={t('settings.theme')} icon={theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border-2 transition-all ${
                theme === 'dark'
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
              }`}
            >
              <Moon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <div className="text-sm font-medium text-white">{t('settings.dark')}</div>
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border-2 transition-all ${
                theme === 'light'
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
              }`}
            >
              <Sun className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <div className="text-sm font-medium text-white">{t('settings.light')}</div>
            </button>
          </div>
        </SettingsSection>

        {/* Language */}
        <SettingsSection title={t('settings.language')} icon={<Globe className="w-5 h-5" />}>
          <div className="grid grid-cols-3 gap-3">
            {languages.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  lang === l.code
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                }`}
              >
                <div className="text-2xl mb-1">{l.flag}</div>
                <div className="text-sm font-medium text-white">{l.name}</div>
              </button>
            ))}
          </div>
        </SettingsSection>

        {/* Currency */}
        <SettingsSection title={t('settings.currency')} icon={<DollarSign className="w-5 h-5" />}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(Object.keys(currencies) as CurrencyCode[]).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  currency === c
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                }`}
              >
                <div className="text-2xl font-bold text-white mb-1">{currencies[c].symbol}</div>
                <div className="text-xs text-slate-400">{c}</div>
              </button>
            ))}
          </div>
        </SettingsSection>

        {/* Security (placeholder) */}
        <SettingsSection title="Segurança" icon={<Shield className="w-5 h-5" />}>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-white">Autenticação de 2 Fatores</div>
                <div className="text-xs text-slate-400">Adicione uma camada extra de segurança</div>
              </div>
              <button className="text-xs bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg">
                Ativar
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <div>
                <div className="text-sm font-medium text-white">Alterar Senha</div>
                <div className="text-xs text-slate-400">Última alteração: há 30 dias</div>
              </div>
              <button className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg">
                Alterar
              </button>
            </div>
          </div>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Notificações" icon={<Bell className="w-5 h-5" />}>
          <div className="space-y-3">
            <ToggleOption label="Alertas de Preço" desc="Receba notificações quando preços atingirem certos limites" defaultChecked />
            <ToggleOption label="Alertas de Transação" desc="Notifique-me sobre transações da conta" defaultChecked />
            <ToggleOption label="Novidades e Atualizações" desc="Receba notícias sobre novos recursos" />
          </div>
        </SettingsSection>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium px-6 py-2.5 rounded-lg transition-all"
          >
            {saved ? '✓ Salvo!' : t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
        <div className="text-indigo-400">{icon}</div>
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function ToggleOption({ label, desc, defaultChecked }: { label: string; desc: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked || false);
  return (
    <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
      <div>
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="text-xs text-slate-400">{desc}</div>
      </div>
      <button
        onClick={() => setChecked(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-indigo-500' : 'bg-slate-700'}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}
