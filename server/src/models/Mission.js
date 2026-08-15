import mongoose from "mongoose";

const { Schema } = mongoose;

// An instruction/task sent by admin or HR to one specific employee —
// only that employee (and admin/HR) ever see it.
const missionSchema = new Schema(
  {
    employee: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sentBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // Snapshotted at send time (e.g. "Priya Natarajan, HR") so the
    // employee's view never needs to populate/join the sender.
    senderLabel: { type: String, required: true },

    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    department: { type: String, trim: true, default: "" },
    priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
    status: {
      type: String,
      enum: ["New", "In Progress", "Completed", "Overdue"],
      default: "New",
    },
    deadline: { type: Date, required: true },
  },
  { timestamps: true }
);

missionSchema.methods.toSafeJSON = function toSafeJSON() {
  return {
    id: this._id.toString(),
    title: this.title,
    description: this.description,
    department: this.department,
    priority: this.priority,
    status: this.status,
    sender: this.senderLabel,
    date: this.createdAt,
    deadline: this.deadline,
  };
};

export const Mission = mongoose.model("Mission", missionSchema);
