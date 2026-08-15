import mongoose from "mongoose";

const { Schema } = mongoose;

// One closed/paid pay period — admin/HR adds these (e.g. when a pay
// run is finalized). Net pay is always derived from gross - deductions
// rather than entered separately, so the two can never disagree.
const payHistoryEntrySchema = new Schema(
  {
    employee: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    payDate: { type: Date, required: true },
    payPeriod: { type: String, required: true, trim: true },
    gross: { type: Number, required: true },
    deductions: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Processing", "Paid", "On Hold"],
      default: "Paid",
    },
  },
  { timestamps: true }
);

payHistoryEntrySchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    payDate: this.payDate,
    payPeriod: this.payPeriod,
    gross: this.gross,
    deductions: this.deductions,
    net: this.gross - this.deductions,
    status: this.status,
  };
};

export const PayHistoryEntry = mongoose.model("PayHistoryEntry", payHistoryEntrySchema);
