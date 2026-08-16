import React, { useState } from "react";
import { CheckCircle2, Search, ChevronDown, AlertCircle } from "lucide-react";
import { SectionHeading, Card, StatusPill, Button, Field, Input } from "../../components/ui/Primitives.jsx";
import { LoadingState } from "../../components/ui/States.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { logisticsService } from "../../services/logisticsService.js";
import { formatDate } from "../../utils/formatters.js";
import { SHIPMENT_BASE_STEPS } from "../../constants/statuses.js";

// Where each exception status attaches onto the base path — the last
// base step a shipment would have reached before that exception applied.
const HOLD_ANCHOR = "In Transit";
const RETURNED_ANCHOR = "Out for Delivery";

// Steps reached so far. "On Hold" / "Returned" are appended onto the
// base path only when that's the shipment's actual current status —
// every other shipment's track never mentions them at all.
function reachedSteps(status) {
  if (status === "On Hold") {
    return [...SHIPMENT_BASE_STEPS.slice(0, SHIPMENT_BASE_STEPS.indexOf(HOLD_ANCHOR) + 1), "On Hold"];
  }
  if (status === "Returned") {
    return [...SHIPMENT_BASE_STEPS.slice(0, SHIPMENT_BASE_STEPS.indexOf(RETURNED_ANCHOR) + 1), "Returned"];
  }
  return SHIPMENT_BASE_STEPS.slice(0, SHIPMENT_BASE_STEPS.indexOf(status) + 1);
}

function InfoRow({ label, value, mono }) {
  return (
    <div>
      <p className="text-xs text-ink-700/50">{label}</p>
      <p className={`mt-0.5 ${mono ? "font-mono" : "font-medium"}`}>{value}</p>
    </div>
  );
}

function ShipmentProgress({ data }) {
  const steps = reachedSteps(data.shipmentStatus);
  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6">
      <Card className="p-6 md:p-8">
        <p className="font-semibold mb-6">Shipment progress</p>
        <ol className="space-y-0">
          {steps.map((s, i) => (
            <li key={s} className="flex gap-3">
              <div className="flex flex-col items-center">
                <CheckCircle2 size={18} className="text-forest-600" />
                {i < steps.length - 1 && <div className="w-px flex-1 min-h-6 bg-forest-300" />}
              </div>
              <p className="pb-6 text-sm text-ink-900 font-medium">{s}</p>
            </li>
          ))}
        </ol>
      </Card>

      <div className="space-y-6">
        {data.photoUrl && (
          <Card className="p-3">
            <img src={data.photoUrl} alt="Package" className="w-full aspect-video object-cover rounded-xl" />
          </Card>
        )}

        <Card className="p-6 h-fit">
          <p className="font-semibold mb-4">Shipment details</p>
          <div className="space-y-3 text-sm">
            <InfoRow label="Tracking number" value={data.trackingNumber} mono />
            <InfoRow label="Sender" value={data.senderName} />
            <InfoRow label="Receiver" value={data.receiverName} />
            <InfoRow label="Origin" value={data.originAddress} />
            <InfoRow label="Destination" value={data.destinationAddress} />
            {data.currentLocation && <InfoRow label="Current location" value={data.currentLocation} />}
            <InfoRow label="Shipped" value={formatDate(data.shippingDate)} />
            <InfoRow label="Estimated delivery" value={formatDate(data.estimatedDelivery)} />
            {data.weight && <InfoRow label="Weight" value={data.weight} />}
            {data.dimensions && <InfoRow label="Dimensions" value={data.dimensions} />}
            {data.packageColor && <InfoRow label="Package color" value={data.packageColor} />}
            <InfoRow label="Transport mode" value={data.transportMode} />
            <div className="flex items-center justify-between">
              <p className="text-xs text-ink-700/50">Payment status</p>
              <StatusPill status={data.paymentStatus} />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-ink-700/50">Status</p>
              <StatusPill status={data.shipmentStatus} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function TrackedResult({ trackingNumber }) {
  const [expanded, setExpanded] = useState(true);
  const { data, status, error, retry } = useAsync(() => logisticsService.trackShipment(trackingNumber), [trackingNumber]);

  if (status === "loading") return <LoadingState label="Looking up tracking number…" rows={2} />;
  if (status === "error") {
    return (
      <Card className="p-6 flex items-start gap-3">
        <AlertCircle size={18} className="text-signal-error shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-sm">{error.message}</p>
          <button onClick={retry} className="text-xs font-medium text-forest-700 hover:underline mt-1">Try again</button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Card className="p-4 mb-4">
        <button onClick={() => setExpanded((e) => !e)} className="w-full flex items-center justify-between gap-4">
          <div className="text-left">
            <p className="text-xs text-ink-700/50">Tracking number</p>
            <p className="font-mono text-sm font-medium">{data.trackingNumber}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusPill status={data.shipmentStatus} />
            <ChevronDown size={16} className={`text-ink-700/40 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </div>
        </button>
      </Card>
      {expanded && <ShipmentProgress data={data} />}
    </div>
  );
}

export function Logistics() {
  const [trackingInput, setTrackingInput] = useState("");
  const [searchedFor, setSearchedFor] = useState(null);

  const onTrack = (e) => {
    e.preventDefault();
    if (!trackingInput.trim()) return;
    setSearchedFor(trackingInput.trim());
  };

  return (
    <div>
      <SectionHeading eyebrow="Equipment & Logistics" title="Equipment & logistics" />

      <Card className="p-6 mb-8">
        <p className="font-semibold mb-1">Track your shipment</p>
        <p className="text-sm text-ink-700/60 mb-4">Enter your tracking number below to view your real-time status.</p>
        <form onSubmit={onTrack} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Field htmlFor="tracking">
              <Input id="tracking" aria-label="Tracking number" placeholder="e.g. GV-SHP-88213" value={trackingInput} onChange={(e) => setTrackingInput(e.target.value)} />
            </Field>
          </div>
          <Button type="submit" className="sm:mt-0"><Search size={15} /> Track</Button>
        </form>
      </Card>

      {searchedFor && <TrackedResult trackingNumber={searchedFor} />}
    </div>
  );
}
