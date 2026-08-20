// Mirrors approvalEmail.js — same brand tokens (ink #161A26, gold
// #C9974B, teal #2F6E63), same inline-styled table layout since email
// clients don't support Tailwind or web fonts.
export function resetPasswordEmail({ firstName, resetUrl }) {
  const subject = "Reset your Growverde Solutions password";

  const text = `Hi ${firstName},

We received a request to reset your Growverde Solutions account password.

Reset your password: ${resetUrl}

This link expires in 1 hour. If you didn't request this, you can safely ignore this email — your password won't be changed.

— Growverde Solutions`;

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#FAFAF7;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAF7;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background:#FFFFFF;border:1px solid #E4E1D9;border-radius:14px;overflow:hidden;">

            <tr>
              <td style="background:#161A26;padding:28px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="border:1.5px solid rgba(255,255,255,0.7);border-radius:6px;padding:6px 14px;">
                      <div style="font-size:15px;font-weight:800;letter-spacing:-0.02em;color:#FFFFFF;font-family:Arial,Helvetica,sans-serif;">
                        GROW<span style="color:#A8CBC3;">VERDE</span>
                      </div>
                      <div style="font-size:9px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:#A8CBC3;margin-top:2px;">
                        Solutions
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:36px 32px 8px;">
                <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#2F6E63;">
                  Password Reset Requested
                </p>
                <h1 style="margin:0 0 18px;font-size:22px;line-height:1.3;color:#161A26;font-family:Georgia,'Times New Roman',serif;">
                  Reset your password, ${escapeHtml(firstName)}.
                </h1>
                <p style="margin:0 0 24px;font-size:14.5px;line-height:1.65;color:#3F4451;">
                  We received a request to reset the password on your Growverde
                  Solutions employee account. Click the button below to choose a
                  new password. This link expires in 1 hour.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:0 32px 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background:#C9974B;border-radius:8px;">
                      <a href="${resetUrl}"
                         style="display:inline-block;padding:13px 26px;font-size:14px;font-weight:700;color:#161A26;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">
                        Reset Password
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 32px 32px;border-top:1px solid #E4E1D9;">
                <p style="margin:0;font-size:12px;color:#9A9384;line-height:1.6;">
                  If you didn't request a password reset, you can safely ignore
                  this email — your password won't be changed. This is an
                  automated message from Growverde Solutions — please don't
                  reply directly to it.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}
