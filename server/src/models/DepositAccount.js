import mongoose from "mongoose";

const { Schema } = mongoose;

// An employee's own bank account on file for direct deposit — never
// the company's. Only the last 4 digits of the account number are
// ever persisted; the full number is used once (server-side) to
// derive last4 and then discarded, since nothing ever needs to
// redisplay it.
const depositAccountSchema = new Schema(
  {
    employee: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    label: { type: String, required: true, trim: true },
    accountHolder: { type: String, required: true, trim: true },
    bankName: { type: String, required: true, trim: true },
    last4: { type: String, required: true },
    accountType: { type: String, enum: ["Checking", "Savings"], default: "Checking" },
    split: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

depositAccountSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    label: this.label,
    accountHolder: this.accountHolder,
    bankName: this.bankName,
    last4: this.last4,
    accountType: this.accountType,
    split: this.split,
  };
};

export const DepositAccount = mongoose.model("DepositAccount", depositAccountSchema);
