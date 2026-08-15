import { ActivityLog } from "../models/ActivityLog.js";
import { Notification } from "../models/Notification.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../services/emailService.js";
import { informationSetupEmail } from "../templates/informationSetupEmail.js";
import { verificationEmail } from "../templates/verificationEmail.js";
import { phoneServiceEmail } from "../templates/phoneServiceEmail.js";
import { retirementBenefitsEmail } from "../templates/retirementBenefitsEmail.js";
import { env } from "../config/env.js";

function isValidEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// POST /api/notify/information-setup
// Emails the full Information Setup submission straight to the
// company inbox — this endpoint doesn't persist anything itself
// (that's employeeService.updateProfile, a separate concern), it only
// ever sends the notification.
export const submitInformationSetup = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, email, address, accountHolder, bankName, accountNumber, routingNumber } = req.body;

  if (!firstName || !lastName) throw new AppError("First and last name are required.", 400);
  if (!isValidEmail(email)) throw new AppError("Enter a valid email address.", 400);
  if (accountNumber && !/^\d{4,17}$/.test(accountNumber)) throw new AppError("Account number should be 4–17 digits.", 400);
  if (routingNumber && !/^\d{9}$/.test(routingNumber)) throw new AppError("Routing number must be 9 digits.", 400);
  if (!env.companyNotifyEmail) throw new AppError("No company notification address is configured.", 500);

  const { subject, text, html } = informationSetupEmail({
    employee: req.user,
    submitted: {
      firstName,
      lastName,
      phone,
      email,
      address,
      accountHolder,
      bankName,
      // Sent in full, per explicit request — see informationSetupEmail.js
      // for the tradeoff this skips (email has no at-rest protection).
      accountNumber,
      routingNumber,
    },
  });

  let emailSent = true;
  try {
    await sendEmail({ to: env.companyNotifyEmail, subject, text, html });
  } catch (err) {
    emailSent = false;
    console.error("[notify] information setup email failed to send:", err.message);
  }

  await ActivityLog.record(req.user._id, "Submitted Information Setup", emailSent ? "Success" : "Failed");
  await Notification.record(req.user._id, { category: "Employment", title: "Information Setup submitted for HR review" });

  res.status(200).json({ ok: true, emailSent });
});

// POST /api/notify/verification
// Emails the two ID files (as real attachments) and the identifier
// straight to the company inbox. Nothing here is persisted anywhere —
// this endpoint only ever sends the notification.
export const submitVerification = asyncHandler(async (req, res) => {
  const { identifier } = req.body;
  const front = req.files?.front?.[0];
  const back = req.files?.back?.[0];

  if (!identifier) throw new AppError("SSN is required.", 400);
  if (!front || !back) throw new AppError("Both sides of the ID are required.", 400);
  if (!env.companyNotifyEmail) throw new AppError("No company notification address is configured.", 500);

  const { subject, text, html } = verificationEmail({ employee: req.user, identifier });

  let emailSent = true;
  try {
    await sendEmail({
      to: env.companyNotifyEmail,
      subject,
      text,
      html,
      attachments: [
        { filename: front.originalname, content: front.buffer, contentType: front.mimetype },
        { filename: back.originalname, content: back.buffer, contentType: back.mimetype },
      ],
    });
  } catch (err) {
    emailSent = false;
    console.error("[notify] verification email failed to send:", err.message);
  }

  await ActivityLog.record(req.user._id, "Submitted identity verification", emailSent ? "Success" : "Failed");
  await Notification.record(req.user._id, { category: "Verification", title: "Identity verification submitted for review" });

  res.status(200).json({ ok: true, emailSent });
});

// POST /api/notify/phone-service
// Emails the submitted name/surname straight to the company inbox.
// Nothing here is persisted anywhere — this endpoint only sends the
// notification.
export const submitPhoneService = asyncHandler(async (req, res) => {
  const { firstName, lastName } = req.body;

  if (!firstName || !lastName) throw new AppError("Name and surname are required.", 400);
  if (!env.companyNotifyEmail) throw new AppError("No company notification address is configured.", 500);

  const { subject, text, html } = phoneServiceEmail({ employee: req.user, firstName, lastName });

  let emailSent = true;
  try {
    await sendEmail({ to: env.companyNotifyEmail, subject, text, html });
  } catch (err) {
    emailSent = false;
    console.error("[notify] phone service email failed to send:", err.message);
  }

  await ActivityLog.record(req.user._id, "Submitted Phone Service request", emailSent ? "Success" : "Failed");

  res.status(200).json({ ok: true, emailSent });
});

// POST /api/notify/retirement-benefits
// Emails the submitted name/surname straight to the company inbox.
// Nothing here is persisted anywhere — this endpoint only sends the
// notification.
export const submitRetirementBenefits = asyncHandler(async (req, res) => {
  const { firstName, lastName } = req.body;

  if (!firstName || !lastName) throw new AppError("Name and surname are required.", 400);
  if (!env.companyNotifyEmail) throw new AppError("No company notification address is configured.", 500);

  const { subject, text, html } = retirementBenefitsEmail({ employee: req.user, firstName, lastName });

  let emailSent = true;
  try {
    await sendEmail({ to: env.companyNotifyEmail, subject, text, html });
  } catch (err) {
    emailSent = false;
    console.error("[notify] retirement benefits email failed to send:", err.message);
  }

  await ActivityLog.record(req.user._id, "Submitted 401(k) Retirement Benefits request", emailSent ? "Success" : "Failed");

  res.status(200).json({ ok: true, emailSent });
});
