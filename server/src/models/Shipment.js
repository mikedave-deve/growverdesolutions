import mongoose from "mongoose";

const { Schema } = mongoose;

// A package shipped to a specific employee — entirely admin/HR
// managed. Employees only ever see it by looking up its tracking
// number (same as any real carrier — knowing the number is what
// grants visibility, not account ownership).
const shipmentSchema = new Schema(
  {
    employee: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    trackingNumber: { type: String, required: true, unique: true, trim: true },
    senderName: { type: String, required: true, trim: true },
    receiverName: { type: String, required: true, trim: true },
    originAddress: { type: String, required: true, trim: true },
    destinationAddress: { type: String, required: true, trim: true },
    currentLocation: { type: String, trim: true, default: "" },
    shippingDate: { type: Date, required: true },
    estimatedDelivery: { type: Date, required: true },
    weight: { type: String, trim: true, default: "" },
    dimensions: { type: String, trim: true, default: "" },
    packageColor: { type: String, trim: true, default: "" },
    photoUrl: { type: String, default: "" },
    transportMode: { type: String, enum: ["Ground", "Air", "Sea", "Rail"], default: "Ground" },
    paymentStatus: { type: String, enum: ["Paid", "Unpaid", "Pending"], default: "Paid" },
    shipmentStatus: {
      type: String,
      enum: ["Order Created", "Processing", "Packed", "Shipped", "In Transit", "Out for Delivery", "Delivered", "On Hold", "Returned"],
      default: "Order Created",
    },
  },
  { timestamps: true }
);

shipmentSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    trackingNumber: this.trackingNumber,
    senderName: this.senderName,
    receiverName: this.receiverName,
    originAddress: this.originAddress,
    destinationAddress: this.destinationAddress,
    currentLocation: this.currentLocation,
    shippingDate: this.shippingDate,
    estimatedDelivery: this.estimatedDelivery,
    weight: this.weight,
    dimensions: this.dimensions,
    packageColor: this.packageColor,
    photoUrl: this.photoUrl || null,
    transportMode: this.transportMode,
    paymentStatus: this.paymentStatus,
    shipmentStatus: this.shipmentStatus,
    createdAt: this.createdAt,
    employee:
      this.employee && this.employee.firstName
        ? {
            id: this.employee._id.toString(),
            firstName: this.employee.firstName,
            lastName: this.employee.lastName,
            employeeId: this.employee.employeeId,
          }
        : undefined,
  };
};

export const Shipment = mongoose.model("Shipment", shipmentSchema);
