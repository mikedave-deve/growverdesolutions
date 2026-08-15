import { apiClient } from "./api/client.js";

export const payrollService = {
  getCurrentPay: () => apiClient.get("/payroll/current"),
  getPayrollHistory: () => apiClient.get("/payroll/history").then((r) => r.history),

  getDepositAccounts: () => apiClient.get("/payroll/deposit-accounts").then((r) => r.accounts),
  addDepositAccount: (account) => apiClient.post("/payroll/deposit-accounts", account).then((r) => r.account),

  getTransfers: () => apiClient.get("/payroll/transfers").then((r) => r.transfers),

  // Step 1 of 2: creates a pending transfer from the employee's own
  // Payroll Balance into one of their own deposit accounts on file.
  submitTransfer: (payload) => apiClient.post("/payroll/transfers", payload).then((r) => r.transfer),

  // Step 2 of 2 — the confirmation-code UI/UX is unchanged (still
  // "Demo code: 123456"); this now confirms against a real, persisted
  // transfer instead of an in-memory mock.
  confirmTransfer: (record, code) => apiClient.post(`/payroll/transfers/${record.id}/confirm`, { code }).then((r) => r.transfer),
};
