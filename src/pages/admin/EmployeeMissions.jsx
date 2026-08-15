import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ClipboardList, Send } from "lucide-react";
import { SectionHeading, Card, Badge, StatusPill, Button, Field, Input } from "../../components/ui/Primitives.jsx";
import { AsyncBoundary, EmptyState } from "../../components/ui/States.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { adminService } from "../../services/adminService.js";
import { useAsync } from "../../hooks/useAsync.js";
import { useToast } from "../../context/ToastContext.jsx";
import { formatDate } from "../../utils/formatters.js";
import { ROUTES } from "../../constants/routes.js";

const PRIORITY_TONE = { High: "error", Medium: "warning", Low: "neutral" };
const PRIORITIES = ["High", "Medium", "Low"];

function emptyForm(employee) {
  return {
    title: "",
    description: "",
    department: employee?.department || "",
    priority: "Medium",
    deadline: "",
  };
}

export function EmployeeMissions() {
  const { id } = useParams();
  const { push } = useToast();
  const employees = useAsync(() => adminService.getEmployees(), []);
  const missions = useAsync(() => adminService.getEmployeeMissions(id), [id]);

  const employee = employees.data?.users?.find((u) => u.id === id);
  const rows = missions.data || [];

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [sending, setSending] = useState(false);

  const openSend = () => {
    setForm(emptyForm(employee));
    setOpen(true);
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await adminService.sendMission(id, form);
      push(
        `"${form.title}" was sent to ${employee ? `${employee.firstName} ${employee.lastName}` : "this employee"}.`,
        "success",
        "Instruction sent"
      );
      setOpen(false);
      missions.retry();
    } catch (err) {
      push(err.message || "Something went wrong. Please try again.", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <Link to={ROUTES.ADMIN_EMPLOYEES} className="inline-flex items-center gap-1.5 text-sm text-ink-700/60 hover:text-ink-900 mb-4">
        <ArrowLeft size={14} /> Back to Employees
      </Link>

      <SectionHeading
        eyebrow="Admin"
        title={employee ? `Instructions for ${employee.firstName} ${employee.lastName}` : "Missions & Instructions"}
        description="Send a task or notice — it appears immediately on their Missions & Instructions page."
        action={<Button size="sm" onClick={openSend}><Send size={14} /> Send instruction</Button>}
      />

      <AsyncBoundary
        status={missions.status} error={missions.error} retry={missions.retry}
        empty={rows.length === 0 && missions.status === "success" ? (
          <EmptyState icon={ClipboardList} title="Nothing sent yet" description="Send the first instruction to this employee." />
        ) : null}
      >
        <div className="flex flex-col gap-4">
          {rows.map((m) => (
            <Card key={m.id} className="p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <Badge tone={PRIORITY_TONE[m.priority]}>{m.priority} priority</Badge>
                    <StatusPill status={m.status} />
                  </div>
                  <p className="font-semibold">{m.title}</p>
                  <p className="text-sm text-ink-700/60 mt-1 max-w-xl">{m.description}</p>
                </div>
                <div className="text-right text-xs text-ink-700/50 shrink-0">
                  <p>From {m.sender}</p>
                  {m.department && <p className="mt-1">{m.department}</p>}
                  <p className="mt-1">Due {formatDate(m.deadline)}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </AsyncBoundary>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Send instruction"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" form="send-mission-form" type="submit" disabled={sending}>
              {sending ? "Sending…" : "Send"}
            </Button>
          </>
        }
      >
        <form id="send-mission-form" onSubmit={submit} className="space-y-4">
          <Field label="Title" htmlFor="msnTitle">
            <Input id="msnTitle" value={form.title} onChange={set("title")} required />
          </Field>
          <Field label="Instructions" htmlFor="msnDescription">
            <textarea
              id="msnDescription"
              value={form.description}
              onChange={set("description")}
              required
              rows={4}
              className="w-full rounded-lg border border-sand-300 px-3.5 py-2.5 text-sm bg-white placeholder:text-ink-700/40 focus:border-forest-500"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Department" htmlFor="msnDepartment">
              <Input id="msnDepartment" value={form.department} onChange={set("department")} />
            </Field>
            <Field label="Priority" htmlFor="msnPriority">
              <select
                id="msnPriority"
                value={form.priority}
                onChange={set("priority")}
                className="w-full rounded-lg border border-sand-300 px-3.5 py-2.5 text-sm bg-white"
              >
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Date" htmlFor="msnDeadline" hint="When this is due.">
            <Input id="msnDeadline" type="date" value={form.deadline} onChange={set("deadline")} required />
          </Field>
        </form>
      </Modal>
    </div>
  );
}
