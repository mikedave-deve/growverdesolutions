import mongoose from "mongoose";

const { Schema } = mongoose;

// One document belongs to exactly one employee — admin/HR upload it
// for them (offer letter, contract, handbook, etc.), the employee can
// only ever see and download their own.
const documentSchema = new Schema(
  {
    employee: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },

    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Offer Letter", "Employment Contract", "Employee Handbook", "Policies", "Other Documents"],
      default: "Other Documents",
    },
    status: {
      type: String,
      enum: ["Available", "Pending Signature", "Archived"],
      default: "Available",
    },
    version: { type: String, default: "1.0", trim: true },

    // The file itself — admin can upload any file type, so this is
    // stored as-is with whatever mimetype the browser reported.
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileData: { type: Buffer, required: true, select: false },
  },
  { timestamps: true }
);

documentSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    category: this.category,
    status: this.status,
    version: this.version,
    date: this.createdAt,
    fileName: this.fileName,
    mimeType: this.mimeType,
    fileSize: this.fileSize,
  };
};

export const Document = mongoose.model("Document", documentSchema);
