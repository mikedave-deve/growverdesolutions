import { Shipment } from "../models/Shipment.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// GET /api/logistics/track/:trackingNumber
// Same as any real carrier: knowing the tracking number is what grants
// visibility, not whose account happens to be signed in — there's no
// ownership check here by design.
export const trackShipment = asyncHandler(async (req, res) => {
  const trackingNumber = req.params.trackingNumber.trim();
  const shipment = await Shipment.findOne({ trackingNumber }).collation({ locale: "en", strength: 2 });
  if (!shipment) throw new AppError(`No shipment found for tracking number "${trackingNumber}".`, 404);
  res.status(200).json({ shipment: shipment.toSafeJSON() });
});

// GET /api/logistics/mine
// Unlike tracking (public-by-number), this is the employee's own most
// recent shipment on file — used for the "Equipment" summary on their
// dashboard. Returns { shipment: null } rather than 404 when there
// isn't one yet, since that's a normal state, not an error.
export const getMyShipment = asyncHandler(async (req, res) => {
  const shipment = await Shipment.findOne({ employee: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ shipment: shipment ? shipment.toSafeJSON() : null });
});
