import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Users, Pencil, FileText, ClipboardList, Wallet, Truck, KeyRound, Copy, Check, Trash2 } from "lucide-react";
import { SectionHeading, Card, Button, Field, Input, StatusPill } from "../../components/ui/Primitives.jsx";
import { AsyncBoundary, EmptyState } from "../../components/ui/States.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { adminService } from "../../services/adminService.js";
import { useAsync } from "../../hooks/useAsync.js";
import { useToast } from "../../context/ToastContext.jsx";
import { formatDate } from "../../utils/formatters.js";
import { EMPLOYMENT_STATUS } from "../../constants/statuses.js";
import {
  adminEmployeeDocumentsPath, adminEmployeeMissionsPath, adminEmployeePayrollPath, adminEmployeeLogisticsPath,
} from "../../constants/routes.js";

function toDateInputValue(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function Employees() {
  const employees = useAsync(() => adminService.getEmployees(), []);
  const { push } = useToast();
  const [editing, setEditing] = useState(null); // the employee row being edited
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(null); // employee row a reset is in flight/result for
  const [resetResult, setResetResult] = useState(null); // { employee, tempPassword }
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(null); // the employee row pending delete confirmation
  const [removing, setRemoving] = useState(false);

  const users = employees.data?.users || [];

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      employmentStatus: row.employmentStatus,
      department: row.department || "",
      manager: row.manager || "",
      location: row.location || "",
      startDate: toDateInputValue(row.startDate),
    });
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  // There's no way to look up a user's existing password — it's
  // hashed, not stored anywhere in reversible form. This issues a
  // brand-new temporary one instead, shown once so the admin can hand
  // it to the employee directly.
  const resetPassword = async (row) => {
    setResetting(row.id);
    try {
      const { tempPassword } = await adminService.resetEmployeePassword(row.id);
      setResetResult({ employee: row, tempPassword });
      setCopied(false);
    } catch (err) {
      push(err.message || "Something went wrong. Please try again.", "error");
    } finally {
      setResetting(null);
    }
  };

  const copyTempPassword = async () => {
    await navigator.clipboard.writeText(resetResult.tempPassword);
    setCopied(true);
  };

  const confirmDelete = async () => {
    setRemoving(true);
    try {
      await adminService.deleteUser(deleting.id);
      push(`${deleting.firstName} ${deleting.lastName}'s account was deleted.`, "success", "Employee deleted");
      setDeleting(null);
      employees.retry();
    } catch (err) {
      push(err.message || "Something went wrong. Please try again.", "error");
    } finally {
      setRemoving(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.updateEmployeeProfile(editing.id, form);
      push(`${editing.firstName} ${editing.lastName}'s employment details were updated.`, "success", "Employee updated");
      setEditing(null);
      employees.retry();
    } catch (err) {
      push(err.message || "Something went wrong. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: "name", header: "Name", render: (r) => (
      <div>
        <p className="font-medium">{r.firstName} {r.lastName}</p>
        <p className="text-xs text-ink-700/50 font-mono">{r.employeeId}</p>
      </div>
    ) },
    { key: "email", header: "Email", render: (r) => <span className="text-ink-700/80">{r.email}</span> },
    { key: "department", header: "Department", render: (r) => r.department || "—" },
    { key: "manager", header: "Manager", render: (r) => r.manager || "—" },
    { key: "location", header: "Location", render: (r) => r.location || "—" },
    { key: "employmentStatus", header: "Status", render: (r) => <StatusPill status={r.employmentStatus} /> },
    { key: "startDate", header: "Start date", render: (r) => formatDate(r.startDate) },
    { key: "actions", header: "", render: (r) => (
      <div className="flex flex-wrap gap-2 justify-end md:justify-start">
        <Button as={Link} to={adminEmployeeMissionsPath(r.id)} variant="secondary" size="sm">
          <ClipboardList size={14} /> Missions
        </Button>
        <Button as={Link} to={adminEmployeeDocumentsPath(r.id)} variant="secondary" size="sm">
          <FileText size={14} /> Documents
        </Button>
        <Button as={Link} to={adminEmployeePayrollPath(r.id)} variant="secondary" size="sm">
          <Wallet size={14} /> Payroll
        </Button>
        <Button as={Link} to={adminEmployeeLogisticsPath(r.id)} variant="secondary" size="sm">
          <Truck size={14} /> Logistics
        </Button>
        <Button variant="secondary" size="sm" onClick={() => openEdit(r)}>
          <Pencil size={14} /> Edit
        </Button>
        <Button variant="secondary" size="sm" onClick={() => resetPassword(r)} disabled={resetting === r.id}>
          <KeyRound size={14} /> {resetting === r.id ? "Resetting…" : "Reset password"}
        </Button>
        <Button variant="danger" size="sm" onClick={() => setDeleting(r)}>
          <Trash2 size={14} /> Delete
        </Button>
      </div>
    ) },
  ];

  return (
    <div>
      <SectionHeading
        eyebrow="Admin"
        title="Employees"
        description="Employment status, department, manager, location, and start date — set here, and reflected read-only on the employee's own profile."
      />

      <AsyncBoundary
        status={employees.status} error={employees.error} retry={employees.retry}
        empty={users.length === 0 && employees.status === "success" ? (
          <EmptyState icon={Users} title="No employees yet" description="Approved employees will show up here." />
        ) : null}
      >
        <Card className="p-5">
          <DataTable columns={columns} rows={users} keyField="id" />
        </Card>
      </AsyncBoundary>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `Edit ${editing.firstName} ${editing.lastName}` : ""}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
            <Button size="sm" form="employee-edit-form" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </>
        }
      >
        {form && (
          <form id="employee-edit-form" onSubmit={save} className="space-y-4">
            <Field label="Employment status" htmlFor="empStatus">
              <select
                id="empStatus"
                value={form.employmentStatus}
                onChange={set("employmentStatus")}
                className="w-full rounded-lg border border-sand-300 px-3.5 py-2.5 text-sm bg-white"
              >
                {EMPLOYMENT_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Department" htmlFor="empDept">
              <Input id="empDept" value={form.department} onChange={set("department")} />
            </Field>
            <Field label="Manager" htmlFor="empManager">
              <Input id="empManager" value={form.manager} onChange={set("manager")} />
            </Field>
            <Field label="Location" htmlFor="empLocation">
              <Input id="empLocation" value={form.location} onChange={set("location")} />
            </Field>
            <Field label="Start date" htmlFor="empStartDate">
              <Input id="empStartDate" type="date" value={form.startDate} onChange={set("startDate")} />
            </Field>
          </form>
        )}
      </Modal>

      <Modal
        open={!!resetResult}
        onClose={() => setResetResult(null)}
        title={resetResult ? `New password for ${resetResult.employee.firstName} ${resetResult.employee.lastName}` : ""}
        footer={<Button size="sm" onClick={() => setResetResult(null)}>Done</Button>}
      >
        {resetResult && (
          <div className="space-y-4">
            <p className="text-sm text-ink-700/70">
              Share this with {resetResult.employee.firstName} directly (in person, phone, or a secure message).
              It won't be shown again — generate a new one if it's lost.
            </p>
            <div className="flex items-center gap-2">
              <Input readOnly value={resetResult.tempPassword} className="font-mono" onFocus={(e) => e.target.select()} />
              <Button type="button" variant="secondary" size="sm" onClick={copyTempPassword}>
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="text-xs text-ink-700/50">
              {resetResult.employee.firstName}'s previous password no longer works.
            </p>
          </div>
        )}
      </Modal>

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete this employee?"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="danger" size="sm" disabled={removing} onClick={confirmDelete}>
              {removing ? "Deleting…" : "Delete Employee"}
            </Button>
          </>
        }
      >
        {deleting && (
          <p className="text-sm text-ink-700/70">
            <strong>{deleting.firstName} {deleting.lastName}</strong>'s account will be permanently deleted,
            along with their documents, missions, attendance, payroll, and activity history. This can't be undone.
          </p>
        )}
      </Modal>
    </div>
  );
}
