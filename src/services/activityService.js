import { apiClient } from "./api/client.js";

export const activityService = {
  getActivity: () => apiClient.get("/activity/mine").then((r) => r.activity),
};
