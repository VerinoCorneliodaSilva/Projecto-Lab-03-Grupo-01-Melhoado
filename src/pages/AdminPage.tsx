import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Users, Activity, AlertCircle, CheckCircle2, Clock, TrendingUp, Database, RefreshCw } from 'lucide-react';
import { adminApi } from '../services/api';
import { UserRecord, LogRecord } from '../services/database';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';

export function AdminPage() {
  const { user } = useAuth();
  const notify = useNotification();
  const { t, formatDateTime } = useLanguage();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'logs'>('dashboard');
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  if (!user) return <Navigate to="/auth" replace />;

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, logsRes, statsRes] = await Promise.all([
        adminApi.getAllUsers(),
        adminApi.getLogs(),
        adminApi.getStats(),
      ]);
      if (usersRes.success) setUsers(usersRes.data || []);
      if (logsRes.success) setLogs(logsRes.data || []);
      if (statsRes.success) setStats(statsRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleUser = async (userId: string) => {
    const result = await adminApi.toggleUserStatus(userId);
    if (result.success) {
      notify.success(t('admin.userUpdated'));
      await loadData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Shield className="w-8 h-8 text-indigo-400" />
          {t('admin.title')}
        </h1>
        <p className="text-slate-400">{t('admin.subtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900/60 border border-slate-800 p-1 rounded-lg mb-6 w-fit">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'dashboard' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          {t('admin.dashboard')}
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'users' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          {t('admin.users')}
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'logs' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          {t('admin.logs')}
        </button>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={loadData}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white px-3 py-1.5 bg-slate-800 rounded-lg"
            >
              <RefreshCw className="w-4 h-4" />
              {t('admin.refresh')}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<Users className="w-5 h-5 text-indigo-400" />} label={t('admin.totalUsers')} value={stats?.totalUsers || 0} />
            <StatCard icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />} label={t('admin.activeUsers')} value={stats?.activeUsers || 0} />
            <StatCard icon={<TrendingUp className="w-5 h-5 text-purple-400" />} label={t('admin.totalTransactions')} value={stats?.totalTransactions || 0} />
            <StatCard icon={<Database className="w-5 h-5 text-orange-400" />} label={t('admin.totalVolume')} value={`$${((stats?.totalVolume || 0) / 1000).toFixed(1)}k`} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                {t('admin.systemStatus')}
              </h3>
              <div className="space-y-3">
                <StatusRow label="API Principal" status="online" t={t} />
                <StatusRow label="Banco de Dados" status="online" t={t} />
                <StatusRow label="WebSocket" status="online" t={t} />
                <StatusRow label="Serviço de Email" status="online" t={t} />
                <StatusRow label="CDN" status="online" t={t} />
                <StatusRow label="Serviço de Backup" status="warning" t={t} />
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                {t('admin.recentAlerts')}
              </h3>
              <div className="space-y-2">
                <AlertRow severity="warning" message="Uso de CPU acima de 80%" time="5min" />
                <AlertRow severity="info" message="Backup diário concluído" time="2h" />
                <AlertRow severity="error" message="3 tentativas de login falharam" time="4h" />
                <AlertRow severity="info" message="Novo deploy realizado" time="8h" />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs">
                  <th className="text-left py-3 px-4 font-medium">{t('admin.user')}</th>
                  <th className="text-left py-3 px-4 font-medium">{t('admin.email')}</th>
                  <th className="text-right py-3 px-4 font-medium">{t('admin.balance')}</th>
                  <th className="text-center py-3 px-4 font-medium">{t('admin.status')}</th>
                  <th className="text-right py-3 px-4 font-medium">{t('admin.lastLogin')}</th>
                  <th className="text-right py-3 px-4 font-medium">{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="py-8 text-center text-slate-500">{t('admin.loadingUsers')}</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} className="py-8 text-center text-slate-500">{t('admin.noUsers')}</td></tr>
                ) : users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-800/60 hover:bg-slate-900/60">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                          {u.name.charAt(0)}
                        </div>
                        <span className="text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{u.email}</td>
                    <td className="py-3 px-4 text-right text-white">${u.balance.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        u.isActive
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {u.isActive ? `● ${t('admin.online')}` : `● ${t('admin.ban')}`}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 text-xs">
                      {u.lastLogin ? formatDateTime(u.lastLogin) : t('admin.never')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => toggleUser(u.id)}
                        className={`text-xs font-medium ${u.isActive ? 'text-red-400 hover:text-red-300' : 'text-emerald-400 hover:text-emerald-300'}`}
                      >
                        {u.isActive ? t('admin.ban') : t('admin.unban')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-2">
          {loading ? (
            <div className="py-8 text-center text-slate-500">{t('admin.loadingLogs')}</div>
          ) : logs.length === 0 ? (
            <div className="py-8 text-center text-slate-500">{t('admin.noLogs')}</div>
          ) : logs.map((log) => {
            const typeConfig = {
              auth: { icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              trade: { icon: <TrendingUp className="w-4 h-4" />, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
              error: { icon: <AlertCircle className="w-4 h-4" />, color: 'text-red-400', bg: 'bg-red-500/10' },
              security: { icon: <Shield className="w-4 h-4" />, color: 'text-orange-400', bg: 'bg-orange-500/10' },
              system: { icon: <Activity className="w-4 h-4" />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
            };
            const cfg = typeConfig[log.type as keyof typeof typeConfig];
            return (
              <div key={log.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${cfg.bg} ${cfg.color} flex items-center justify-center shrink-0`}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white font-medium text-sm">{log.action}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                      {log.type}
                    </span>
                  </div>
                  {log.details && (
                    <div className="text-xs text-slate-400 mt-1">{log.details}</div>
                  )}
                  <div className="text-xs text-slate-500 mt-0.5 font-mono">
                    ID: {log.id.slice(0, 8)}...
                  </div>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(log.timestamp, t)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

function StatusRow({ label, status, t }: { label: string; status: 'online' | 'warning' | 'offline'; t: (key: string, vars?: Record<string, string | number>) => string }) {
  const colors = {
    online: 'text-emerald-400',
    warning: 'text-yellow-400',
    offline: 'text-red-400',
  };
  const labels = {
    online: t('admin.online'),
    warning: t('admin.warning'),
    offline: t('admin.offline'),
  };
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
      <span className="text-sm text-slate-300">{label}</span>
      <span className={`text-xs flex items-center gap-1 ${colors[status]}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {labels[status]}
      </span>
    </div>
  );
}

function AlertRow({ severity, message, time }: { severity: 'info' | 'warning' | 'error'; message: string; time: string }) {
  const colors = {
    info: 'border-l-blue-500 bg-blue-500/5',
    warning: 'border-l-yellow-500 bg-yellow-500/5',
    error: 'border-l-red-500 bg-red-500/5',
  };
  return (
    <div className={`border-l-2 ${colors[severity]} rounded-r-lg p-2 text-sm`}>
      <div className="text-slate-300">{message}</div>
      <div className="text-xs text-slate-500">{time} atrás</div>
    </div>
  );
}

function formatTimeAgo(date: string, t: (key: string, vars?: Record<string, string | number>) => string): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return t('admin.minutesAgo', { minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t('admin.hoursAgo', { hours });
  return t('admin.daysAgo', { days: Math.floor(hours / 24) });
}
