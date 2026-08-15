import { apiClient } from "./api/client.js";

export const attendanceService = {
  getStatus: () => apiClient.get("/attendance/status"),
  clockIn: () => apiClient.post("/attendance/clock-in"),
  clockOut: () => apiClient.post("/attendance/clock-out"),
};
