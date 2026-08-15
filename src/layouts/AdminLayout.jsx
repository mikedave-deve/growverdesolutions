import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "../components/admin/AdminSidebar.jsx";
import { AdminTopbar } from "../components/admin/AdminTopbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useAsync } from "../hooks/useAsync.js";
import { adminService } from "../services/adminService.js";

// Rendered inside <RequireAuth roles={ADMIN_ROLES}> (see App.jsx), so
// `user` is always a signed-in admin/HR account here. Same shell shape
// as PortalLayout — sidebar + topbar + centered content — so the admin
// area feels like the same product as the employee portal.
export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const pending = useAsync(() => adminService.getPendingUsers(), []);
  const pendingCount = pending.data?.users?.length || 0;

  return (
    <div className="min-h-screen flex bg-sand-50">
      <AdminSidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} pendingCount={pendingCount} />
      <div className="flex-1 min-w-0 flex flex-col">
        <AdminTopbar user={user} onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8 max-w-6xl w-full mx-auto">
          <Outlet context={{ user, pending }} />
        </main>
      </div>
    </div>
  );
}
