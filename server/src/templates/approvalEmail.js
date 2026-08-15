// Hand-built inline-styled HTML — email clients don't support Tailwind
// or web fonts reliably, so this mirrors the app's brand tokens
// (ink #161A26, gold #C9974B, teal #2F6E63) directly as inline CSS,
// and recreates the boxed "GROWVERDE / SOLUTIONS" wordmark using a
// bordered table cell instead of the real Logo component.
export function approvalEmail({ firstName, loginUrl }) {
  const subject = "Your Growverde Solutions account has been approved";

  const text = `Hi ${firstName},

Good news — your Growverde Solutions employee account has been approved.

You can now sign in: ${loginUrl}

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
                  Account Approved
                </p>
                <h1 style="margin:0 0 18px;font-size:22px;line-height:1.3;color:#161A26;font-family:Georgia,'Times New Roman',serif;">
                  You're all set, ${escapeHtml(firstName)}.
                </h1>
                <p style="margin:0 0 24px;font-size:14.5px;line-height:1.65;color:#3F4451;">
                  Your Growverde Solutions employee account has been reviewed and
                  approved by an administrator. You can now sign in to your
                  employee portal to view your documents, payroll, attendance,
                  and more.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:0 32px 36px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background:#C9974B;border-radius:8px;">
                      <a href="${loginUrl}"
                         style="display:inline-block;padding:13px 26px;font-size:14px;font-weight:700;color:#161A26;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">
                        Sign In to Growverde Solutions
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 32px 32px;border-top:1px solid #E4E1D9;">
                <p style="margin:0;font-size:12px;color:#9A9384;line-height:1.6;">
                  If you weren't expecting this email, you can safely ignore it.
                  This is an automated message from Growverde Solutions — please
                  don't reply directly to it.
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
