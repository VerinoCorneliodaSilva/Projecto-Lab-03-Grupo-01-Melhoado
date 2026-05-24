import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { alertsApi } from '../services/api';
import { AlertRecord } from '../services/database';
import { cryptos } from '../data/cryptoData';

export function useAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setAlerts([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const res = await alertsApi.getAll(user.id);
      if (res.success) setAlerts(res.data || []);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Monitorar preços e disparar alertas
  useEffect(() => {
    if (!user || alerts.length === 0) return;

    const interval = setInterval(async () => {
      let changed = false;
      const updates: AlertRecord[] = [];

      for (const alert of alerts) {
        if (!alert.active || alert.triggered) continue;
        
        const crypto = cryptos.find((c) => c.id === alert.cryptoId);
        if (!crypto) continue;

        let shouldTrigger = false;
        switch (alert.type) {
          case 'price_above':
            shouldTrigger = crypto.price >= alert.value;
            break;
          case 'price_below':
            shouldTrigger = crypto.price <= alert.value;
            break;
          case 'change_up':
            shouldTrigger = crypto.change24h >= alert.value;
            break;
          case 'change_down':
            shouldTrigger = crypto.change24h <= -alert.value;
            break;
        }

        if (shouldTrigger) {
          changed = true;
          const updatedAlert: AlertRecord = {
            ...alert,
            triggered: true,
            triggeredAt: new Date().toISOString(),
            notified: true,
          };
          updates.push(updatedAlert);

          // Notificação no navegador
          if ('Notification' in window && Notification.permission === 'granted') {
            const msg =
              alert.type === 'price_above'
                ? `${alert.symbol} atingiu $${alert.value}!`
                : alert.type === 'price_below'
                ? `${alert.symbol} caiu abaixo de $${alert.value}!`
                : alert.type === 'change_up'
                ? `${alert.symbol} subiu ${alert.value}%!`
                : `${alert.symbol} caiu ${alert.value}%!`;
            new Notification('🔔 CryptoNova Alerta', { body: msg });
          }
        }
      }

      if (changed) {
        for (const upd of updates) {
          await alertsApi.update(upd.id, upd);
        }
        await refresh();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user, alerts, refresh]);

  const addAlert = useCallback(async (alert: Omit<AlertRecord, 'id' | 'userId' | 'createdAt' | 'triggered' | 'notified'>) => {
    if (!user) return;
    
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        await Notification.requestPermission();
      } catch (e) {
        console.error(e);
      }
    }

    const result = await alertsApi.create(user.id, alert);
    if (result.success) {
      await refresh();
    }
    return result;
  }, [user, refresh]);

  const removeAlert = useCallback(async (id: string) => {
    await alertsApi.delete(id);
    await refresh();
  }, [refresh]);

  const toggleAlert = useCallback(async (id: string) => {
    const alert = alerts.find((a) => a.id === id);
    if (!alert) return;
    await alertsApi.update(id, {
      active: !alert.active,
      triggered: false,
      notified: false,
    });
    await refresh();
  }, [alerts, refresh]);

  return { alerts, isLoading, addAlert, removeAlert, toggleAlert, refresh };
}
