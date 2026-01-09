export const SessionStatus = {
  ACCEPT: "accept",
  PENDING: "pending",
  REJECT: "reject",
} as const;

export type SessionStatusType =
  (typeof SessionStatus)[keyof typeof SessionStatus];
