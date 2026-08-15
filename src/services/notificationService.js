import { apiClient } from "./api/client.js";

export const notificationService = {
  getNotifications: () => apiClient.get("/notifications/mine").then((r) => r.notifications),
  markAsRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  archive: (id) => apiClient.patch(`/notifications/${id}/archive`),

  // For actions that don't have a real backend endpoint of their own
  // yet (e.g. Support tickets) — everything else inserts its own
  // notification server-side as a side effect of the real action, so
  // callers there just refresh the shared NotificationsContext instead.
  notify: ({ category, title, priority }) =>
    apiClient.post("/notifications/mine", { category, title, priority }),
};
