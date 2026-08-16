export const DOCUMENT_STATUS = ["Available", "Pending Signature", "Archived"];

export const DOCUMENT_CATEGORIES = ["Offer Letter", "Employment Contract", "Employee Handbook", "Policies", "Other Documents"];

export const EMPLOYMENT_STATUS = ["Active", "On Leave", "Suspended", "Terminated"];

export const MISSION_STATUS = {
  NEW: "New",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  OVERDUE: "Overdue",
};

export const VERIFICATION_STATUS = {
  NOT_STARTED: "Not Started",
  INCOMPLETE: "Incomplete",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  REQUIRES_ACTION: "Requires Action",
  REJECTED: "Rejected",
};

// The default forward path — every shipment moves through these in
// order. "On Hold" and "Returned" are exceptions layered on top (see
// SHIPMENT_STEPS below): admin can set either one on a shipment that
// needs it, and it's skipped entirely — never shown — on shipments
// that don't.
export const SHIPMENT_BASE_STEPS = [
  "Order Created",
  "Processing",
  "Packed",
  "Shipped",
  "In Transit",
  "Out for Delivery",
  "Delivered",
];

// Full set of selectable statuses (used by the admin's status dropdown).
export const SHIPMENT_STEPS = [...SHIPMENT_BASE_STEPS, "On Hold", "Returned"];

export const TRANSPORT_MODES = ["Ground", "Air", "Sea", "Rail"];

export const PAYMENT_STATUSES = ["Paid", "Unpaid", "Pending"];
