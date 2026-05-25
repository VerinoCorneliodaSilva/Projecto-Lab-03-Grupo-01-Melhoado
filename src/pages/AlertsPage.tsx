import { useState } from 'react';
import { useAlerts } from '../hooks/useAlerts';
import { cryptos } from '../data/cryptoData';
import { useCurrency } from '../context/CurrencyContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { Bell, Plus, Trash2, CheckCircle2, AlertCircle, BellOff, BellRing } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { AlertRecord } from '../services/database';

export function AlertsPage() {
  const { user } = useAuth();
  const { alerts, addAlert, removeAlert, toggleAlert, isLoading } = useAlerts();
  const { format } = useCurrency();
  const notify = useNotification();
  const { t, formatDateTime } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    cryptoId: 'bitcoin',
    type: 'price_above' as AlertRecord['type'],
    value: '',
  });

  if (!user) return <Navigate to="/auth" replace />;

  const handleAdd = async () => {
    const val = parseFloat(form.value);
    if (!val || val <= 0) {
      notify.error(t('alerts.invalidValue'), t('alerts.enterValidNumber'));
      return;
    }
    const crypto = cryptos.find((c) => c.id === form.cryptoId);
    if (!crypto) return;

    const result = await addAlert({
      cryptoId: form.cryptoId,
      symbol: crypto.symbol,
      type: form.type,
      value: val,
      active: true,
    });

    if (result?.success) {
      notify.success(t('alerts.created'), `${t('alerts.notifyWhen')} ${crypto.symbol} ${t('alerts.reachTarget')}`);
      setForm({ cryptoId: 'bitcoin', type: 'price_above', value: '' });
      setShowForm(false);
    } else {
      notify.error(t('common.error'), result?.error);
    }
  };

  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        notify.success(t('alerts.activated'));
      }
    }
  };

  const activeAlerts = alerts.filter((a) => a.active && !a.triggered);
  const triggeredAlerts = alerts.filter((a) => a.triggered);
  const inactiveAlerts = alerts.filter((a) => !a.active && !a.triggered);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Bell className="w-8 h-8 text-yellow-400" />
            {t('alerts.title')}
          </h1>
          <p className="text-slate-400">{t('alerts.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('alerts.newAlert')}
        </button>
      </div>

      {'Notification' in window && Notification.permission === 'default' && (
        <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />
            <div>
              <div className="text-sm font-medium text-white">{t('alerts.activateNotifications')}</div>
              <div className="text-xs text-slate-400">{t('alerts.enableNotifications')}</div>
            </div>
          </div>
          <button
            onClick={requestPermission}
            className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg"
          >
            {t('common.activate')}
          </button>
        </div>
      )}

      {showForm && (
        <div className="bg-slate-900/60 border border-indigo-500/30 rounded-xl p-5 mb-6">
          <h3 className="text-white font-semibold mb-4">{t('alerts.createAlert')}</h3>
          <div className="grid md:grid-cols-4 gap-3">
            <select
              value={form.cryptoId}
              onChange={(e) => setForm({ ...form, cryptoId: e.target.value })}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              {cryptos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.symbol})
                </option>
              ))}
            </select>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as AlertRecord['type'] })}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            >
              <option value="price_above">{t('alerts.priceAbove')}</option>
              <option value="price_below">{t('alerts.priceBelow')}</option>
              <option value="change_up">{t('alerts.changeUp')}</option>
              <option value="change_down">{t('alerts.changeDown')}</option>
            </select>
            <input
              type="number"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              placeholder={form.type.includes('change') ? 'Ex: 10' : 'Ex: 70000'}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 rounded-lg"
              >
                {t('alerts.create')}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <BellRing className="w-4 h-4 text-indigo-400" />
            <span className="text-xs text-slate-400">{t('alerts.active')}</span>
          </div>
          <div className="text-2xl font-bold text-white">{activeAlerts.length}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400">{t('alerts.triggered')}</span>
          </div>
          <div className="text-2xl font-bold text-white">{triggeredAlerts.length}</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <BellOff className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-400">{t('alerts.paused')}</span>
          </div>
          <div className="text-2xl font-bold text-white">{inactiveAlerts.length}</div>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="text-slate-400 mt-4">{t('alerts.loadingAlerts')}</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center">
          <Bell className="w-16 h-16 mx-auto mb-4 text-slate-700" />
          <h3 className="text-lg font-semibold text-white mb-2">{t('alerts.noneConfigured')}</h3>
          <p className="text-slate-400 mb-4">{t('alerts.createFirst')}</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium px-4 py-2 rounded-lg"
          >
            <Plus className="w-4 h-4" />
            {t('alerts.createAlert')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const crypto = cryptos.find((c) => c.id === alert.cryptoId);
            const isTriggered = alert.triggered;
            const isPaused = !alert.active && !alert.triggered;

            return (
              <div
                key={alert.id}
                className={`bg-slate-900/60 border rounded-xl p-4 flex items-center gap-4 flex-wrap ${
                  isTriggered ? 'border-emerald-500/30' : isPaused ? 'border-slate-800 opacity-60' : 'border-slate-800'
                }`}
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                  style={{ backgroundColor: crypto?.color || '#64748b' }}
                >
                  {crypto?.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-white font-medium">{alert.symbol}</span>
                    <span className="text-xs text-slate-400">
                      {alert.type === 'price_above' && t('alerts.priceAbove')}
                      {alert.type === 'price_below' && t('alerts.priceBelow')}
                      {alert.type === 'change_up' && t('alerts.changeUp')}
                      {alert.type === 'change_down' && t('alerts.changeDown')}
                    </span>
                    <span className="text-white font-semibold">
                      {alert.type.includes('change') ? `${alert.value}%` : format(alert.value, { maxDecimals: alert.value < 1 ? 6 : 2 })}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {isTriggered ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {t('alerts.triggeredAt', { date: formatDateTime(alert.triggeredAt!) })}
                      </span>
                    ) : (
                      <span>{t('alerts.createdAt', { date: formatDateTime(alert.createdAt) })}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isTriggered ? (
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                      ✓ {t('alerts.triggeredBadge')}
                    </span>
                  ) : (
                    <button
                      onClick={() => toggleAlert(alert.id)}
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        isPaused ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-indigo-500/20 text-indigo-400'
                      }`}
                    >
                      {isPaused ? t('alerts.pausedBadge') : t('alerts.activeBadge')}
                    </button>
                  )}
                  <button
                    onClick={() => removeAlert(alert.id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
