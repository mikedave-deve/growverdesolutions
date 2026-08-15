import { apiClient } from "./api/client.js";

export const missionService = {
  getMissions: () => apiClient.get("/missions/mine").then((r) => r.missions),
};
