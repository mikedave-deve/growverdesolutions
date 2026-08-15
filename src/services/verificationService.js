import { mockRequest } from "./api/client.js";
import { mockVerification } from "../mocks/mockData.js";

// In production: files upload via multipart to a signed URL (S3-style
// secure storage), and only metadata + status ever touches MongoDB.
// The sensitive identifier is transmitted directly to the backend over
// TLS and is never persisted client-side, logged, or included in the
// admin email notification.
export const verificationService = {
  getStatus: () => mockRequest(mockVerification, { delay: 500 }),
  submitVerification: (payload) => mockRequest({ status: "Submitted", submittedAt: new Date().toISOString() }, { delay: 1200 }),
};
