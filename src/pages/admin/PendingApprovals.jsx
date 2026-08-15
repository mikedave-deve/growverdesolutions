import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { UserCheck, Check, X as XIcon } from "lucide-react";
import { SectionHeading, Card, Button } from "../../components/ui/Primitives.jsx";
import { AsyncBoundary, EmptyState } from "../../components/ui/States.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { adminService } from "../../services/adminService.js";
import { formatDate } from "../../utils/formatters.js";
import { useToast } from "../../context/ToastContext.jsx";

export function PendingApprovals() {
  const { pending } = useOutletContext();
  const { push } = useToast();
  const [confirm, setConfirm] = useState(null); // { action: 'approve'|'reject', user }
  const [working, setWorking] = useState(false);

  const users = pending.data?.users || [];

  const runConfirm = async () => {
    if (!confirm) return;
    setWorking(true);
    try {
      if (confirm.action === "approve") {
        const { emailSent } = await adminService.approveUser(confirm.user.id);
        const name = `${confirm.user.firstName} ${confirm.user.lastName}`;
        if (emailSent) {
          push(`${name} can now sign in. A confirmation email is on its way to ${confirm.user.email}.`, "success", "Registration approved");
        } else {
          push(`${name} can now sign in, but the confirmation email couldn't be sent — let them know directly.`, "warning", "Approved — email failed");
        }
      } else {
        await adminService.rejectUser(confirm.user.id);
        push(`${confirm.user.firstName} ${confirm.user.lastName}'s registration was rejected.`, "success", "Registration rejected");
      }
      setConfirm(null);
      pending.retry();
    } catch (err) {
      push(err.message || "Something went wrong. Please try again.", "error");
    } finally {
      setWorking(false);
    }
  };

  const columns = [
    { key: "name", header: "Name", render: (r) => (
      <div>
        <p className="font-medium">{r.firstName} {r.lastName}</p>
        <p className="text-xs text-ink-700/50 font-mono">{r.employeeId}</p>
      </div>
    ) },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone", render: (r) => r.phone || "—" },
    { key: "startDate", header: "Submitted", render: (r) => formatDate(r.startDate) },
    { key: "actions", header: "", render: (r) => (
      <div className="flex gap-2 justify-end md:justify-start">
        <Button size="sm" onClick={() => setConfirm({ action: "approve", user: r })}>
          <Check size={14} /> Approve
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setConfirm({ action: "reject", user: r })}>
          <XIcon size={14} /> Reject
        </Button>
      </div>
    ) },
  ];

  return (
    <div>
      <SectionHeading
        eyebrow="Admin"
        title="Pending Approvals"
        description="New employee registrations awaiting review. Approving sends the employee a branded email letting them know they can sign in."
      />

      <AsyncBoundary
        status={pending.status} error={pending.error} retry={pending.retry}
        empty={users.length === 0 && pending.status === "success" ? (
          <EmptyState icon={UserCheck} title="No pending registrations" description="New sign-ups will show up here for review." />
        ) : null}
      >
        <Card className="p-5">
          <DataTable columns={columns} rows={users} keyField="id" />
        </Card>
      </AsyncBoundary>

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title={confirm?.action === "approve" ? "Approve this account?" : "Reject this account?"}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button
              size="sm"
              variant={confirm?.action === "reject" ? "danger" : "primary"}
              disabled={working}
              onClick={runConfirm}
            >
              {working ? "Working…" : confirm?.action === "approve" ? "Approve & Notify" : "Reject"}
            </Button>
          </>
        }
      >
        {confirm && (
          <p className="text-sm text-ink-700/70">
            {confirm.action === "approve" ? (
              <>
                <strong>{confirm.user.firstName} {confirm.user.lastName}</strong> ({confirm.user.email}) will be
                approved and immediately emailed a notification that they can sign in.
              </>
            ) : (
              <>
                <strong>{confirm.user.firstName} {confirm.user.lastName}</strong> ({confirm.user.email}) will be
                marked as rejected and will not be able to sign in.
              </>
            )}
          </p>
        )}
      </Modal>
    </div>
  );
}
