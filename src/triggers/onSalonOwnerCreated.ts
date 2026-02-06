import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions/v2";
import { db } from "../config/firebase";
import { generateUniqueSlug } from "../utils/slug";
import { sendBookingLinkEmail } from "../utils/email";
import type { SalonOwnerDoc } from "../types/salon";

/**
 * Trigger: Fires when a new document is created in the `users` collection.
 *
 * If the new user is a salon_owner:
 *   1. Generate a unique slug from the business name.
 *   2. Save the slug back to the document.
 *   3. Send a "Booking Page Live" email with the link.
 */
export const onSalonOwnerCreated = onDocumentCreated(
  "users/{userId}",
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
      logger.warn("onSalonOwnerCreated: No data in event.");
      return;
    }

    const data = snapshot.data() as SalonOwnerDoc;
    const userId = event.params.userId;

    // Only process salon owners
    if (data.role !== "salon_owner") {
      logger.info(`Skipping user ${userId} — role is "${data.role}", not salon_owner.`);
      return;
    }

    logger.info(`New salon owner detected: ${data.name} (${userId})`);

    // ── 1. Generate & persist slug ──────────────────────────────────────────
    let slug = data.slug;

    if (!slug) {
      slug = await generateUniqueSlug(data.name || "salon");
      await db.collection("users").doc(userId).update({ slug });
      logger.info(`Slug "${slug}" assigned to salon owner ${userId}`);
    } else {
      logger.info(`Salon owner ${userId} already has slug "${slug}"`);
    }

    // ── 2. Construct the public booking link ────────────────────────────────
    const bookingLink = `https://book.bmspros.com.au/${slug}`;

    // ── 3. Send the "Your booking page is live" email ───────────────────────
    try {
      await sendBookingLinkEmail({
        to: data.email,
        businessName: data.name,
        bookingLink,
        ownerName: data.displayName || data.name,
      });
    } catch (err) {
      // Don't let email failure break the function — the slug is already saved
      logger.error(`Failed to send booking-link email to ${data.email}:`, err);
    }

    logger.info(`✅ Salon owner setup complete for ${data.name} → ${bookingLink}`);
  }
);
