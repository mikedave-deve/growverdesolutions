import { PayrollCurrent } from "../models/PayrollCurrent.js";
import { PayHistoryEntry } from "../models/PayHistoryEntry.js";
import { DepositAccount } from "../models/DepositAccount.js";
import { Transfer } from "../models/Transfer.js";
import { Notification } from "../models/Notification.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const formatCurrency = (amount) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

// GET /api/payroll/current
export const getCurrent = asyncHandler(async (req, res) => {
  const record = await PayrollCurrent.findOne({ employee: req.user._id });
  res.status(200).json(
    record ? record.toSafeJSON() : { balance: 0, nextPayDate: null, grossPay: 0, deductions: 0, status: "Processing" }
  );
});

// GET /api/payroll/history
export const getHistory = asyncHandler(async (req, res) => {
  const entries = await PayHistoryEntry.find({ employee: req.user._id }).sort({ payDate: -1 });
  res.status(200).json({ history: entries.map((e) => e.toSafeJSON()) });
});

// GET /api/payroll/deposit-accounts
export const getDepositAccounts = asyncHandler(async (req, res) => {
  const accounts = await DepositAccount.find({ employee: req.user._id }).sort({ createdAt: 1 });
  res.status(200).json({ accounts: accounts.map((a) => a.toSafeJSON()) });
});

// POST /api/payroll/deposit-accounts
// Only the last 4 digits of the account/routing numbers are ever
// stored — the full numbers are used here only to derive those, then
// discarded.
export const addDepositAccount = asyncHandler(async (req, res) => {
  const { label, accountHolder, bankName, accountNumber, routingNumber, accountType, split } = req.body;

  if (!label || !accountHolder || !bankName) throw new AppError("Account label, holder name, and bank name are required.", 400);
  if (!accountNumber || !/^\d{4,17}$/.test(accountNumber)) throw new AppError("Account number should be 4–17 digits.", 400);
  if (!routingNumber || !/^\d{9}$/.test(routingNumber)) throw new AppError("Routing number should be 9 digits.", 400);
  const splitNum = Number(split);
  if (Number.isNaN(splitNum) || splitNum < 0 || splitNum > 100) throw new AppError("Split must be between 0 and 100.", 400);

  const account = await DepositAccount.create({
    employee: req.user._id,
    label,
    accountHolder,
    bankName,
    last4: accountNumber.slice(-4),
    routingLast4: routingNumber.slice(-4),
    accountType: accountType === "Savings" ? "Savings" : "Checking",
    split: splitNum,
  });

  await Notification.record(req.user._id, { category: "Payroll", title: "Direct deposit account added" });

  res.status(201).json({ account: account.toSafeJSON() });
});

// GET /api/payroll/transfers
export const getTransfers = asyncHandler(async (req, res) => {
  const transfers = await Transfer.find({ employee: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ transfers: transfers.map((t) => t.toSafeJSON()) });
});

// Every transfer moves funds out of the employee's own Payroll Balance
// into one of their own deposit accounts on file — never between two
// arbitrary accounts, and never anywhere else.
const FROM_LABEL = "Payroll Balance";

// POST /api/payroll/transfers
// Step 1 of 2.
export const submitTransfer = asyncHandler(async (req, res) => {
  const { to, amount, type } = req.body;
  if (!to || !amount) throw new AppError("An account to transfer to, and an amount, are required.", 400);
  const amountNum = Number(amount);
  if (Number.isNaN(amountNum) || amountNum <= 0) throw new AppError("Enter a valid amount.", 400);

  const [ownsAccount, current] = await Promise.all([
    DepositAccount.exists({ employee: req.user._id, label: to }),
    PayrollCurrent.findOne({ employee: req.user._id }),
  ]);
  if (!ownsAccount) throw new AppError("That account must be on file for your profile.", 400);

  const balance = current?.balance ?? 0;
  if (amountNum > balance) throw new AppError("Amount exceeds your available balance.", 400);

  const transfer = await Transfer.create({
    employee: req.user._id,
    from: FROM_LABEL,
    to,
    amount: amountNum,
    type: type === "Recurring" ? "Recurring" : "One-time",
    status: "Pending Confirmation",
  });

  res.status(201).json({ transfer: transfer.toSafeJSON() });
});

// The confirmation-code UI and its "Demo code: 123456" hint are
// unchanged by request — this just backs that same fixed demo code
// with a real, persisted transfer instead of an in-memory mock array.
const DEMO_CONFIRMATION_CODE = "123456";

// POST /api/payroll/transfers/:id/confirm — step 2 of 2. Actually
// moves the funds: the balance is only decremented here (atomically,
// re-checking sufficiency), never at submit time — so a second
// pending transfer submitted in the meantime can't double-spend it.
export const confirmTransfer = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const transfer = await Transfer.findOne({ _id: req.params.id, employee: req.user._id });
  if (!transfer) throw new AppError("Transfer not found.", 404);
  if (transfer.status === "Completed") throw new AppError("This transfer has already been confirmed.", 400);

  if (String(code || "").trim() !== DEMO_CONFIRMATION_CODE) {
    throw new AppError("That code doesn't match. Check your email and try again.", 400);
  }

  const debited = await PayrollCurrent.findOneAndUpdate(
    { employee: req.user._id, balance: { $gte: transfer.amount } },
    { $inc: { balance: -transfer.amount } }
  );
  if (!debited) throw new AppError("Amount exceeds your available balance.", 400);

  transfer.status = "Completed";
  transfer.confirmedAt = new Date();
  await transfer.save();

  await Notification.record(req.user._id, { category: "Payroll", title: `Transfer of ${formatCurrency(transfer.amount)} confirmed` });

  res.status(200).json({ transfer: transfer.toSafeJSON() });
});
