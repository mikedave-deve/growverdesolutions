import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar.jsx";
import { Topbar } from "../components/layout/Topbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { NotificationsProvider } from "../context/NotificationsContext.jsx";

// Rendered inside <RequireAuth> (see App.jsx), so `user` is always a
// real, signed-in account here — no mock fallback needed.
export function PortalLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <NotificationsProvider>
      <div className="min-h-screen flex bg-sand-50">
        <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />
        <div className="flex-1 min-w-0 flex flex-col">
          <Topbar user={user} onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8 max-w-6xl w-full mx-auto">
            <Outlet context={{ user }} />
          </main>
        </div>
      </div>
    </NotificationsProvider>
  );
}
