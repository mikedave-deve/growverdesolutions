import { apiClient } from "./api/client.js";

// Calls the real Express/MongoDB admin endpoints (see /server). Every
// route here is also re-checked server-side for an admin/HR role —
// this service assumes the caller already passed the frontend's
// RequireAuth role gate, but the API enforces it independently.
export const adminService = {
  getPendingUsers: () => apiClient.get("/admin/users/pending"),
  approveUser: (id) => apiClient.post(`/admin/users/${id}/approve`),
  rejectUser: (id) => apiClient.post(`/admin/users/${id}/reject`),
  getEmployees: () => apiClient.get("/admin/users/employees"),
  updateEmployeeProfile: (id, updates) => apiClient.patch(`/admin/users/${id}/employment`, updates),

  getEmployeeDocuments: (employeeId) =>
    apiClient.get(`/admin/users/${employeeId}/documents`).then((r) => r.documents),
  uploadEmployeeDocument: (employeeId, { file, name, category, status, version }) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);
    if (category) formData.append("category", category);
    if (status) formData.append("status", status);
    if (version) formData.append("version", version);
    return apiClient.post(`/admin/users/${employeeId}/documents`, formData).then((r) => r.document);
  },
  updateDocument: (docId, { file, status } = {}) => {
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      if (status) formData.append("status", status);
      return apiClient.patch(`/admin/documents/${docId}`, formData).then((r) => r.document);
    }
    return apiClient.patch(`/admin/documents/${docId}`, { status }).then((r) => r.document);
  },

  getEmployeeMissions: (employeeId) =>
    apiClient.get(`/admin/users/${employeeId}/missions`).then((r) => r.missions),
  sendMission: (employeeId, payload) =>
    apiClient.post(`/admin/users/${employeeId}/missions`, payload).then((r) => r.mission),

  getEmployeeCurrentPay: (employeeId) => apiClient.get(`/admin/users/${employeeId}/payroll/current`),
  updateEmployeeCurrentPay: (employeeId, updates) =>
    apiClient.patch(`/admin/users/${employeeId}/payroll/current`, updates),
  getEmployeePayHistory: (employeeId) =>
    apiClient.get(`/admin/users/${employeeId}/payroll/history`).then((r) => r.history),
  addEmployeePayHistory: (employeeId, entry) =>
    apiClient.post(`/admin/users/${employeeId}/payroll/history`, entry).then((r) => r.entry),

  getEmployeeShipments: (employeeId) =>
    apiClient.get(`/admin/users/${employeeId}/shipments`).then((r) => r.shipments),
  createShipment: (employeeId, fields) =>
    apiClient.post(`/admin/users/${employeeId}/shipments`, buildShipmentFormData(fields)).then((r) => r.shipment),
  getShipment: (shipmentId) => apiClient.get(`/admin/shipments/${shipmentId}`).then((r) => r.shipment),
  updateShipment: (shipmentId, fields) =>
    apiClient.patch(`/admin/shipments/${shipmentId}`, buildShipmentFormData(fields)).then((r) => r.shipment),
  deleteShipment: (shipmentId) => apiClient.delete(`/admin/shipments/${shipmentId}`),
};

const SHIPMENT_FIELDS = [
  "trackingNumber", "senderName", "receiverName", "originAddress", "destinationAddress",
  "currentLocation", "shippingDate", "estimatedDelivery", "weight", "dimensions",
  "packageColor", "transportMode", "paymentStatus", "shipmentStatus",
];

function buildShipmentFormData(fields) {
  const formData = new FormData();
  if (fields.photo) formData.append("photo", fields.photo);
  for (const key of SHIPMENT_FIELDS) {
    if (fields[key] !== undefined) formData.append(key, fields[key]);
  }
  return formData;
}
