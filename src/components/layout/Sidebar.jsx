import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid, User, FileText, ClipboardList, History, Clock, SlidersHorizontal,
  ShieldCheck, Wallet, Truck, Bell, Settings, LifeBuoy, KeyRound, PiggyBank, LogOut, X,
} from "lucide-react";
import { ROUTES } from "../../constants/routes.js";
import { Logo } from "../brand/Logo.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

const NAV = [
  { to: ROUTES.DASHBOARD, label: "Dashboard", icon: LayoutGrid, end: true },
  { to: ROUTES.PROFILE, label: "Profile", icon: User },
  { to: ROUTES.DOCUMENTS, label: "Documents", icon: FileText },
  { to: ROUTES.MISSIONS, label: "Missions & Instructions", icon: ClipboardList },
  { to: ROUTES.ATTENDANCE, label: "Time & Attendance", icon: Clock },
  { to: ROUTES.ACTIVITY, label: "Activity History", icon: History },
  { to: ROUTES.INFO_SETUP, label: "Information Setup", icon: SlidersHorizontal },
  { to: ROUTES.VERIFICATION, label: "Identity Verification", icon: ShieldCheck },
  { to: ROUTES.PAYROLL, label: "Payroll", icon: Wallet },
  { to: ROUTES.LOGISTICS, label: "Equipment & Logistics", icon: Truck },
  { to: ROUTES.COMPANY_SERVICES, label: "Company Services", icon: KeyRound },
  { to: ROUTES.RETIREMENT_BENEFITS, label: "401(k) Retirement Benefits", icon: PiggyBank },
  { to: ROUTES.NOTIFICATIONS, label: "Notifications", icon: Bell },
];

const FOOTER_NAV = [
  { to: ROUTES.SETTINGS, label: "Settings", icon: Settings },
  { to: ROUTES.SUPPORT, label: "Support", icon: LifeBuoy },
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

export function Sidebar({ mobileOpen, onCloseMobile }) {
  const { logout } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    onCloseMobile?.();
    await logout();
    push("You've been signed out.");
    navigate(ROUTES.LOGIN);
  };

  const content = (
    <div className="flex flex-col h-full bg-ink-900 text-white w-64 shrink-0">
      <div className="px-5 py-6 flex items-center justify-between">
        <Logo tone="light" />
        <button className="md:hidden text-white/70" onClick={onCloseMobile} aria-label="Close navigation">
          <X size={20} />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 space-y-1">
        {NAV.map((item) => <NavItem key={item.to} {...item} onClick={onCloseMobile} />)}
      </nav>
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        {FOOTER_NAV.map((item) => <NavItem key={item.to} {...item} onClick={onCloseMobile} />)}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-ink-100/80 hover:bg-ink-800 hover:text-white"
        >
          <LogOut size={17} strokeWidth={2} className="shrink-0" />
          <span className="truncate">Log Out</span>
        </button>
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
