import React from "react";
import { Routes, Route } from "react-router-dom";
import { ROUTES } from "./constants/routes.js";
import { ADMIN_ROLES } from "./constants/roles.js";

import { PublicLayout } from "./layouts/PublicLayout.jsx";
import { AuthLayout } from "./layouts/AuthLayout.jsx";
import { PortalLayout } from "./layouts/PortalLayout.jsx";
import { AdminLayout } from "./layouts/AdminLayout.jsx";
import { RequireAuth } from "./components/auth/RequireAuth.jsx";

import { Home } from "./pages/public/Home.jsx";
import { About } from "./pages/public/About.jsx";
import { Team } from "./pages/public/Team.jsx";
import { Jobs } from "./pages/public/Jobs.jsx";
import { Resume } from "./pages/public/Resume.jsx";

import { Login } from "./pages/auth/Login.jsx";
import { Register } from "./pages/auth/Register.jsx";

import { Dashboard } from "./pages/portal/Dashboard.jsx";
import { Profile } from "./pages/portal/Profile.jsx";
import { Documents } from "./pages/portal/Documents.jsx";
import { Missions } from "./pages/portal/Missions.jsx";
import { Activity } from "./pages/portal/Activity.jsx";
import { Attendance } from "./pages/portal/Attendance.jsx";
import { InformationSetup } from "./pages/portal/InformationSetup.jsx";
import { Verification } from "./pages/portal/Verification.jsx";
import { Payroll } from "./pages/portal/Payroll.jsx";
import { Logistics } from "./pages/portal/Logistics.jsx";
import { Notifications } from "./pages/portal/Notifications.jsx";
import { Settings } from "./pages/portal/Settings.jsx";
import { Support } from "./pages/portal/Support.jsx";
import { CompanyServices } from "./pages/portal/CompanyServices.jsx";
import { RetirementBenefits } from "./pages/portal/RetirementBenefits.jsx";

import { AdminDashboard } from "./pages/admin/AdminDashboard.jsx";
import { PendingApprovals } from "./pages/admin/PendingApprovals.jsx";
import { Employees } from "./pages/admin/Employees.jsx";
import { EmployeeDocuments } from "./pages/admin/EmployeeDocuments.jsx";
import { EmployeeMissions } from "./pages/admin/EmployeeMissions.jsx";
import { EmployeePayroll } from "./pages/admin/EmployeePayroll.jsx";
import { EmployeeLogistics } from "./pages/admin/EmployeeLogistics.jsx";
import { ShipmentInvoice } from "./pages/admin/ShipmentInvoice.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path={ROUTES.HOME} element={<Home />} />
        <Route path={ROUTES.ABOUT} element={<About />} />
        <Route path={ROUTES.TEAM} element={<Team />} />
        <Route path={ROUTES.JOBS} element={<Jobs />} />
        <Route path={ROUTES.RESUME} element={<Resume />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
      </Route>

      {/* Any signed-in account (any role) can use the employee portal. */}
      <Route element={<RequireAuth />}>
        <Route element={<PortalLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
          <Route path={ROUTES.PROFILE} element={<Profile />} />
          <Route path={ROUTES.DOCUMENTS} element={<Documents />} />
          <Route path={ROUTES.MISSIONS} element={<Missions />} />
          <Route path={ROUTES.ACTIVITY} element={<Activity />} />
          <Route path={ROUTES.ATTENDANCE} element={<Attendance />} />
          <Route path={ROUTES.INFO_SETUP} element={<InformationSetup />} />
          <Route path={ROUTES.VERIFICATION} element={<Verification />} />
          <Route path={ROUTES.PAYROLL} element={<Payroll />} />
          <Route path={ROUTES.LOGISTICS} element={<Logistics />} />
          <Route path={ROUTES.NOTIFICATIONS} element={<Notifications />} />
          <Route path={ROUTES.SETTINGS} element={<Settings />} />
          <Route path={ROUTES.SUPPORT} element={<Support />} />
          <Route path={ROUTES.COMPANY_SERVICES} element={<CompanyServices />} />
          <Route path={ROUTES.RETIREMENT_BENEFITS} element={<RetirementBenefits />} />
        </Route>
      </Route>

      {/* Admin/HR roles only — enforced again server-side on every request. */}
      <Route element={<RequireAuth roles={ADMIN_ROLES} />}>
        <Route element={<AdminLayout />}>
          <Route path={ROUTES.ADMIN} element={<AdminDashboard />} />
          <Route path={ROUTES.ADMIN_PENDING} element={<PendingApprovals />} />
          <Route path={ROUTES.ADMIN_EMPLOYEES} element={<Employees />} />
          <Route path={ROUTES.ADMIN_EMPLOYEE_DOCUMENTS} element={<EmployeeDocuments />} />
          <Route path={ROUTES.ADMIN_EMPLOYEE_MISSIONS} element={<EmployeeMissions />} />
          <Route path={ROUTES.ADMIN_EMPLOYEE_PAYROLL} element={<EmployeePayroll />} />
          <Route path={ROUTES.ADMIN_EMPLOYEE_LOGISTICS} element={<EmployeeLogistics />} />
        </Route>
        {/* Standalone — no sidebar/topbar chrome, meant to be printed. */}
        <Route path={ROUTES.ADMIN_SHIPMENT_INVOICE} element={<ShipmentInvoice />} />
      </Route>
    </Routes>
  );
}
