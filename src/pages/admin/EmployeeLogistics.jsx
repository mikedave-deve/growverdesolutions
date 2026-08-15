import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Truck, Plus, Pencil, Trash2, Printer, Package } from "lucide-react";
import { SectionHeading, Card, Button, Field, Input, StatusPill } from "../../components/ui/Primitives.jsx";
import { AsyncBoundary, EmptyState } from "../../components/ui/States.jsx";
import { Modal } from "../../components/ui/Modal.jsx";
import { adminService } from "../../services/adminService.js";
import { useAsync } from "../../hooks/useAsync.js";
import { useToast } from "../../context/ToastContext.jsx";
import { formatDate } from "../../utils/formatters.js";
import { ROUTES, adminShipmentInvoicePath } from "../../constants/routes.js";
import { SHIPMENT_STEPS, TRANSPORT_MODES, PAYMENT_STATUSES } from "../../constants/statuses.js";

const SELECT_CLASS = "w-full rounded-lg border border-sand-300 px-3.5 py-2.5 text-sm bg-white";
const FILE_INPUT_CLASS = "w-full text-sm text-ink-700 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-sand-100 file:text-ink-800 file:text-sm file:font-medium hover:file:bg-sand-200";

function emptyForm(receiverName) {
  return {
    trackingNumber: `GV-SHP-${Math.floor(10000 + Math.random() * 90000)}`,
    senderName: "Growverde Solutions Warehouse",
    receiverName: receiverName || "",
    originAddress: "",
    destinationAddress: "",
    currentLocation: "",
    shippingDate: "",
    estimatedDelivery: "",
    weight: "",
    dimensions: "",
    packageColor: "",
    transportMode: "Ground",
    paymentStatus: "Paid",
    shipmentStatus: "Order Created",
    photo: null,
  };
}

function toDateInputValue(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function ShipmentForm({ form, setForm, formId, onSubmit }) {
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <form id={formId} onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
      <Field label="Tracking number" htmlFor="shTracking">
        <Input id="shTracking" value={form.trackingNumber} onChange={set("trackingNumber")} required />
      </Field>
      <Field label="Package photo" htmlFor="shPhoto" hint="Optional, JPG/PNG/WEBP up to 5MB.">
        <input id="shPhoto" type="file" accept="image/jpeg,image/png,image/webp" className={FILE_INPUT_CLASS}
          onChange={(e) => setForm((f) => ({ ...f, photo: e.target.files[0] || null }))} />
      </Field>
      <Field label="Sender name" htmlFor="shSender">
        <Input id="shSender" value={form.senderName} onChange={set("senderName")} required />
      </Field>
      <Field label="Receiver name" htmlFor="shReceiver">
        <Input id="shReceiver" value={form.receiverName} onChange={set("receiverName")} required />
      </Field>
      <Field label="Origin address" htmlFor="shOrigin">
        <Input id="shOrigin" value={form.originAddress} onChange={set("originAddress")} required />
      </Field>
      <Field label="Destination address" htmlFor="shDest">
        <Input id="shDest" value={form.destinationAddress} onChange={set("destinationAddress")} required />
      </Field>
      <Field label="Current location" htmlFor="shLocation" hint="Optional — where it is right now.">
        <Input id="shLocation" value={form.currentLocation} onChange={set("currentLocation")} />
      </Field>
      <Field label="Transport mode" htmlFor="shTransport">
        <select id="shTransport" className={SELECT_CLASS} value={form.transportMode} onChange={set("transportMode")}>
          {TRANSPORT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </Field>
      <Field label="Shipping date" htmlFor="shShipDate">
        <Input id="shShipDate" type="date" value={form.shippingDate} onChange={set("shippingDate")} required />
      </Field>
      <Field label="Estimated delivery" htmlFor="shEstDelivery">
        <Input id="shEstDelivery" type="date" value={form.estimatedDelivery} onChange={set("estimatedDelivery")} required />
      </Field>
      <Field label="Weight" htmlFor="shWeight" hint="e.g. 12 lbs">
        <Input id="shWeight" value={form.weight} onChange={set("weight")} />
      </Field>
      <Field label="Dimensions" htmlFor="shDimensions" hint="e.g. 18 x 14 x 10 in">
        <Input id="shDimensions" value={form.dimensions} onChange={set("dimensions")} />
      </Field>
      <Field label="Package color" htmlFor="shColor">
        <Input id="shColor" value={form.packageColor} onChange={set("packageColor")} />
      </Field>
      <Field label="Payment status" htmlFor="shPayment">
        <select id="shPayment" className={SELECT_CLASS} value={form.paymentStatus} onChange={set("paymentStatus")}>
          {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Shipment status" htmlFor="shStatus">
        <select id="shStatus" className={SELECT_CLASS} value={form.shipmentStatus} onChange={set("shipmentStatus")}>
          {SHIPMENT_STEPS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
    </form>
  );
}

export function EmployeeLogistics() {
  const { id } = useParams();
  const { push } = useToast();
  const employees = useAsync(() => adminService.getEmployees(), []);
  const shipments = useAsync(() => adminService.getEmployeeShipments(id), [id]);

  const employee = employees.data?.users?.find((u) => u.id === id);
  const rows = shipments.data || [];

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm());
  const [creating, setCreating] = useState(false);

  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(null);
  const [removing, setRemoving] = useState(false);

  const openCreate = () => {
    setCreateForm(emptyForm(employee ? `${employee.firstName} ${employee.lastName}` : ""));
    setCreateOpen(true);
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await adminService.createShipment(id, createForm);
      push(`Package ${createForm.trackingNumber} created.`, "success", "Package created");
      setCreateOpen(false);
      shipments.retry();
    } catch (err) {
      push(err.message || "Something went wrong. Please try again.", "error");
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (shipment) => {
    setEditing(shipment);
    setEditForm({
      trackingNumber: shipment.trackingNumber,
      senderName: shipment.senderName,
      receiverName: shipment.receiverName,
      originAddress: shipment.originAddress,
      destinationAddress: shipment.destinationAddress,
      currentLocation: shipment.currentLocation || "",
      shippingDate: toDateInputValue(shipment.shippingDate),
      estimatedDelivery: toDateInputValue(shipment.estimatedDelivery),
      weight: shipment.weight || "",
      dimensions: shipment.dimensions || "",
      packageColor: shipment.packageColor || "",
      transportMode: shipment.transportMode,
      paymentStatus: shipment.paymentStatus,
      shipmentStatus: shipment.shipmentStatus,
      photo: null,
    });
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.updateShipment(editing.id, editForm);
      push(`${editing.trackingNumber} was updated.`, "success", "Package updated");
      setEditing(null);
      shipments.retry();
    } catch (err) {
      push(err.message || "Something went wrong. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setRemoving(true);
    try {
      await adminService.deleteShipment(deleting.id);
      push(`${deleting.trackingNumber} was deleted.`, "success", "Package deleted");
      setDeleting(null);
      shipments.retry();
    } catch (err) {
      push(err.message || "Something went wrong. Please try again.", "error");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div>
      <Link to={ROUTES.ADMIN_EMPLOYEES} className="inline-flex items-center gap-1.5 text-sm text-ink-700/60 hover:text-ink-900 mb-4">
        <ArrowLeft size={14} /> Back to Employees
      </Link>

      <SectionHeading
        eyebrow="Admin"
        title={employee ? `${employee.firstName} ${employee.lastName}'s shipments` : "Employee shipments"}
        description="Equipment & logistics packages — trackable by the employee from their own portal using the tracking number."
        action={<Button size="sm" onClick={openCreate}><Plus size={14} /> Create package</Button>}
      />

      <AsyncBoundary
        status={shipments.status} error={shipments.error} retry={shipments.retry}
        empty={rows.length === 0 && shipments.status === "success" ? (
          <EmptyState icon={Truck} title="No packages yet" description="Create the first package for this employee." />
        ) : null}
      >
        <div className="flex flex-col gap-4">
          {rows.map((s) => (
            <Card key={s.id} className="p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-4">
                  {s.photoUrl ? (
                    <img src={s.photoUrl} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-sand-100 flex items-center justify-center shrink-0">
                      <Package size={22} className="text-ink-700/30" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-mono font-semibold text-sm">{s.trackingNumber}</p>
                      <StatusPill status={s.shipmentStatus} />
                      <StatusPill status={s.paymentStatus} />
                    </div>
                    <p className="text-sm text-ink-800">To {s.receiverName} · {s.destinationAddress}</p>
                    <p className="text-xs text-ink-700/50 mt-1">
                      {s.transportMode} · Ships {formatDate(s.shippingDate)} · Est. delivery {formatDate(s.estimatedDelivery)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button as={Link} to={adminShipmentInvoicePath(s.id)} target="_blank" rel="noreferrer" variant="secondary" size="sm">
                    <Printer size={14} /> Invoice
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => openEdit(s)}>
                    <Pencil size={14} /> Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setDeleting(s)}>
                    <Trash2 size={14} /> Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </AsyncBoundary>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create package"
        maxWidth="max-w-2xl"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button size="sm" form="create-shipment-form" type="submit" disabled={creating}>
              {creating ? "Creating…" : "Create Package"}
            </Button>
          </>
        }
      >
        <ShipmentForm form={createForm} setForm={setCreateForm} formId="create-shipment-form" onSubmit={submitCreate} />
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `Edit ${editing.trackingNumber}` : ""}
        maxWidth="max-w-2xl"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
            <Button size="sm" form="edit-shipment-form" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </>
        }
      >
        {editForm && <ShipmentForm form={editForm} setForm={setEditForm} formId="edit-shipment-form" onSubmit={submitEdit} />}
      </Modal>

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete this package?"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setDeleting(null)}>Cancel</Button>
            <Button variant="danger" size="sm" disabled={removing} onClick={confirmDelete}>
              {removing ? "Deleting…" : "Delete Package"}
            </Button>
          </>
        }
      >
        {deleting && (
          <p className="text-sm text-ink-700/70">
            <strong>{deleting.trackingNumber}</strong> to {deleting.receiverName} will be permanently deleted and
            will no longer be trackable.
          </p>
        )}
      </Modal>
    </div>
  );
}
