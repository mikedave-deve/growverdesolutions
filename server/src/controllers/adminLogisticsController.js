import { Shipment } from "../models/Shipment.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const TRANSPORT_MODES = ["Ground", "Air", "Sea", "Rail"];
const PAYMENT_STATUSES = ["Paid", "Unpaid", "Pending"];
const SHIPMENT_STATUSES = ["Order Created", "Processing", "Packed", "Shipped", "In Transit", "Out for Delivery", "Delivered", "On Hold", "Returned"];

function photoDataUri(file) {
  return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
}

// GET /api/admin/users/:id/shipments
export const listEmployeeShipments = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id);
  if (!employee) throw new AppError("Employee not found.", 404);

  const shipments = await Shipment.find({ employee: employee._id }).sort({ createdAt: -1 });
  res.status(200).json({ shipments: shipments.map((s) => s.toSafeJSON()) });
});

// POST /api/admin/users/:id/shipments — create a new parcel.
export const createShipment = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id);
  if (!employee) throw new AppError("Employee not found.", 404);

  const {
    trackingNumber, senderName, receiverName, originAddress, destinationAddress,
    currentLocation, shippingDate, estimatedDelivery, weight, dimensions, packageColor,
    transportMode, paymentStatus, shipmentStatus,
  } = req.body;

  if (!trackingNumber || !senderName || !receiverName || !originAddress || !destinationAddress) {
    throw new AppError("Tracking number, sender, receiver, origin, and destination address are required.", 400);
  }
  if (!shippingDate || !estimatedDelivery) throw new AppError("Shipping date and estimated delivery are required.", 400);

  const parsedShipDate = new Date(shippingDate);
  const parsedEstDelivery = new Date(estimatedDelivery);
  if (Number.isNaN(parsedShipDate.getTime())) throw new AppError("Invalid shipping date.", 400);
  if (Number.isNaN(parsedEstDelivery.getTime())) throw new AppError("Invalid estimated delivery date.", 400);

  if (transportMode && !TRANSPORT_MODES.includes(transportMode)) throw new AppError("Invalid transport mode.", 400);
  if (paymentStatus && !PAYMENT_STATUSES.includes(paymentStatus)) throw new AppError("Invalid payment status.", 400);
  if (shipmentStatus && !SHIPMENT_STATUSES.includes(shipmentStatus)) throw new AppError("Invalid shipment status.", 400);

  let shipment;
  try {
    shipment = await Shipment.create({
      employee: employee._id,
      trackingNumber,
      senderName,
      receiverName,
      originAddress,
      destinationAddress,
      currentLocation: currentLocation || "",
      shippingDate: parsedShipDate,
      estimatedDelivery: parsedEstDelivery,
      weight: weight || "",
      dimensions: dimensions || "",
      packageColor: packageColor || "",
      photoUrl: req.file ? photoDataUri(req.file) : "",
      transportMode: transportMode || "Ground",
      paymentStatus: paymentStatus || "Paid",
      shipmentStatus: shipmentStatus || "Order Created",
    });
  } catch (err) {
    if (err.code === 11000) throw new AppError("That tracking number is already in use.", 409);
    throw err;
  }

  res.status(201).json({ shipment: shipment.toSafeJSON() });
});

// GET /api/admin/shipments/:shipmentId — used by the invoice page.
export const getShipment = asyncHandler(async (req, res) => {
  const shipment = await Shipment.findById(req.params.shipmentId).populate("employee", "firstName lastName employeeId");
  if (!shipment) throw new AppError("Shipment not found.", 404);
  res.status(200).json({ shipment: shipment.toSafeJSON() });
});

// PATCH /api/admin/shipments/:shipmentId — admin can update any field,
// any time, including replacing the photo.
export const updateShipment = asyncHandler(async (req, res) => {
  const shipment = await Shipment.findById(req.params.shipmentId);
  if (!shipment) throw new AppError("Shipment not found.", 404);

  const {
    trackingNumber, senderName, receiverName, originAddress, destinationAddress,
    currentLocation, shippingDate, estimatedDelivery, weight, dimensions, packageColor,
    transportMode, paymentStatus, shipmentStatus,
  } = req.body;

  if (transportMode !== undefined && !TRANSPORT_MODES.includes(transportMode)) throw new AppError("Invalid transport mode.", 400);
  if (paymentStatus !== undefined && !PAYMENT_STATUSES.includes(paymentStatus)) throw new AppError("Invalid payment status.", 400);
  if (shipmentStatus !== undefined && !SHIPMENT_STATUSES.includes(shipmentStatus)) throw new AppError("Invalid shipment status.", 400);

  if (trackingNumber !== undefined) shipment.trackingNumber = trackingNumber;
  if (senderName !== undefined) shipment.senderName = senderName;
  if (receiverName !== undefined) shipment.receiverName = receiverName;
  if (originAddress !== undefined) shipment.originAddress = originAddress;
  if (destinationAddress !== undefined) shipment.destinationAddress = destinationAddress;
  if (currentLocation !== undefined) shipment.currentLocation = currentLocation;
  if (weight !== undefined) shipment.weight = weight;
  if (dimensions !== undefined) shipment.dimensions = dimensions;
  if (packageColor !== undefined) shipment.packageColor = packageColor;
  if (transportMode !== undefined) shipment.transportMode = transportMode;
  if (paymentStatus !== undefined) shipment.paymentStatus = paymentStatus;
  if (shipmentStatus !== undefined) shipment.shipmentStatus = shipmentStatus;

  if (shippingDate !== undefined) {
    const parsed = new Date(shippingDate);
    if (Number.isNaN(parsed.getTime())) throw new AppError("Invalid shipping date.", 400);
    shipment.shippingDate = parsed;
  }
  if (estimatedDelivery !== undefined) {
    const parsed = new Date(estimatedDelivery);
    if (Number.isNaN(parsed.getTime())) throw new AppError("Invalid estimated delivery date.", 400);
    shipment.estimatedDelivery = parsed;
  }
  if (req.file) shipment.photoUrl = photoDataUri(req.file);

  try {
    await shipment.save();
  } catch (err) {
    if (err.code === 11000) throw new AppError("That tracking number is already in use.", 409);
    throw err;
  }

  res.status(200).json({ shipment: shipment.toSafeJSON() });
});

// DELETE /api/admin/shipments/:shipmentId
export const deleteShipment = asyncHandler(async (req, res) => {
  const shipment = await Shipment.findByIdAndDelete(req.params.shipmentId);
  if (!shipment) throw new AppError("Shipment not found.", 404);
  res.status(200).json({ ok: true });
});
