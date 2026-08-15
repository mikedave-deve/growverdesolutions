import { apiClient, mockRequest } from "./api/client.js";

// Registration, login, logout, and session now call the real Express
// API (see /server). The API sets an httpOnly session cookie —
// apiClient already sends credentials:"include" on every request, so
// nothing else in the frontend needed to change for that.
export const authService = {
  login: (email, password, remember) => apiClient.post("/auth/login", { email, password, remember }),
  register: (payload) => apiClient.post("/auth/register", payload),
  logout: () => apiClient.post("/auth/logout"),
  getSession: () => apiClient.get("/auth/session"),

  // Not part of this pass — password reset still has no backend yet.
  requestPasswordReset: (email) => mockRequest({ ok: true }, { delay: 600 }),

  changePassword: (currentPassword, newPassword) =>
    apiClient.post("/auth/change-password", { currentPassword, newPassword }),
};
