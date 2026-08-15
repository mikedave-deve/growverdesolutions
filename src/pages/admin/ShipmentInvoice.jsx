import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Printer, ArrowLeft } from "lucide-react";
import { Button, StatusPill } from "../../components/ui/Primitives.jsx";
import { LoadingState, ErrorState } from "../../components/ui/States.jsx";
import { Logo } from "../../components/brand/Logo.jsx";
import { adminService } from "../../services/adminService.js";
import { useAsync } from "../../hooks/useAsync.js";
import { formatDate } from "../../utils/formatters.js";

// Standalone page — deliberately not wrapped in AdminLayout's sidebar
// and topbar, since this is meant to be printed as a clean document.
export function ShipmentInvoice() {
  const { shipmentId } = useParams();
  const navigate = useNavigate();
  const { data: shipment, status, error, retry } = useAsync(() => adminService.getShipment(shipmentId), [shipmentId]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-50">
        <LoadingState label="Loading invoice…" rows={0} />
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-50">
        <ErrorState message={error.message} onRetry={retry} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-100 py-10 px-4 print:bg-white print:p-0">
      <div className="max-w-3xl mx-auto flex items-center justify-between mb-4 print:hidden">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-ink-700/60 hover:text-ink-900">
          <ArrowLeft size={14} /> Back
        </button>
        <Button size="sm" onClick={() => window.print()}><Printer size={14} /> Print</Button>
      </div>

      <div className="max-w-3xl mx-auto bg-white border border-sand-200 rounded-2xl shadow-card p-10 print:border-0 print:shadow-none print:rounded-none print:p-0">
        <div className="flex items-start justify-between mb-10 pb-8 border-b border-sand-200">
          <Logo />
          <div className="text-right">
            <p className="label-eyebrow mb-1">Shipment Invoice</p>
            <p className="font-mono text-sm text-ink-700/70">{shipment.trackingNumber}</p>
            <p className="text-xs text-ink-700/50 mt-1">Issued {formatDate(new Date())}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-700/50 mb-2">Ship From</p>
            <p className="font-medium">{shipment.senderName}</p>
            <p className="text-sm text-ink-700/70 mt-1">{shipment.originAddress}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-700/50 mb-2">Ship To</p>
            <p className="font-medium">{shipment.receiverName}</p>
            <p className="text-sm text-ink-700/70 mt-1">{shipment.destinationAddress}</p>
          </div>
        </div>

        {shipment.employee && (
          <p className="text-sm text-ink-700/70 mb-8">
            Employee: <span className="font-medium text-ink-900">{shipment.employee.firstName} {shipment.employee.lastName}</span>
            <span className="text-ink-700/40 font-mono"> · {shipment.employee.employeeId}</span>
          </p>
        )}

        <div className="grid sm:grid-cols-3 gap-6 mb-8 py-6 border-y border-sand-200">
          <div><p className="text-xs text-ink-700/50">Shipping date</p><p className="font-medium mt-0.5">{formatDate(shipment.shippingDate)}</p></div>
          <div><p className="text-xs text-ink-700/50">Estimated delivery</p><p className="font-medium mt-0.5">{formatDate(shipment.estimatedDelivery)}</p></div>
          <div><p className="text-xs text-ink-700/50">Transport mode</p><p className="font-medium mt-0.5">{shipment.transportMode}</p></div>
          <div><p className="text-xs text-ink-700/50">Weight</p><p className="font-medium mt-0.5">{shipment.weight || "—"}</p></div>
          <div><p className="text-xs text-ink-700/50">Dimensions</p><p className="font-medium mt-0.5">{shipment.dimensions || "—"}</p></div>
          <div><p className="text-xs text-ink-700/50">Package color</p><p className="font-medium mt-0.5">{shipment.packageColor || "—"}</p></div>
        </div>

        <div className="flex items-center gap-8 mb-8">
          <div><p className="text-xs text-ink-700/50 mb-1.5">Shipment status</p><StatusPill status={shipment.shipmentStatus} /></div>
          <div><p className="text-xs text-ink-700/50 mb-1.5">Payment status</p><StatusPill status={shipment.paymentStatus} /></div>
        </div>

        {shipment.photoUrl && (
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-700/50 mb-2">Package photo</p>
            <img src={shipment.photoUrl} alt="" className="w-full max-w-xs rounded-xl border border-sand-200" />
          </div>
        )}

        <div className="pt-8 border-t border-sand-200 text-xs text-ink-700/50">
          Growverde Solutions — Equipment & Logistics. This document was generated from the employee portal.
        </div>
      </div>
    </div>
  );
}
