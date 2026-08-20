// Central path constants so links/redirects never rely on magic strings.
export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  TEAM: "/team",
  JOBS: "/jobs",
  RESUME: "/resume",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  DASHBOARD: "/portal",
  PROFILE: "/portal/profile",
  DOCUMENTS: "/portal/documents",
  MISSIONS: "/portal/missions",
  ACTIVITY: "/portal/activity",
  ATTENDANCE: "/portal/attendance",
  INFO_SETUP: "/portal/information-setup",
  VERIFICATION: "/portal/verification",
  PAYROLL: "/portal/payroll",
  LOGISTICS: "/portal/logistics",
  NOTIFICATIONS: "/portal/notifications",
  SETTINGS: "/portal/settings",
  SUPPORT: "/portal/support",
  COMPANY_SERVICES: "/portal/company-services",
  RETIREMENT_BENEFITS: "/portal/retirement-benefits",

  ADMIN: "/admin",
  ADMIN_PENDING: "/admin/pending",
  ADMIN_EMPLOYEES: "/admin/employees",
  ADMIN_EMPLOYEE_DOCUMENTS: "/admin/employees/:id/documents",
  ADMIN_EMPLOYEE_MISSIONS: "/admin/employees/:id/missions",
  ADMIN_EMPLOYEE_PAYROLL: "/admin/employees/:id/payroll",
  ADMIN_EMPLOYEE_LOGISTICS: "/admin/employees/:id/logistics",
  ADMIN_SHIPMENT_INVOICE: "/admin/shipments/:shipmentId/invoice",
};

export function adminEmployeeDocumentsPath(id) {
  return `/admin/employees/${id}/documents`;
}

export function adminEmployeeMissionsPath(id) {
  return `/admin/employees/${id}/missions`;
}

export function adminEmployeePayrollPath(id) {
  return `/admin/employees/${id}/payroll`;
}

export function adminEmployeeLogisticsPath(id) {
  return `/admin/employees/${id}/logistics`;
}

export function adminShipmentInvoicePath(shipmentId) {
  return `/admin/shipments/${shipmentId}/invoice`;
}
