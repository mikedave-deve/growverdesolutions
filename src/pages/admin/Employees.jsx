import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Users, Pencil, FileText, ClipboardList, Wallet, Truck } from "lucide-react";
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
    </div>
  );
}
