import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Download, Plus, ArrowRightLeft, ArrowLeftRight, Eye, EyeOff } from "lucide-react";
import { SectionHeading, Card, StatusPill, Button, Field, Input } from "../../components/ui/Primitives.jsx";
import { AsyncBoundary, EmptyState } from "../../components/ui/States.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { payrollService } from "../../services/payrollService.js";
import { formatCurrency, formatDate } from "../../utils/formatters.js";
import { useToast } from "../../context/ToastContext.jsx";
import { useNotifications } from "../../context/NotificationsContext.jsx";
import { ROUTES } from "../../constants/routes.js";

function StatCard({ label, value, sub }) {
  return (
    <Card className="p-5">
      <p className="text-xs text-ink-700/50 mb-1.5">{label}</p>
      {value && <p className="font-display font-bold text-2xl">{value}</p>}
      {sub && <div className={value ? "mt-1.5" : ""}>{sub}</div>}
    </Card>
  );
}

function AddAccountForm({ onAdd, onCancel }) {
  const [form, setForm] = useState({ label: "", accountHolder: "", bankName: "", accountNumber: "", accountType: "Checking", split: "" });
  const [saving, setSaving] = useState(false);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onAdd({ ...form, last4: form.accountNumber.slice(-4), split: Number(form.split) || 0 });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4 border-t border-sand-100 pt-4 mt-4">
      <Field label="Account label" htmlFor="dLabel"><Input id="dLabel" placeholder="e.g. Secondary Savings" value={form.label} onChange={set("label")} required /></Field>
      <Field label="Account holder name" htmlFor="dHolder"><Input id="dHolder" value={form.accountHolder} onChange={set("accountHolder")} required /></Field>
      <Field label="Bank name" htmlFor="dBank"><Input id="dBank" value={form.bankName} onChange={set("bankName")} required /></Field>
      <Field label="Account number" htmlFor="dAcct">
        <div className="relative">
          <Input id="dAcct" type={showAccountNumber ? "text" : "password"} inputMode="numeric" value={form.accountNumber} onChange={set("accountNumber")} className="pr-10" required />
          <button type="button" onClick={() => setShowAccountNumber((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-700/40 hover:text-ink-800"
            aria-label={showAccountNumber ? "Hide account number" : "Show account number"}>
            {showAccountNumber ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </Field>
      <Field label="Account type" htmlFor="dType">
        <select id="dType" value={form.accountType} onChange={set("accountType")} className="w-full rounded-lg border border-sand-300 px-3.5 py-2.5 text-sm bg-white">
          <option>Checking</option>
          <option>Savings</option>
        </select>
      </Field>
      <Field label="Split %" htmlFor="dSplit" hint="Percent of each paycheck sent here.">
        <Input id="dSplit" type="number" min="0" max="100" value={form.split} onChange={set("split")} required />
      </Field>
      <div className="sm:col-span-2 flex gap-2">
        <Button type="submit" size="sm" disabled={saving}>{saving ? "Saving…" : "Save Account"}</Button>
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

export function Payroll() {
  const current = useAsync(() => payrollService.getCurrentPay(), []);
  const history = useAsync(() => payrollService.getPayrollHistory(), []);
  const deposits = useAsync(() => payrollService.getDepositAccounts(), []);
  const transfers = useAsync(() => payrollService.getTransfers(), []);
  const { push } = useToast();
  const { refresh: refreshNotifications } = useNotifications();

  const [addingAccount, setAddingAccount] = useState(false);
  const [transferForm, setTransferForm] = useState({ to: "", amount: "", type: "One-time" });
  const [pendingTransfer, setPendingTransfer] = useState(null);
  const [code, setCode] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [lastConfirmed, setLastConfirmed] = useState(null);

  const historyColumns = [
    { key: "payDate", header: "Pay Date", render: (r) => formatDate(r.payDate) },
    { key: "payPeriod", header: "Pay Period" },
    { key: "gross", header: "Gross", render: (r) => formatCurrency(r.gross) },
    { key: "deductions", header: "Deductions", render: (r) => formatCurrency(r.deductions) },
    { key: "net", header: "Net Pay", render: (r) => formatCurrency(r.net) },
    { key: "status", header: "Status", render: (r) => <StatusPill status={r.status} /> },
    { key: "actions", header: "", render: (r) => (
      <Button variant="ghost" size="sm" onClick={() => push("Downloading pay statement…")}><Download size={14} /></Button>
    ) },
  ];

  const transferColumns = [
    { key: "createdAt", header: "Date", render: (r) => formatDate(r.confirmedAt || r.createdAt) },
    { key: "from", header: "From" },
    { key: "to", header: "To" },
    { key: "amount", header: "Amount", render: (r) => formatCurrency(r.amount) },
    { key: "type", header: "Type" },
    { key: "status", header: "Status", render: (r) => <StatusPill status={r.status} /> },
  ];

  const addAccount = async (payload) => {
    // The notification itself is created server-side as a side effect
    // of this call — refresh() just picks it up for the Topbar badge.
    await payrollService.addDepositAccount(payload);
    refreshNotifications();
    setAddingAccount(false);
    deposits.retry();
    push("Deposit account saved.");
  };

  const submitTransfer = async (e) => {
    e.preventDefault();
    if (!transferForm.to || !transferForm.amount) return;
    if (Number(transferForm.amount) > (current.data?.balance ?? 0)) {
      push("Amount exceeds your available balance.", "error");
      return;
    }
    try {
      const record = await payrollService.submitTransfer(transferForm);
      setPendingTransfer(record);
      setCode("");
      setCodeError("");
    } catch (err) {
      push(err.message || "Something went wrong. Please try again.", "error");
    }
  };

  const confirmTransfer = async () => {
    setConfirming(true);
    setCodeError("");
    try {
      const confirmed = await payrollService.confirmTransfer(pendingTransfer, code);
      setLastConfirmed(confirmed);
      setPendingTransfer(null);
      setTransferForm({ to: "", amount: "", type: "One-time" });
      transfers.retry();
      current.retry();
      refreshNotifications();
      push("Transfer confirmed.");
    } catch (err) {
      setCodeError(err.message);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div>
      <SectionHeading eyebrow="Payroll" title="Payroll" description="Your pay overview, direct deposit accounts, and transfers from your payroll balance into an account you own." />

      <AsyncBoundary {...current} loadingRows={4}>
        {current.data && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatCard label="Balance" value={formatCurrency(current.data.balance)} />
            <StatCard label="Next Pay Date" value={formatDate(current.data.nextPayDate)} />
            <StatCard label="Gross Pay" value={formatCurrency(current.data.grossPay)} />
            <StatCard label="Deductions" value={formatCurrency(current.data.deductions)} />
            <StatCard label="Status" value="" sub={<StatusPill status={current.data.status} />} />
          </div>
        )}
      </AsyncBoundary>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <p className="font-semibold mb-1">Direct deposit accounts</p>
          <p className="text-xs text-ink-700/50 mb-3">Where your paycheck is deposited. Split across multiple accounts by percentage.</p>
          <AsyncBoundary
            {...deposits} loadingRows={2}
            empty={deposits.data?.length === 0 ? <EmptyState title="No deposit accounts on file" description="Add an account below to set up direct deposit." /> : null}
          >
            <ul className="space-y-2.5">
              {deposits.data?.map((a) => (
                <li key={a.id} className="flex items-center justify-between text-sm border-b border-sand-100 last:border-0 pb-2.5 last:pb-0">
                  <div>
                    <p className="font-medium">{a.label}</p>
                    <p className="text-xs text-ink-700/50 font-mono mt-0.5">{a.bankName} •••• {a.last4}</p>
                  </div>
                  <span className="text-sm font-semibold">{a.split}%</span>
                </li>
              ))}
            </ul>
          </AsyncBoundary>
          {addingAccount ? (
            <AddAccountForm onAdd={addAccount} onCancel={() => setAddingAccount(false)} />
          ) : (
            <Button variant="secondary" size="sm" className="mt-4" onClick={() => setAddingAccount(true)}>
              <Plus size={14} /> Add Account
            </Button>
          )}
        </Card>

        <Card className="p-6">
          <p className="font-semibold mb-1 flex items-center gap-2"><ArrowRightLeft size={15} /> Transfer from your Payroll Balance</p>
          <p className="text-xs text-ink-700/50 mb-4">Move funds from your Payroll Balance into a deposit account you own on file above.</p>
          <form onSubmit={submitTransfer} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="From" htmlFor="tFrom" hint={`${formatCurrency(current.data?.balance ?? 0)} available`}>
                <div id="tFrom" className="w-full rounded-lg border border-sand-300 px-3.5 py-2.5 text-sm bg-sand-50 text-ink-700/70">
                  Payroll Balance
                </div>
              </Field>
              <Field label="To account" htmlFor="tTo">
                <select id="tTo" value={transferForm.to} onChange={(e) => setTransferForm({ ...transferForm, to: e.target.value })} className="w-full rounded-lg border border-sand-300 px-3.5 py-2.5 text-sm bg-white" required>
                  <option value="">Select…</option>
                  {deposits.data?.map((a) => <option key={a.id} value={a.label}>{a.label}</option>)}
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Amount" htmlFor="tAmt">
                <Input id="tAmt" type="number" min="1" max={current.data?.balance || undefined} step="0.01" placeholder="0.00" value={transferForm.amount} onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })} required />
              </Field>
              <Field label="Transfer type" htmlFor="tType">
                <select id="tType" value={transferForm.type} onChange={(e) => setTransferForm({ ...transferForm, type: e.target.value })} className="w-full rounded-lg border border-sand-300 px-3.5 py-2.5 text-sm bg-white">
                  <option>One-time</option>
                  <option>Recurring</option>
                </select>
              </Field>
            </div>
            <Button type="submit" size="sm">Submit Transfer</Button>
          </form>

          {lastConfirmed && (
            <div className="mt-5 pt-4 border-t border-sand-100">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-700/50 mb-2">Transfer summary</p>
              <div className="text-sm space-y-1">
                <div className="flex justify-between"><span className="text-ink-700/60">From</span><span className="font-medium">{lastConfirmed.from}</span></div>
                <div className="flex justify-between"><span className="text-ink-700/60">To</span><span className="font-medium">{lastConfirmed.to}</span></div>
                <div className="flex justify-between"><span className="text-ink-700/60">Amount</span><span className="font-medium">{formatCurrency(lastConfirmed.amount)}</span></div>
                <div className="flex justify-between"><span className="text-ink-700/60">Status</span><StatusPill status={lastConfirmed.status} /></div>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6 mb-8">
        <p className="font-semibold mb-4">Transaction history</p>
        <AsyncBoundary
          {...transfers} loadingRows={2}
          empty={transfers.data?.length === 0 ? <EmptyState icon={ArrowLeftRight} title="No transfers yet" description="Confirmed transfers from your Payroll Balance will appear here." /> : null}
        >
          <DataTable columns={transferColumns} rows={transfers.data || []} />
        </AsyncBoundary>
      </Card>

      <Card className="p-6">
        <p className="font-semibold mb-4">Pay history</p>
        <AsyncBoundary {...history} loadingRows={4}>
          <DataTable columns={historyColumns} rows={history.data || []} />
        </AsyncBoundary>
      </Card>

      <Modal
        open={!!pendingTransfer}
        onClose={() => { setPendingTransfer(null); setCode(""); setCodeError(""); }}
        title="Confirm transfer"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setPendingTransfer(null)}>Cancel</Button>
            <Button size="sm" disabled={code.length !== 6 || confirming} onClick={confirmTransfer}>
              {confirming ? "Confirming…" : "Confirm Transfer"}
            </Button>
          </>
        }
      >
        {pendingTransfer && (
          <div>
            <p className="text-sm text-ink-700/70 mb-4">
              Enter the 6-digit code sent to your email to confirm this transfer of{" "}
              <strong>{formatCurrency(pendingTransfer.amount)}</strong> from your {pendingTransfer.from} to {pendingTransfer.to}.
            </p>
            <Field label="Confirmation code" htmlFor="code" error={codeError} hint={!codeError ? "" : undefined}>
              <Input id="code" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className="font-mono tracking-widest text-center text-lg" />
            </Field>
            <p className="text-xs text-ink-700/50 mt-3">Didn't get a code? <Link to={ROUTES.SUPPORT} className="text-forest-700 font-medium hover:underline">Contact Support</Link>.</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
