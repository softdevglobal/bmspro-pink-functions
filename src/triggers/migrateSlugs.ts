import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";
import { db } from "../config/firebase";
import { generateUniqueSlug } from "../utils/slug";

/**
 * One-time migration: HTTPS-callable function to backfill `slug` for
 * all existing salon owners that don't have one yet.
 *
 * Call it once via:
 *   curl https://<region>-bmspro-pink.cloudfunctions.net/migrateSlugs
 *
 * ⚠️  Remove or disable this function after migration is complete.
 */
export const migrateSlugs = onRequest(
  { cors: false },
  async (_req, res) => {
    logger.info("Starting slug migration for existing salon owners…");

    const snapshot = await db
      .collection("users")
      .where("role", "==", "salon_owner")
      .get();

    let migrated = 0;
    let skipped = 0;
    const results: Array<{ id: string; name: string; slug: string }> = [];

    const bookingEngineBaseUrl = "https://pink.bmspros.com.au/book-now";

    for (const doc of snapshot.docs) {
      const data = doc.data();

      // Skip if slug and bookingEngineUrl already exist
      if (data.slug && data.bookingEngineUrl) {
        skipped++;
        continue;
      }

      const businessName = data.name || data.displayName || "salon";
      const slug = data.slug || await generateUniqueSlug(businessName);
      const bookingEngineUrl = `${bookingEngineBaseUrl}/${slug}`;

      await db.collection("users").doc(doc.id).update({ slug, bookingEngineUrl });

      results.push({ id: doc.id, name: businessName, slug });
      migrated++;
      logger.info(`Migrated: ${businessName} → ${slug} (${bookingEngineUrl})`);
    }

    const summary = {
      totalOwners: snapshot.size,
      migrated,
      skipped,
      results,
    };

    logger.info("Slug migration complete.", summary);
    res.status(200).json(summary);
  }
);
