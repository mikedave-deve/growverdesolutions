import { apiClient } from "./api/client.js";

// Registration, login, logout, and session now call the real Express
// API (see /server). The API sets an httpOnly session cookie —
// apiClient already sends credentials:"include" on every request, so
// nothing else in the frontend needed to change for that.
export const authService = {
  login: (email, password, remember) => apiClient.post("/auth/login", { email, password, remember }),
  register: (payload) => apiClient.post("/auth/register", payload),
  logout: () => apiClient.post("/auth/logout"),
  getSession: () => apiClient.get("/auth/session"),

  requestPasswordReset: (email) => apiClient.post("/auth/forgot-password", { email }),
  resetPassword: (token, newPassword) => apiClient.post("/auth/reset-password", { token, newPassword }),

  changePassword: (currentPassword, newPassword) =>
    apiClient.post("/auth/change-password", { currentPassword, newPassword }),
};
