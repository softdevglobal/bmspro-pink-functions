import * as sgMail from "@sendgrid/mail";
import { defineString } from "firebase-functions/params";

// Parameterised secret — set via:  firebase functions:secrets:set SENDGRID_API_KEY
const sendgridApiKey = defineString("SENDGRID_API_KEY");

const FROM_EMAIL = "noreply@bmspros.com.au";

// ─── Welcome Email with Booking Link ─────────────────────────────────────────

interface BookingWelcomeEmailParams {
  to: string;
  businessName: string;
  bookingLink: string;
  ownerName?: string;
}

/**
 * Send a "Your booking page is live" email to the salon owner.
 */
export const sendBookingLinkEmail = async ({
  to,
  businessName,
  bookingLink,
  ownerName,
}: BookingWelcomeEmailParams): Promise<{ success: boolean; error?: string }> => {
  console.log(`[EMAIL] Sending booking-link email to ${to}`);

  if (!to || !to.trim()) {
    return { success: false, error: "No recipient email" };
  }

  try {
    sgMail.setApiKey(sendgridApiKey.value());

    const greeting = ownerName ? `Hello ${ownerName}` : "Hello";

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Booking Page is Live!</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f3f4f6;">
  <table role="presentation" style="width:100%;border-collapse:collapse;background-color:#f3f4f6;">
    <tr>
      <td style="padding:40px 20px;">
        <table role="presentation" style="max-width:600px;margin:0 auto;background-color:#ffffff;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:0;background:linear-gradient(135deg,#ec4899 0%,#8b5cf6 100%);">
              <div style="padding:40px;text-align:center;">
                <div style="font-size:56px;margin-bottom:15px;line-height:1;">🎉</div>
                <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;">Your Booking Page is Live!</h1>
                <p style="margin:15px 0 0;color:rgba(255,255,255,0.9);font-size:16px;">${businessName}</p>
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px 40px;">
              <p style="margin:0 0 15px;color:#374151;font-size:16px;line-height:1.6;">${greeting},</p>
              <p style="margin:0 0 25px;color:#374151;font-size:16px;line-height:1.6;">
                Great news! Your online booking page for <strong>${businessName}</strong> is ready.
                Share the link below with your clients so they can book appointments 24/7.
              </p>

              <!-- Booking Link Card -->
              <div style="background-color:#eef2ff;border:2px solid #6366f1;border-radius:10px;padding:25px;text-align:center;margin-bottom:25px;">
                <p style="margin:0 0 12px;color:#312e81;font-size:14px;font-weight:600;">Your Booking Link</p>
                <a href="${bookingLink}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#ec4899 0%,#8b5cf6 100%);color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-size:16px;box-shadow:0 4px 6px rgba(236,72,153,0.3);">
                  Open Booking Page
                </a>
                <p style="margin:15px 0 0;color:#6366f1;font-size:14px;word-break:break-all;">
                  <a href="${bookingLink}" style="color:#6366f1;text-decoration:underline;">${bookingLink}</a>
                </p>
              </div>

              <div style="background-color:#f9fafb;border-radius:8px;padding:20px;text-align:center;">
                <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">
                  Tip: Add this link to your Instagram bio, Facebook page, and Google Business listing to get more bookings.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:25px 40px;background-color:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0 0 8px;color:#111827;font-size:14px;font-weight:600;">BMS PRO PINK</p>
              <p style="margin:0;color:#6b7280;font-size:12px;line-height:1.5;">
                This is an automated email. Please do not reply.<br>
                If you need help, contact our support team.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

    const msg = {
      to: to.trim().toLowerCase(),
      from: FROM_EMAIL,
      subject: `Your Booking Page is Live - ${businessName}`,
      html,
      trackingSettings: { clickTracking: { enable: false } },
    };

    await sgMail.send(msg);
    console.log(`[EMAIL] ✅ Booking-link email sent to ${to}`);
    return { success: true };
  } catch (error: any) {
    const errMsg =
      error?.response?.body?.errors?.[0]?.message ||
      error?.message ||
      "Unknown error";
    console.error(`[EMAIL] ❌ Failed to send booking-link email:`, errMsg);
    return { success: false, error: errMsg };
  }
};
