// Fictional demo data only. Shaped to closely resemble the eventual
// MongoDB documents so swapping mock services for real API calls
// requires no changes to the UI layer.

export const mockUser = {
  id: "usr_10482",
  employeeId: "EMP-10482",
  firstName: "John",
  lastName: "Anderson",
  email: "john.anderson@growverde.com",
  phone: "(415) 555-0148",
  role: "employee",
  jobTitle: "Senior Operations Specialist",
  department: "Operations",
  manager: "Priya Natarajan",
  location: "Austin, TX (Remote)",
  startDate: "2022-03-14",
  employmentStatus: "Active",
  avatarInitials: "JA",
};

export const mockDocuments = [
  { id: "doc_1", name: "Offer Letter", category: "Offer Letter", date: "2022-02-28", version: "1.0", status: "Available" },
  { id: "doc_2", name: "Employment Contract", category: "Employment Contract", date: "2022-03-14", version: "1.2", status: "Available" },
  { id: "doc_3", name: "Employee Handbook", category: "Employee Handbook", date: "2025-01-06", version: "3.1", status: "Available" },
  { id: "doc_4", name: "Remote Work Policy", category: "Policies", date: "2024-09-11", version: "2.0", status: "Available" },
  { id: "doc_5", name: "Equipment Agreement", category: "Other Documents", date: "2022-03-18", version: "1.0", status: "Pending Signature" },
];

export const mockMissions = [
  { id: "msn_1", title: "Complete Q3 compliance training", description: "Finish the annual compliance and safety training module before the deadline.", sender: "Priya Natarajan, HR", date: "2026-08-01", priority: "High", deadline: "2026-08-15", status: "In Progress" },
  { id: "msn_2", title: "Submit updated direct deposit form", description: "Confirm your banking details are current for the next payroll cycle.", sender: "Payroll Team", date: "2026-07-28", priority: "Medium", deadline: "2026-08-05", status: "Overdue" },
  { id: "msn_3", title: "Review updated remote work policy", description: "Read and acknowledge the revised remote work policy.", sender: "Priya Natarajan, HR", date: "2026-08-06", priority: "Low", deadline: "2026-08-20", status: "New" },
  { id: "msn_4", title: "Onboard new equipment tracker", description: "Walkthrough of the new asset-tracking process for shipped equipment.", sender: "IT Operations", date: "2026-07-10", priority: "Medium", deadline: "2026-07-24", status: "Completed" },
];

export const mockActivity = [
  { id: "act_1", activity: "Logged in", date: "2026-08-10", time: "08:42 AM", status: "Success" },
  { id: "act_2", activity: "Clocked in", date: "2026-08-10", time: "08:45 AM", status: "Success" },
  { id: "act_3", activity: "Downloaded pay statement", date: "2026-08-08", time: "05:10 PM", status: "Success" },
  { id: "act_4", activity: "Updated profile photo", date: "2026-08-06", time: "01:22 PM", status: "Success" },
  { id: "act_5", activity: "Submitted verification documents", date: "2026-07-30", time: "11:05 AM", status: "Success" },
];

export const mockAttendance = {
  clockedIn: true,
  clockInTime: "2026-08-10T08:45:00",
  todayHours: 4.6,
  weeklyHours: 32.4,
  monthlyHours: 138.2,
  history: [
    { id: "att_1", date: "2026-08-07", clockIn: "08:41 AM", clockOut: "05:03 PM", total: "8h 22m" },
    { id: "att_2", date: "2026-08-06", clockIn: "08:52 AM", clockOut: "04:58 PM", total: "8h 06m" },
    { id: "att_3", date: "2026-08-05", clockIn: "08:38 AM", clockOut: "05:12 PM", total: "8h 34m" },
    { id: "att_4", date: "2026-08-04", clockIn: "09:01 AM", clockOut: "05:00 PM", total: "7h 59m" },
  ],
};

export const mockVerification = {
  status: "Not Started",
  submittedAt: null,
  steps: { idFront: false, idBack: false, identifier: false },
};

export const mockPayroll = {
  current: {
    payPeriod: "Jul 26 – Aug 8, 2026",
    balance: 3051.6,
    grossPay: 4230.0,
    taxes: 812.4,
    deductions: 156.0,
    benefits: 210.0,
    netPay: 3051.6,
    nextPayDate: "2026-08-14",
    paymentDate: "2026-08-14",
    status: "Processing",
  },
  paymentMethod: { type: "Bank Transfer", accountLast4: "4821" },
  history: [
    { id: "pay_1", payDate: "2026-07-24", payPeriod: "Jul 12 – Jul 25", gross: 4230.0, deductions: 968.4, net: 3261.6, status: "Paid" },
    { id: "pay_2", payDate: "2026-07-10", payPeriod: "Jun 28 – Jul 11", gross: 4230.0, deductions: 968.4, net: 3261.6, status: "Paid" },
    { id: "pay_3", payDate: "2026-06-26", payPeriod: "Jun 14 – Jun 27", gross: 4230.0, deductions: 1024.1, net: 3205.9, status: "Paid" },
  ],
};

// Deposit accounts the employee has on file for their own paycheck —
// this is the legitimate "direct deposit" concept: the company pays
// the employee's own bank account(s). Nothing here ever asks the
// employee to send funds anywhere.
export const mockDepositAccounts = [
  { id: "acct_1", label: "Primary Checking", accountHolder: "John Anderson", bankName: "First Meridian Bank", accountType: "Checking", last4: "4821", split: 80 },
  { id: "acct_2", label: "Savings", accountHolder: "John Anderson", bankName: "First Meridian Bank", accountType: "Savings", last4: "7790", split: 20 },
];

// Transfers moved between the employee's own accounts on file above —
// e.g. rebalancing a split deposit. Seeded empty; the UI appends to
// this as demo transfers are confirmed.
export const mockTransfers = [];

export const mockShipment = {
  id: "shp_88213",
  equipment: "Laptop (Dell Latitude 5450), Docking Station, Headset",
  shipmentNumber: "GV-SHP-88213",
  carrier: "UPS",
  shipmentDate: "2026-08-05",
  estimatedDelivery: "2026-08-12",
  currentStatus: "In Transit",
};

export const mockNotifications = [
  { id: "ntf_1", category: "Payroll", title: "Pay statement available", date: "2026-08-08", priority: "Normal", read: false },
  { id: "ntf_2", category: "Tasks", title: "Compliance training due in 5 days", date: "2026-08-10", priority: "High", read: false },
  { id: "ntf_3", category: "Logistics", title: "Equipment shipment is in transit", date: "2026-08-06", priority: "Normal", read: true },
  { id: "ntf_4", category: "Documents", title: "Equipment agreement awaiting signature", date: "2026-03-19", priority: "Normal", read: true },
  { id: "ntf_5", category: "Security", title: "New sign-in from a recognized device", date: "2026-08-10", priority: "Low", read: true },
  { id: "ntf_6", category: "Employment", title: "Welcome to Growverde Solutions, John!", date: "2022-03-14", priority: "Normal", read: true },
  { id: "ntf_7", category: "Attendance", title: "You clocked in at 8:45 AM", date: "2026-08-10", priority: "Low", read: true },
  { id: "ntf_8", category: "Verification", title: "Identity verification is pending review", date: "2026-07-30", priority: "Normal", read: true },
  { id: "ntf_9", category: "Support", title: "Support ticket #tkt_1 marked Resolved", date: "2026-07-26", priority: "Normal", read: true },
  { id: "ntf_10", category: "Payroll", title: "Direct deposit details updated", date: "2026-07-20", priority: "Normal", read: true },
];

export const mockCompanyServices = [
  { id: "svc_1", name: "Company VPN", username: "j.anderson", password: "••••••••••" },
  { id: "svc_2", name: "Fleet Phone Line", username: "+1 (415) 555-0148", password: "••••••••••" },
];

export const mockTickets = [
  { id: "tkt_1", subject: "Unable to download July pay statement", status: "Resolved", date: "2026-07-26" },
  { id: "tkt_2", subject: "Equipment shipment address change", status: "Open", date: "2026-08-04" },
];
