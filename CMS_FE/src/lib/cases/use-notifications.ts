import { useCallback, useEffect, useState } from "react";

import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationItem,
} from "@/lib/api/notifications";
import { useAuth } from "@/lib/cases/auth-context";

const CHANGED_EVENT = "ips:notifications-changed";

export function useNotifications() {
  const { token, ready: authReady } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!token) {
      setItems([]);
      setUnreadCount(0);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await fetchNotifications(token);
      setItems(data.items);
      setUnreadCount(data.unreadCount);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authReady) return;
    void reload();
  }, [authReady, reload]);

  useEffect(() => {
    const onChanged = () => void reload();
    window.addEventListener(CHANGED_EVENT, onChanged);
    return () => window.removeEventListener(CHANGED_EVENT, onChanged);
  }, [reload]);

  const markRead = useCallback(
    async (id: string) => {
      if (!token) throw new Error("Authentication required");
      const updated = await markNotificationRead(token, id);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setUnreadCount((count) => Math.max(0, count - 1));
      window.dispatchEvent(new Event(CHANGED_EVENT));
      return updated;
    },
    [token],
  );

  const markAllRead = useCallback(async () => {
    if (!token) throw new Error("Authentication required");
    const result = await markAllNotificationsRead(token);
    const now = new Date().toISOString();
    setItems((prev) => prev.map((item) => ({ ...item, readAt: item.readAt || now })));
    setUnreadCount(0);
    window.dispatchEvent(new Event(CHANGED_EVENT));
    return result;
  }, [token]);

  return { items, unreadCount, loading, error, reload, markRead, markAllRead };
}
