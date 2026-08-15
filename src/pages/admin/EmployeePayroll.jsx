import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Wallet, Pencil, Plus, History } from "lucide-react";
import { SectionHeading, Card, Button, Field, Input, StatusPill } from "../../components/ui/Primitives.jsx";
import { AsyncBoundary, EmptyState } from "../../components/ui/States.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { adminService } from "../../services/adminService.js";
import { useAsync } from "../../hooks/useAsync.js";
import { useToast } from "../../context/ToastContext.jsx";
import { formatCurrency, formatDate } from "../../utils/formatters.js";
import { ROUTES } from "../../constants/routes.js";

const SELECT_CLASS = "w-full rounded-lg border border-sand-300 px-3.5 py-2.5 text-sm bg-white";
const PAYROLL_STATUSES = ["Processing", "Paid", "On Hold"];

function StatCard({ label, value, sub }) {
  return (
    <Card className="p-5">
      <p className="text-xs text-ink-700/50 mb-1.5">{label}</p>
      {value && <p className="font-display font-bold text-2xl">{value}</p>}
      {sub && <div className={value ? "mt-1.5" : ""}>{sub}</div>}
    </Card>
  );
}

function toDateInputValue(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function EmployeePayroll() {
  const { id } = useParams();
  const { push } = useToast();
  const employees = useAsync(() => adminService.getEmployees(), []);
  const current = useAsync(() => adminService.getEmployeeCurrentPay(id), [id]);
  const history = useAsync(() => adminService.getEmployeePayHistory(id), [id]);

  const employee = employees.data?.users?.find((u) => u.id === id);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ payDate: "", payPeriod: "", gross: "", deductions: "", status: "Paid" });
  const [adding, setAdding] = useState(false);

  const openEdit = () => {
    setEditForm({
      balance: current.data?.balance ?? 0,
      nextPayDate: toDateInputValue(current.data?.nextPayDate),
      grossPay: current.data?.grossPay ?? 0,
      deductions: current.data?.deductions ?? 0,
      status: current.data?.status || "Processing",
    });
    setEditOpen(true);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.updateEmployeeCurrentPay(id, editForm);
      push("Current pay updated.", "success", "Payroll updated");
      setEditOpen(false);
      current.retry();
    } catch (err) {
      push(err.message || "Something went wrong. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const openAdd = () => {
    setAddForm({ payDate: "", payPeriod: "", gross: "", deductions: "", status: "Paid" });
    setAddOpen(true);
  };

  const submitAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await adminService.addEmployeePayHistory(id, addForm);
      push("Pay history entry added.", "success", "Pay history updated");
      setAddOpen(false);
      history.retry();
    } catch (err) {
      push(err.message || "Something went wrong. Please try again.", "error");
    } finally {
      setAdding(false);
    }
  };

  const historyColumns = [
    { key: "payDate", header: "Pay Date", render: (r) => formatDate(r.payDate) },
    { key: "payPeriod", header: "Pay Period" },
    { key: "gross", header: "Gross", render: (r) => formatCurrency(r.gross) },
    { key: "deductions", header: "Deductions", render: (r) => formatCurrency(r.deductions) },
    { key: "net", header: "Net Pay", render: (r) => formatCurrency(r.net) },
    { key: "status", header: "Status", render: (r) => <StatusPill status={r.status} /> },
  ];

  return (
    <div>
      <Link to={ROUTES.ADMIN_EMPLOYEES} className="inline-flex items-center gap-1.5 text-sm text-ink-700/60 hover:text-ink-900 mb-4">
        <ArrowLeft size={14} /> Back to Employees
      </Link>

      <SectionHeading
        eyebrow="Admin"
        title={employee ? `${employee.firstName} ${employee.lastName}'s payroll` : "Employee payroll"}
        description="Balance, next pay date, gross pay, deductions, and status — set here, reflected live on the employee's own Payroll page and dashboard."
        action={<Button size="sm" onClick={openEdit}><Pencil size={14} /> Edit current pay</Button>}
      />

      <AsyncBoundary status={current.status} error={current.error} retry={current.retry} loadingRows={4}>
        {current.data && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <StatCard label="Balance" value={formatCurrency(current.data.balance)} />
            <StatCard label="Next Pay Date" value={current.data.nextPayDate ? formatDate(current.data.nextPayDate) : "—"} />
            <StatCard label="Gross Pay" value={formatCurrency(current.data.grossPay)} />
            <StatCard label="Deductions" value={formatCurrency(current.data.deductions)} />
            <StatCard label="Status" value="" sub={<StatusPill status={current.data.status} />} />
          </div>
        )}
      </AsyncBoundary>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold flex items-center gap-2"><History size={15} /> Pay history</p>
          <Button variant="secondary" size="sm" onClick={openAdd}><Plus size={14} /> Add entry</Button>
        </div>
        <AsyncBoundary
          status={history.status} error={history.error} retry={history.retry}
          empty={(history.data?.length === 0 && history.status === "success") ? (
            <EmptyState icon={Wallet} title="No pay history yet" description="Add the first pay period entry for this employee." />
          ) : null}
        >
          <DataTable columns={historyColumns} rows={history.data || []} keyField="id" />
        </AsyncBoundary>
      </Card>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit current pay"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button size="sm" form="payroll-edit-form" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </>
        }
      >
        {editForm && (
          <form id="payroll-edit-form" onSubmit={submitEdit} className="space-y-4">
            <Field label="Balance" htmlFor="payBalance">
              <Input id="payBalance" type="number" min="0" step="0.01" value={editForm.balance}
                onChange={(e) => setEditForm((f) => ({ ...f, balance: e.target.value }))} />
            </Field>
            <Field label="Next pay date" htmlFor="payNextDate">
              <Input id="payNextDate" type="date" value={editForm.nextPayDate}
                onChange={(e) => setEditForm((f) => ({ ...f, nextPayDate: e.target.value }))} />
            </Field>
            <Field label="Gross pay" htmlFor="payGross">
              <Input id="payGross" type="number" min="0" step="0.01" value={editForm.grossPay}
                onChange={(e) => setEditForm((f) => ({ ...f, grossPay: e.target.value }))} />
            </Field>
            <Field label="Deductions" htmlFor="payDeductions">
              <Input id="payDeductions" type="number" min="0" step="0.01" value={editForm.deductions}
                onChange={(e) => setEditForm((f) => ({ ...f, deductions: e.target.value }))} />
            </Field>
            <Field label="Status" htmlFor="payStatus">
              <select id="payStatus" className={SELECT_CLASS} value={editForm.status}
                onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}>
                {PAYROLL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </form>
        )}
      </Modal>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add pay history entry"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button size="sm" form="payroll-history-form" type="submit" disabled={adding}>
              {adding ? "Adding…" : "Add entry"}
            </Button>
          </>
        }
      >
        <form id="payroll-history-form" onSubmit={submitAdd} className="space-y-4">
          <Field label="Pay date" htmlFor="histDate">
            <Input id="histDate" type="date" value={addForm.payDate}
              onChange={(e) => setAddForm((f) => ({ ...f, payDate: e.target.value }))} required />
          </Field>
          <Field label="Pay period" htmlFor="histPeriod" hint="e.g. Jul 12 – Jul 25">
            <Input id="histPeriod" value={addForm.payPeriod}
              onChange={(e) => setAddForm((f) => ({ ...f, payPeriod: e.target.value }))} required />
          </Field>
          <Field label="Gross pay" htmlFor="histGross">
            <Input id="histGross" type="number" min="0" step="0.01" value={addForm.gross}
              onChange={(e) => setAddForm((f) => ({ ...f, gross: e.target.value }))} required />
          </Field>
          <Field label="Deductions" htmlFor="histDeductions">
            <Input id="histDeductions" type="number" min="0" step="0.01" value={addForm.deductions}
              onChange={(e) => setAddForm((f) => ({ ...f, deductions: e.target.value }))} />
          </Field>
          <Field label="Status" htmlFor="histStatus">
            <select id="histStatus" className={SELECT_CLASS} value={addForm.status}
              onChange={(e) => setAddForm((f) => ({ ...f, status: e.target.value }))}>
              {PAYROLL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </form>
      </Modal>
    </div>
  );
}
