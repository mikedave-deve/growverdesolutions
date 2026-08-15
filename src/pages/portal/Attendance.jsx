import React, { useState } from "react";
import { Clock, LogIn, LogOut } from "lucide-react";
import { SectionHeading, Card, Button } from "../../components/ui/Primitives.jsx";
import { AsyncBoundary } from "../../components/ui/States.jsx";
import { DataTable } from "../../components/ui/DataTable.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { attendanceService } from "../../services/attendanceService.js";
import { useToast } from "../../context/ToastContext.jsx";
import { formatDate, formatTime } from "../../utils/formatters.js";

export function Attendance() {
  const { data, status, error, retry } = useAsync(() => attendanceService.getStatus(), []);
  const { push } = useToast();
  const [busy, setBusy] = useState(false);

  const columns = [
    { key: "date", header: "Date", render: (r) => formatDate(r.date) },
    { key: "clockIn", header: "Clock In" },
    { key: "clockOut", header: "Clock Out" },
    { key: "total", header: "Total" },
  ];

  const toggleClock = async () => {
    setBusy(true);
    try {
      if (data.clockedIn) {
        await attendanceService.clockOut();
        push("Clocked out.");
      } else {
        await attendanceService.clockIn();
        push("Clocked in.");
      }
      retry();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <SectionHeading eyebrow="Time & Attendance" title="Attendance" />
      <AsyncBoundary status={status} error={error} retry={retry}>
        {data && (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="p-5 lg:col-span-1 flex flex-col justify-between">
                <div className="flex items-center gap-2 text-ink-700/50 text-xs mb-3"><Clock size={14} /> Current status</div>
                <p className="font-semibold mb-4">{data.clockedIn ? `Clocked in at ${formatTime(data.clockInTime)}` : "Not clocked in"}</p>
                <Button onClick={toggleClock} disabled={busy} variant={data.clockedIn ? "danger" : "primary"} size="sm">
                  {data.clockedIn ? <LogOut size={14} /> : <LogIn size={14} />}
                  {busy ? "Updating…" : data.clockedIn ? "Clock out" : "Clock in"}
                </Button>
              </Card>
              <Card className="p-5"><p className="text-xs text-ink-700/50 mb-2">Today</p><p className="text-2xl font-display font-bold">{data.todayHours}h</p></Card>
              <Card className="p-5"><p className="text-xs text-ink-700/50 mb-2">This week</p><p className="text-2xl font-display font-bold">{data.weeklyHours}h</p></Card>
              <Card className="p-5"><p className="text-xs text-ink-700/50 mb-2">This month</p><p className="text-2xl font-display font-bold">{data.monthlyHours}h</p></Card>
            </div>

            <Card className="p-5">
              <p className="font-semibold mb-4">Attendance history</p>
              <DataTable columns={columns} rows={data.history} />
            </Card>
          </>
        )}
      </AsyncBoundary>
    </div>
  );
}
