import { apiClient } from "./api/client.js";

// Public — no signed-in account, used by the marketing site's
// "Submit Your Resume" page.
export const careersService = {
  submitResume: (formData) => apiClient.post("/careers/resume", formData),
};
