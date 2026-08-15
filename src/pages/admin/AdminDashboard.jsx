import React from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  Users, FileText, ClipboardList, Wallet, Truck, ShieldCheck, Bell, ScrollText, UserCheck, ArrowRight,
} from "lucide-react";
import { ROUTES } from "../../constants/routes.js";
import { Card, Badge, SectionHeading } from "../../components/ui/Primitives.jsx";
import { formatDate } from "../../utils/formatters.js";

// Modules not built yet — shown honestly as "Coming soon" rather than
// fabricated numbers, now that Pending Approvals and Employees above
// are real data.
const COMING_SOON = [
  { icon: FileText, label: "Documents" },
  { icon: ClipboardList, label: "Missions" },
  { icon: Wallet, label: "Payroll" },
  { icon: Truck, label: "Logistics" },
  { icon: ShieldCheck, label: "Verification Review" },
  { icon: Bell, label: "Broadcast Notifications" },
  { icon: ScrollText, label: "Audit Logs" },
];

export function AdminDashboard() {
  const { user, pending } = useOutletContext();
  const users = pending.data?.users || [];

  return (
    <div>
      <SectionHeading
        eyebrow="Admin"
        title={`Welcome, ${user.firstName}`}
        description="Review new registrations and manage the Growverde Solutions workforce."
      />

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Link to={ROUTES.ADMIN_PENDING} className="block">
          <Card className="p-6 h-full hover:border-forest-400 transition-colors">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center shrink-0">
                  <UserCheck size={20} />
                </div>
                <div>
                  <p className="font-semibold">Pending Approvals</p>
                  <p className="text-sm text-ink-700/60">
                    {pending.status === "loading" ? "Loading…" : `${users.length} registration${users.length === 1 ? "" : "s"} awaiting review`}
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-forest-700 flex items-center gap-1">
                Review now <ArrowRight size={15} />
              </span>
            </div>

            {users.length > 0 && (
              <div className="mt-5 pt-5 border-t border-sand-100 flex flex-col gap-2.5">
                {users.slice(0, 3).map((u) => (
                  <div key={u.id} className="flex items-center justify-between text-sm">
                    <span className="text-ink-800">{u.firstName} {u.lastName} <span className="text-ink-700/40">· {u.email}</span></span>
                    <span className="text-xs text-ink-700/50">{formatDate(u.startDate)}</span>
                  </div>
                ))}
                {users.length > 3 && (
                  <p className="text-xs text-ink-700/50">+{users.length - 3} more</p>
                )}
              </div>
            )}
          </Card>
        </Link>

        <Link to={ROUTES.ADMIN_EMPLOYEES} className="block">
          <Card className="p-6 h-full hover:border-forest-400 transition-colors">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center shrink-0">
                  <Users size={20} />
                </div>
                <div>
                  <p className="font-semibold">Employees</p>
                  <p className="text-sm text-ink-700/60">Manage employment status, department, manager, location, and start date</p>
                </div>
              </div>
              <span className="text-sm font-medium text-forest-700 flex items-center gap-1">
                Manage <ArrowRight size={15} />
              </span>
            </div>
          </Card>
        </Link>
      </div>

      
      
    </div>
  );
}
