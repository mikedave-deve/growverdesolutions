import React from "react";
import { Link, useOutletContext } from "react-router-dom";
import { FileText, Wallet, Truck, ArrowRight, Clock } from "lucide-react";
import { ROUTES } from "../../constants/routes.js";
import { Card, Button, StatusPill, SectionHeading } from "../../components/ui/Primitives.jsx";
import { AsyncBoundary } from "../../components/ui/States.jsx";
import { useAsync } from "../../hooks/useAsync.js";
import { missionService } from "../../services/missionService.js";
import { documentService } from "../../services/documentService.js";
import { attendanceService } from "../../services/attendanceService.js";
import { activityService } from "../../services/activityService.js";
import { payrollService } from "../../services/payrollService.js";
import { logisticsService } from "../../services/logisticsService.js";
import { formatCurrency, formatDate } from "../../utils/formatters.js";

export function Dashboard() {
  const { user } = useOutletContext();
  const activity = useAsync(() => activityService.getActivity(), []);
  const documents = useAsync(() => documentService.getDocuments(), []);
  const missions = useAsync(() => missionService.getMissions(), []);
  const attendance = useAsync(() => attendanceService.getStatus(), []);
  const payroll = useAsync(() => payrollService.getCurrentPay(), []);
  const equipment = useAsync(() => logisticsService.getMyShipment(), []);
  const openTasks = (missions.data || []).filter((m) => m.status !== "Completed").length;

  return (
    <div>
      <SectionHeading
        eyebrow="Employee Portal"
        title={`Good to see you, ${user.firstName}`}
        description={`${user.jobTitle} · ${user.department} · Employee ID ${user.employeeId}`}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-5">
          <div className="flex items-center gap-2 text-ink-700/50 text-xs mb-2"><Clock size={14} /> Attendance</div>
          <p className="font-semibold">
            {attendance.status === "loading" ? "Loading…" : attendance.data?.clockedIn ? "Clocked In" : "Clocked Out"}
          </p>
          <p className="text-xs text-ink-700/50 mt-1">
            {attendance.status === "loading" ? "" : `${attendance.data?.todayHours ?? 0}h today`}
          </p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-ink-700/50 text-xs mb-2"><Wallet size={14} /> Next Pay</div>
          <p className="font-semibold">
            {payroll.status === "loading" ? "Loading…" : payroll.data?.nextPayDate ? formatDate(payroll.data.nextPayDate) : "Not scheduled"}
          </p>
          <p className="text-xs text-ink-700/50 mt-1">
            {payroll.status === "loading" ? "" : formatCurrency(payroll.data?.grossPay ?? 0)}
          </p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-ink-700/50 text-xs mb-2"><Truck size={14} /> Equipment</div>
          <p className="font-semibold">
            {equipment.status === "loading" ? "Loading…" : equipment.data ? equipment.data.shipmentStatus : "Nothing shipped"}
          </p>
          <p className="text-xs text-ink-700/50 mt-1">
            {equipment.status === "loading" || !equipment.data ? "" : `Est. ${formatDate(equipment.data.estimatedDelivery)}`}
          </p>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-ink-700/50 text-xs mb-2"><FileText size={14} /> Open Tasks</div>
          <p className="font-semibold">{missions.status === "loading" ? "Loading…" : `${openTasks} outstanding`}</p>
          <Link to={ROUTES.MISSIONS} className="text-xs text-forest-700 font-medium hover:underline mt-1 inline-block">Review missions</Link>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold">Recent activity</p>
            <Link to={ROUTES.ACTIVITY} className="text-xs text-forest-700 font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <AsyncBoundary {...activity} loadingRows={4}>
            <ul className="space-y-3">
              {activity.data?.slice(0, 4).map((a) => (
                <li key={a.id} className="flex items-center justify-between text-sm">
                  <span className="text-ink-800">{a.activity}</span>
                  <span className="text-ink-700/50 text-xs">{formatDate(a.date)}</span>
                </li>
              ))}
            </ul>
          </AsyncBoundary>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold">Recent documents</p>
            <Link to={ROUTES.DOCUMENTS} className="text-xs text-forest-700 font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <AsyncBoundary {...documents} loadingRows={4}>
            <ul className="space-y-3">
              {documents.data?.slice(0, 4).map((d) => (
                <li key={d.id} className="flex items-center justify-between text-sm gap-3">
                  <span className="text-ink-800 truncate">{d.name}</span>
                  <StatusPill status={d.status} />
                </li>
              ))}
            </ul>
          </AsyncBoundary>
        </Card>
      </div>
    </div>
  );
}
