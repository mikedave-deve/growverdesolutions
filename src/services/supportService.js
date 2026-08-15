import { apiClient } from "./api/client.js";

export const supportService = {
  getTickets: () => apiClient.get("/support/tickets/mine").then((r) => r.tickets),
  submitTicket: (payload) => apiClient.post("/support/tickets/mine", payload),
};
