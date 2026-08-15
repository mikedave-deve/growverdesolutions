import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendEmail } from "../services/emailService.js";
import { resumeSubmissionEmail } from "../templates/resumeSubmissionEmail.js";
import { env } from "../config/env.js";

function isValidEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// POST /api/careers/resume
// Public — no signed-in account involved. Emails the submission
// straight to the company inbox with the resume file attached as-is
// (any file type is accepted; nothing here validates its contents).
export const submitResume = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, fieldOfInterest, experienceLevel, note } = req.body;

  if (!firstName || !lastName) throw new AppError("First and last name are required.", 400);
  if (!isValidEmail(email)) throw new AppError("Enter a valid email address.", 400);
  if (!req.file) throw new AppError("Please attach your resume before submitting.", 400);
  if (!env.companyNotifyEmail) throw new AppError("No company notification address is configured.", 500);

  const { subject, text, html } = resumeSubmissionEmail({
    firstName, lastName, email, phone, fieldOfInterest, experienceLevel, note,
    fileName: req.file.originalname,
  });

  let emailSent = true;
  try {
    await sendEmail({
      to: env.companyNotifyEmail,
      subject,
      text,
      html,
      attachments: [{ filename: req.file.originalname, content: req.file.buffer, contentType: req.file.mimetype }],
    });
  } catch (err) {
    emailSent = false;
    console.error("[careers] resume submission email failed to send:", err.message);
  }

  res.status(200).json({ ok: true, emailSent });
});
