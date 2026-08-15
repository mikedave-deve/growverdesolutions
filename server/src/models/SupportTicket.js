import mongoose from "mongoose";

const { Schema } = mongoose;

// A support request from an employee — logged as a plain history
// entry, no open/resolved status concept by design.
const supportTicketSchema = new Schema(
  {
    employee: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    subject: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

supportTicketSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    subject: this.subject,
    date: this.createdAt,
  };
};

export const SupportTicket = mongoose.model("SupportTicket", supportTicketSchema);
