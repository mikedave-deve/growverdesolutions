import mongoose from "mongoose";

const { Schema } = mongoose;

// A notification for one employee, generated as a side effect of a
// real action elsewhere (Information Setup submitted, transfer
// confirmed, etc.) — see Notification.record() below — or, for
// actions that don't have their own real backend yet (Support), by
// the employee's own client directly.
const notificationSchema = new Schema(
  {
    employee: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    priority: { type: String, enum: ["Low", "Normal", "High"], default: "Normal" },
    read: { type: Boolean, default: false },
    archived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.statics.record = function record(employeeId, { category, title, priority = "Normal" }) {
  return this.create({ employee: employeeId, category, title, priority });
};

notificationSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    category: this.category,
    title: this.title,
    priority: this.priority,
    read: this.read,
    date: this.createdAt,
  };
};

export const Notification = mongoose.model("Notification", notificationSchema);
