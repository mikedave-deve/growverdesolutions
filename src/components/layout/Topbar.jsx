import React, { useEffect, useRef, useState } from "react";
import { Menu, Bell, ChevronDown, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../../constants/routes.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { useNotifications } from "../../context/NotificationsContext.jsx";

export function Topbar({ user, onMenuClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { logout } = useAuth();
  const { push } = useToast();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    push("You've been signed out.");
    navigate(ROUTES.LOGIN);
  };

  return (
    <header className="h-16 border-b border-sand-200 bg-white/80 backdrop-blur sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
      <button className="md:hidden p-2 -ml-2 text-ink-800" onClick={onMenuClick} aria-label="Open navigation">
        <Menu size={20} />
      </button>
      <div className="hidden md:block" />
      <div className="flex items-center gap-4">
        <Link to={ROUTES.NOTIFICATIONS} className="relative p-2 text-ink-700 hover:text-forest-700" aria-label="Notifications">
          <Bell size={19} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-signal-error" aria-hidden="true" />
          )}
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-haspopup="true"
            aria-expanded={menuOpen}
            className="flex items-center gap-2.5 pl-3 border-l border-sand-200"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-forest-100 text-forest-700 text-xs font-semibold flex items-center justify-center">
                {user?.avatarInitials || "—"}
              </div>
            )}
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-sm font-medium text-ink-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-ink-700/50">{user?.jobTitle}</p>
            </div>
            <ChevronDown size={14} className={`text-ink-700/40 hidden sm:block transition-transform ${menuOpen ? "rotate-180" : ""}`} />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full mt-2 w-52 bg-white border border-sand-200 rounded-xl shadow-popover py-1.5 z-40"
            >
              <Link
                to={ROUTES.PROFILE}
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink-800 hover:bg-sand-50"
              >
                <User size={15} className="text-ink-700/50" /> View Profile
              </Link>
              <div className="h-px bg-sand-100 my-1" />
              <button
                role="menuitem"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-signal-error hover:bg-signal-errorBg"
              >
                <LogOut size={15} /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
