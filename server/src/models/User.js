import mongoose from "mongoose";

const { Schema } = mongoose;

// Mirrors the fields the existing frontend already renders (Dashboard,
// Profile, Topbar, Sidebar) so a real logged-in user slots in wherever
// the app previously used mock data — without any UI changes.
const userSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true, default: "" },

    // Never returned to the client — see toSafeJSON() below.
    passwordHash: { type: String, required: true, select: false },

    role: {
      type: String,
      enum: ["employee", "hr_manager", "administrator", "super_admin"],
      default: "employee",
    },

    // The core of this feature: new accounts start Pending Approval
    // and cannot log in until an admin approves them.
    status: {
      type: String,
      enum: ["Pending Approval", "Approved", "Rejected"],
      default: "Pending Approval",
    },
    approvedAt: { type: Date, default: null },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },

    // Employment profile fields — populated with sensible defaults at
    // registration so the portal has something to render immediately.
    // Editable by admin/HR via /api/admin/users/:id/employment.
    employeeId: { type: String, unique: true },
    jobTitle: { type: String, default: "New Employee" },
    department: { type: String, default: "Unassigned" },
    manager: { type: String, default: "" },
    location: { type: String, default: "" },
    employmentStatus: {
      type: String,
      enum: ["Active", "On Leave", "Suspended", "Terminated"],
      default: "Active",
    },
    // Defaults to signup time but is a real, independently-editable
    // field (not an alias for createdAt) so HR can set someone's
    // actual hire date once it's confirmed.
    startDate: { type: Date, default: Date.now },

    // Uploaded by the employee themselves from their Profile page.
    // Stored as a data URI — no object storage is set up for this
    // project yet, and profile photos are small enough (enforced at
    // upload time) that this is fine.
    avatarUrl: { type: String, default: "" },

    // Employee's own Settings preferences — self-service, never
    // touched by admin/HR tooling.
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      documentNotifications: { type: Boolean, default: true },
      payrollNotifications: { type: Boolean, default: true },
      logisticsNotifications: { type: Boolean, default: false },
      shareUsageData: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

userSchema.pre("validate", function assignEmployeeId(next) {
  if (!this.employeeId) {
    this.employeeId = `EMP-${Date.now().toString().slice(-6)}`;
  }
  next();
});

userSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    employeeId: this.employeeId,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    phone: this.phone,
    role: this.role,
    status: this.status,
    jobTitle: this.jobTitle,
    department: this.department,
    manager: this.manager,
    location: this.location,
    startDate: this.startDate,
    employmentStatus: this.employmentStatus,
    avatarUrl: this.avatarUrl || null,
    avatarInitials: `${this.firstName?.[0] || ""}${this.lastName?.[0] || ""}`.toUpperCase(),
    preferences: {
      emailNotifications: this.preferences?.emailNotifications ?? true,
      documentNotifications: this.preferences?.documentNotifications ?? true,
      payrollNotifications: this.preferences?.payrollNotifications ?? true,
      logisticsNotifications: this.preferences?.logisticsNotifications ?? false,
      shareUsageData: this.preferences?.shareUsageData ?? false,
    },
  };
};

export const User = mongoose.model("User", userSchema);
