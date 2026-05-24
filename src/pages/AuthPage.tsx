import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, TrendingUp, DollarSign, BarChart3, Shield } from 'lucide-react';

type Mode = 'login' | 'register';

export function AuthPage() {
  const { login, register, user } = useAuth();
  const notify = useNotification();
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
      if (mode === 'login') {
        const result = await login(email, password);

        if (result.success) {
          notify.success('Bem-vindo de volta!', 'Sessão validada com segurança no backend PHP.');
          window.location.href = '/portfolio';
        } else {
          notify.error('Erro no login', result.error || 'Não foi possível autenticar.');
        }

        return;
      }

      if (password !== confirmPassword) {
        notify.error('Erro', 'As senhas não coincidem');
        return;
      }

      const result = await register(name, email, password);

      if (result.success) {
        notify.success('Conta criada! 🎉', 'Seu acesso foi configurado no backend PHP e o token JWT foi salvo na sessão atual.');
        window.location.href = '/portfolio';
      } else {
        notify.error('Erro no cadastro', result.error || 'Não foi possível concluir o cadastro.');
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
            Autenticação real com PHP + MySQL
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {mode === 'login' ? 'Bem-vindo de volta!' : 'Crie sua conta'}
          </h1>
          <p className="text-slate-400 text-lg mb-8">
            Entre ou cadastre-se com um fluxo seguro, validado no backend e protegido por JWT.
          </p>

          <div className="space-y-4">
            <Feature icon={<DollarSign className="w-5 h-5" />} title="Trade com Facilidade" desc="Compre e venda criptomoedas com taxas baixas (0.1%)" />
            <Feature icon={<BarChart3 className="w-5 h-5" />} title="Dados Persistentes" desc="Usuário salvo em MySQL com sessão validada pelo backend" />
            <Feature icon={<Shield className="w-5 h-5" />} title="Segurança Total" desc="JWT, hash de senha e validação server-side" />
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
              Entrar
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === 'register' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Nome</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                    placeholder="Seu nome"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-10 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                  placeholder="••••••••"
                  title="Use pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo."
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
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirmar Senha</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processando...' : mode === 'login' ? 'Entrar' : 'Cadastrar'}
            </button>

            <p className="text-center text-sm text-slate-400 pt-2">
              {mode === 'login' ? (
                <>
                  Não tem uma conta?{' '}
                  <button type="button" onClick={() => setMode('register')} className="text-indigo-400 hover:text-indigo-300">
                    Cadastre-se
                  </button>
                </>
              ) : (
                <>
                  Já tem uma conta?{' '}
                  <button type="button" onClick={() => setMode('login')} className="text-indigo-400 hover:text-indigo-300">
                    Entrar
                  </button>
                </>
              )}
            </p>

            {mode === 'register' && (
              <div className="bg-gradient-to-r from-slate-500/10 to-indigo-500/10 border border-slate-500/30 rounded-lg p-3 text-xs text-slate-300">
                🔐 <strong className="text-indigo-400">Autenticação real</strong> com PHP + MySQL.
                <br />
                <span className="text-slate-400">JWT, hash seguro de senha e validação no servidor.</span>
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
