import mongoose from "mongoose";

const { Schema } = mongoose;

// One document per clock-in → clock-out session. "Currently clocked
// in" is derived (the entry with clockOutAt still null), not stored
// as a separate flag, so it can never drift out of sync.
const attendanceEntrySchema = new Schema(
  {
    employee: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    clockInAt: { type: Date, required: true },
    clockOutAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const AttendanceEntry = mongoose.model("AttendanceEntry", attendanceEntrySchema);
