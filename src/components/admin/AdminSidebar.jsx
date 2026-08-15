import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutGrid, UserCheck, LayoutDashboard, Users, X } from "lucide-react";
import { ROUTES } from "../../constants/routes.js";
import { Logo } from "../brand/Logo.jsx";

const NAV = [
  { to: ROUTES.ADMIN, label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: ROUTES.ADMIN_PENDING, label: "Pending Approvals", icon: UserCheck },
  { to: ROUTES.ADMIN_EMPLOYEES, label: "Employees", icon: Users },
];

const FOOTER_NAV = [
  { to: ROUTES.DASHBOARD, label: "Employee Portal", icon: LayoutGrid },
];

function NavItem({ to, label, icon: Icon, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
          isActive ? "bg-forest-700 text-white" : "text-ink-100/80 hover:bg-ink-800 hover:text-white"
        }`
      }
    >
      <Icon size={17} strokeWidth={2} className="shrink-0" />
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

// Same shell as the employee Sidebar (dark ink background, same nav
// item styling) so the admin area reads as one product, not a
// bolted-on tool.
export function AdminSidebar({ mobileOpen, onCloseMobile, pendingCount = 0 }) {
  const content = (
    <div className="flex flex-col h-full bg-ink-900 text-white w-64 shrink-0">
      <div className="px-5 py-6 flex items-center justify-between">
        <Logo tone="light" />
        <button className="md:hidden text-white/70" onClick={onCloseMobile} aria-label="Close navigation">
          <X size={20} />
        </button>
      </div>
      <div className="px-5 pb-3">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-white/40">Administrator</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 space-y-1">
        {NAV.map((item) => (
          <div key={item.to} className="relative">
            <NavItem {...item} onClick={onCloseMobile} />
            {item.to === ROUTES.ADMIN_PENDING && pendingCount > 0 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-gold-500 text-ink-900 text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center pointer-events-none">
                {pendingCount}
              </span>
            )}
          </div>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        {FOOTER_NAV.map((item) => <NavItem key={item.to} {...item} onClick={onCloseMobile} />)}
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden md:block h-screen sticky top-0">{content}</aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-ink-900/50" onClick={onCloseMobile} aria-hidden="true" />
          <div className="relative h-full">{content}</div>
        </div>
      )}
    </>
  );
}
