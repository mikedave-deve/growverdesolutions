// Mirrors src/constants/roles.js on the frontend — kept here too since
// the API must always re-check this itself, never trust the client.
export const ADMIN_ROLES = ["administrator", "super_admin", "hr_manager"];

export function isAdminRole(role) {
  return ADMIN_ROLES.includes(role);
}

const ROLE_LABELS = {
  hr_manager: "HR",
  administrator: "Admin",
  super_admin: "Admin",
  employee: "Employee",
};

// e.g. "Priya Natarajan, HR" — used to snapshot who sent something
// (a mission, an approval) as a display string at the time it happened.
export function roleLabel(role) {
  return ROLE_LABELS[role] || role;
}
