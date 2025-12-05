export const paymentFilterableFields = [
  "status",
  "userId",
  "subscriptionId",
  "currency",
  "startDate",
  "endDate",
];

export const paymentSearchableFields: string[] = []; // No searchable fields

// Payment Status Enum (matching database values)
export const paymentStatusEnum = [
  "SUCCEEDED",
  "PENDING",
  "REFUNDED",
  "FAILED",
] as const;

// Currency codes (common ones)
export const currencyEnum = [
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "JPY",
  "INR",
  "BDT",
] as const;

