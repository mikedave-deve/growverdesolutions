import { SupportTicket } from "../models/SupportTicket.js";
import { ActivityLog } from "../models/ActivityLog.js";
import { Notification } from "../models/Notification.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../services/emailService.js";
import { supportTicketEmail } from "../templates/supportTicketEmail.js";
import { env } from "../config/env.js";

// GET /api/support/tickets/mine
export const listMyTickets = asyncHandler(async (req, res) => {
  const tickets = await SupportTicket.find({ employee: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ tickets: tickets.map((t) => t.toSafeJSON()) });
});

// POST /api/support/tickets/mine
// Logs the request and emails it straight to the company inbox — no
// open/resolved status, it's just a history log.
export const submitTicket = asyncHandler(async (req, res) => {
  const { subject } = req.body;
  if (!subject || !subject.trim()) throw new AppError("Tell us what you need help with.", 400);
  if (!env.companyNotifyEmail) throw new AppError("No company notification address is configured.", 500);

  const ticket = await SupportTicket.create({ employee: req.user._id, subject: subject.trim() });

  const { subject: emailSubject, text, html } = supportTicketEmail({ employee: req.user, subject: ticket.subject });

  let emailSent = true;
  try {
    await sendEmail({ to: env.companyNotifyEmail, subject: emailSubject, text, html });
  } catch (err) {
    emailSent = false;
    console.error("[support] ticket email failed to send:", err.message);
  }

  await ActivityLog.record(req.user._id, "Submitted support request", emailSent ? "Success" : "Failed");
  await Notification.record(req.user._id, { category: "Support", title: `Support request submitted: ${ticket.subject}` });

  res.status(201).json({ ticket: ticket.toSafeJSON(), emailSent });
});
