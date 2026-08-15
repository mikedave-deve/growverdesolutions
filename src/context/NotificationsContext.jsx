import React, { createContext, useContext, useCallback, useEffect, useState } from "react";
import { notificationService } from "../services/notificationService.js";

const NotificationsContext = createContext(null);

// Shared across the whole portal (mounted once in PortalLayout) so
// that any page performing an action that generates a notification
// can call refresh() and have the Topbar bell badge — and the
// Notifications page itself, if it happens to be open — update
// immediately, without a full page reload.
export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [status, setStatus] = useState("loading");

  const refresh = useCallback(() => {
    setStatus((s) => (s === "success" ? s : "loading"));
    return notificationService
      .getNotifications()
      .then((data) => {
        setNotifications(data);
        setStatus("success");
      })
      .catch(() => setStatus("error"));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationsContext.Provider value={{ notifications, status, unreadCount, refresh }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
