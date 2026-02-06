/**
 * Salon Owner document shape in the `users` collection.
 * Matches the existing schema from the Admin Panel signup flow.
 */
export interface SalonOwnerDoc {
  // Identity
  uid: string;
  email: string;
  displayName: string;
  role: "salon_owner";
  provider: string;

  // Business fields
  name: string; // Business name
  slug?: string; // URL-friendly business name (for booking engine)
  bookingEngineUrl?: string; // Full booking engine URL (e.g., "https://pink.bmspros.com.au/book-now/abc-salon")
  businessType?: string | null;
  abn?: string | null;
  businessStructure?: string | null;
  gstRegistered?: boolean;
  state?: string | null;
  timezone?: string;
  locationText?: string | null;
  contactPhone?: string | null;

  // Plan details
  plan?: string;
  price?: string | null;
  planId?: string;
  plan_key?: string | null;
  branchLimit?: number;
  currentBranchCount?: number;
  branchNames?: string[];
  staffLimit?: number;
  currentStaffCount?: number;

  // Payment/Status
  status?: string;
  accountStatus?: string;
  subscriptionStatus?: string;
  billing_status?: string;

  // Trial
  trialDays?: number;
  hasFreeTrial?: boolean;
  trial_start?: any;
  trial_end?: any;
  paymentDetailsRequired?: boolean;

  // Branding (for booking engine theming)
  colors?: {
    primary?: string;
    secondary?: string;
  };

  // Source
  signupSource?: string;

  // Timestamps
  createdAt?: any;
  updatedAt?: any;
}
