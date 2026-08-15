import { apiClient } from "./api/client.js";

// Every form on the portal that the school-project brief describes as
// "goes to the email" (Information Setup, Identity Verification,
// Support requests, etc.) has its own dedicated real endpoint below —
// each renders its own template server-side and emails the actual
// submitted fields, not a generic one-line summary.
export const notifyService = {
  // POST /api/notify/information-setup.
  submitInformationSetup: (form) => apiClient.post("/notify/information-setup", form),

  // Identity Verification — likewise real: the two ID files go as
  // actual email attachments, and the identifier is included in the
  // body. POST /api/notify/verification (multipart).
  submitVerification: ({ front, back, identifier }) => {
    const formData = new FormData();
    formData.append("front", front);
    formData.append("back", back);
    formData.append("identifier", identifier);
    return apiClient.post("/notify/verification", formData);
  },

  // Phone Service request — real: POST /api/notify/phone-service.
  submitPhoneService: ({ firstName, lastName }) =>
    apiClient.post("/notify/phone-service", { firstName, lastName }),

  // 401(k) Retirement Benefits request — real: POST /api/notify/retirement-benefits.
  submitRetirementBenefits: ({ firstName, lastName }) =>
    apiClient.post("/notify/retirement-benefits", { firstName, lastName }),
};
