/**
 * BMSPro Pink - Firebase Cloud Functions
 *
 * Main entry point. All Cloud Functions must be exported from here.
 */

// --- Firestore Triggers ---
export { onSalonOwnerCreated } from "./triggers/onSalonOwnerCreated";

// --- Slug Management ---
export { migrateSlugs } from "./triggers/migrateSlugs";
