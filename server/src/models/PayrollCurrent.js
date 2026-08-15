import mongoose from "mongoose";

const { Schema } = mongoose;

// The "current pay period" snapshot shown at the top of an employee's
// Payroll page — one document per employee, entirely admin/HR-managed.
// Never editable by the employee themselves.
const payrollCurrentSchema = new Schema(
  {
    employee: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    balance: { type: Number, default: 0 },
    nextPayDate: { type: Date, default: null },
    grossPay: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Processing", "Paid", "On Hold"],
      default: "Processing",
    },
  },
  { timestamps: true }
);

payrollCurrentSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    balance: this.balance,
    nextPayDate: this.nextPayDate,
    grossPay: this.grossPay,
    deductions: this.deductions,
    status: this.status,
  };
};

export const PayrollCurrent = mongoose.model("PayrollCurrent", payrollCurrentSchema);
