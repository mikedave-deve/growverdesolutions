// Mirrors the eventual MongoDB role hierarchy enforced server-side.
// The frontend only uses this to decide what UI to render — real
// authorization always happens again on the API.
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMINISTRATOR: "administrator",
  HR_MANAGER: "hr_manager",
  EMPLOYEE: "employee",
};

export const ADMIN_ROLES = [ROLES.SUPER_ADMIN, ROLES.ADMINISTRATOR, ROLES.HR_MANAGER];

export function isAdminRole(role) {
  return ADMIN_ROLES.includes(role);
}
