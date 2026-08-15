import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { ROUTES } from "../../constants/routes.js";
import { LoadingState } from "../ui/States.jsx";

// Wraps a set of routes (via <Route element={<RequireAuth roles={...} />}>)
// so they only render once there's a signed-in user — and, if `roles`
// is given, only if that user's role is in the list. This is a UX
// guard only; the real authorization check always happens again on
// the API for every request.
export function RequireAuth({ roles }) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-50">
        <LoadingState label="Checking your session…" rows={0} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
}
