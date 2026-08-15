import mongoose from "mongoose";
import { formatClockTime } from "../utils/formatTime.js";

const { Schema } = mongoose;

const activityLogSchema = new Schema(
  {
    employee: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    activity: { type: String, required: true },
    status: { type: String, enum: ["Success", "Failed"], default: "Success" },
  },
  { timestamps: true }
);

// Every real action that should show up in an employee's activity
// history calls this, right after it actually succeeds (or, for a
// failed sign-in, right where it's detected) — rather than each
// controller building the log entry by hand.
activityLogSchema.statics.record = function record(employeeId, activity, status = "Success") {
  return this.create({ employee: employeeId, activity, status });
};

activityLogSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    activity: this.activity,
    status: this.status,
    date: this.createdAt,
    time: formatClockTime(this.createdAt),
  };
};

export const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
