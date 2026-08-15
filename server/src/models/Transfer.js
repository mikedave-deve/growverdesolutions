import mongoose from "mongoose";

const { Schema } = mongoose;

// A transfer between two of the employee's own deposit accounts on
// file (by label) — never to or from the company. Two-step: created
// Pending Confirmation, then confirmed with a code.
const transferSchema = new Schema(
  {
    employee: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    amount: { type: Number, required: true, min: 0.01 },
    type: { type: String, enum: ["One-time", "Recurring"], default: "One-time" },
    status: { type: String, enum: ["Pending Confirmation", "Completed"], default: "Pending Confirmation" },
    confirmedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

transferSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    from: this.from,
    to: this.to,
    amount: this.amount,
    type: this.type,
    status: this.status,
    createdAt: this.createdAt,
    confirmedAt: this.confirmedAt,
  };
};

export const Transfer = mongoose.model("Transfer", transferSchema);
