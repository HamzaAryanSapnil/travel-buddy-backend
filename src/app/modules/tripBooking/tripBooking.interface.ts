export type TCreateBookingPayload = {
  planId: string;
  message?: string;
};

export type TRespondBookingPayload = {
  status: "APPROVED" | "REJECTED";
};

