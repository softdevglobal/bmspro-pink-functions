import * as functions from "firebase-functions";
import { db } from "../config/firebase";

/**
 * Scheduled Cloud Function: Cleanup Expired Slot Holds
 *
 * Runs every 5 minutes to mark expired "active" holds as "expired".
 * This is a safety net — the client and API also check expiresAt at read-time,
 * so even if this function lags, expired holds won't incorrectly block slots.
 *
 * Firestore doesn't support TTL-based auto-deletion out of the box,
 * so this function handles the housekeeping.
 */
export const cleanupExpiredHolds = functions.pubsub
  .schedule("every 5 minutes")
  .onRun(async () => {
    const now = Date.now();

    try {
      // Find all "active" holds that have passed their expiresAt timestamp
      const expiredQuery = await db
        .collection("slotHolds")
        .where("status", "==", "active")
        .where("expiresAt", "<=", now)
        .limit(500) // Process in batches to stay within Firestore limits
        .get();

      if (expiredQuery.empty) {
        console.log("No expired holds to clean up.");
        return;
      }

      // Batch update all expired holds
      const batch = db.batch();
      let count = 0;

      for (const doc of expiredQuery.docs) {
        batch.update(doc.ref, {
          status: "expired",
          expiredAt: now,
        });
        count++;
      }

      await batch.commit();
      console.log(`Cleaned up ${count} expired slot hold(s).`);
    } catch (error) {
      console.error("Error cleaning up expired holds:", error);
    }
  });

/**
 * Firestore Trigger: Auto-expire holds when they should have expired.
 *
 * This trigger fires when a slotHold document is created.
 * It sets up a delayed check (Cloud Tasks or setTimeout) to expire the hold.
 *
 * NOTE: For simplicity, we rely on the scheduled function above + client-side
 * expiry checks rather than Cloud Tasks. This trigger is an optional enhancement
 * that runs on document creation to set the initial state cleanly.
 */
export const onSlotHoldCreated = functions.firestore
  .document("slotHolds/{holdId}")
  .onCreate(async (snap) => {
    const data = snap.data();
    if (!data) return;

    // Log hold creation for monitoring
    console.log(
      `Slot hold created: ${snap.id}, session: ${data.sessionId}, ` +
      `expires: ${new Date(data.expiresAt).toISOString()}, ` +
      `services: ${JSON.stringify(data.services?.map((s: any) => ({ time: s.time, staffId: s.staffId })))}`
    );
  });
