import { apiClient, mockRequest } from "./api/client.js";
import { mockUser } from "../mocks/mockData.js";

export const employeeService = {
  getProfile: () => mockRequest(mockUser, { delay: 500 }),

  // Personal contact info only (name/email/phone) — updates the whole
  // profile record, so the caller should feed the response back into
  // AuthContext's setUser() to refresh it everywhere at once.
  updateProfile: (updates) => apiClient.patch("/employees/me", updates).then((r) => r.user),

  updatePreferences: (prefs) => apiClient.patch("/employees/me/preferences", prefs).then((r) => r.user),

  // Real endpoint — the employee's own photo, unlike employment fields
  // (department/manager/etc.) which only admin/HR can change.
  uploadProfilePhoto: (file) => {
    const formData = new FormData();
    formData.append("photo", file);
    return apiClient.post("/employees/me/avatar", formData);
  },
};
