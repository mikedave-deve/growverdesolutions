import { PayrollCurrent } from "../models/PayrollCurrent.js";
import { PayHistoryEntry } from "../models/PayHistoryEntry.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const PAYROLL_STATUSES = ["Processing", "Paid", "On Hold"];

// GET /api/admin/users/:id/payroll/current
export const getEmployeeCurrentPay = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id);
  if (!employee) throw new AppError("Employee not found.", 404);

  const record = await PayrollCurrent.findOne({ employee: employee._id });
  res.status(200).json(
    record ? record.toSafeJSON() : { balance: 0, nextPayDate: null, grossPay: 0, deductions: 0, status: "Processing" }
  );
});

// PATCH /api/admin/users/:id/payroll/current
// The only way balance/nextPayDate/grossPay/deductions/status change —
// never editable by the employee themselves.
export const updateEmployeeCurrentPay = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id);
  if (!employee) throw new AppError("Employee not found.", 404);

  const { balance, nextPayDate, grossPay, deductions, status } = req.body;
  if (status !== undefined && !PAYROLL_STATUSES.includes(status)) throw new AppError("Invalid status.", 400);

  const update = {};
  if (balance !== undefined) update.balance = Number(balance) || 0;
  if (grossPay !== undefined) update.grossPay = Number(grossPay) || 0;
  if (deductions !== undefined) update.deductions = Number(deductions) || 0;
  if (status !== undefined) update.status = status;
  if (nextPayDate !== undefined) {
    const parsed = nextPayDate ? new Date(nextPayDate) : null;
    if (nextPayDate && Number.isNaN(parsed?.getTime())) throw new AppError("Invalid next pay date.", 400);
    update.nextPayDate = parsed;
  }

  const record = await PayrollCurrent.findOneAndUpdate(
    { employee: employee._id },
    { $set: update },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.status(200).json(record.toSafeJSON());
});

// GET /api/admin/users/:id/payroll/history
export const listEmployeePayHistory = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id);
  if (!employee) throw new AppError("Employee not found.", 404);

  const entries = await PayHistoryEntry.find({ employee: employee._id }).sort({ payDate: -1 });
  res.status(200).json({ history: entries.map((e) => e.toSafeJSON()) });
});

// POST /api/admin/users/:id/payroll/history
export const addEmployeePayHistory = asyncHandler(async (req, res) => {
  const employee = await User.findById(req.params.id);
  if (!employee) throw new AppError("Employee not found.", 404);

  const { payDate, payPeriod, gross, deductions, status } = req.body;
  if (!payDate) throw new AppError("Pay date is required.", 400);
  if (!payPeriod) throw new AppError("Pay period label is required.", 400);
  if (gross === undefined || Number.isNaN(Number(gross))) throw new AppError("Gross pay is required.", 400);
  if (status !== undefined && !PAYROLL_STATUSES.includes(status)) throw new AppError("Invalid status.", 400);

  const parsedDate = new Date(payDate);
  if (Number.isNaN(parsedDate.getTime())) throw new AppError("Invalid pay date.", 400);

  const entry = await PayHistoryEntry.create({
    employee: employee._id,
    payDate: parsedDate,
    payPeriod,
    gross: Number(gross) || 0,
    deductions: Number(deductions) || 0,
    status: status || "Paid",
  });

  res.status(201).json({ entry: entry.toSafeJSON() });
});
