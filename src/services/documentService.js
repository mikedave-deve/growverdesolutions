import { apiClient } from "./api/client.js";

export const documentService = {
  getDocuments: () => apiClient.get("/documents/mine").then((r) => r.documents),
  downloadUrl: (id) => apiClient.url(`/documents/${id}/download`),
};
