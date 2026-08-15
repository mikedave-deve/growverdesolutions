import { apiClient } from "./api/client.js";

// Same as any real carrier: tracking a shipment is a lookup by number,
// not tied to whose account is signed in.
export const logisticsService = {
  trackShipment: (trackingNumber) =>
    apiClient.get(`/logistics/track/${encodeURIComponent(trackingNumber)}`).then((r) => r.shipment),

  // The employee's own most recent shipment on file — used for the
  // "Equipment" summary on the dashboard. Resolves to null, not an
  // error, when there isn't one yet.
  getMyShipment: () => apiClient.get("/logistics/mine").then((r) => r.shipment),
};
