export type ConvexDocument = Record<string, unknown> & { _id: string };

export type UserDoc = ConvexDocument & {
  authProvider: string;
  authSubject: string;
  email?: string;
  imageUrl?: string;
  name?: string;
  defaultWorkspaceId?: string;
  createdAt: number;
  updatedAt: number;
};

export type WorkspaceDoc = ConvexDocument & {
  name: string;
  slug: string;
  personalOwnerAuthSubject?: string;
  createdByUserId: string;
  createdAt: number;
  updatedAt: number;
};

export type MembershipDoc = ConvexDocument & {
  workspaceId: string;
  userId: string;
  role: string;
  createdAt: number;
};

export type EntitlementDoc = ConvexDocument & {
  workspaceId: string;
  key: string;
  source: string;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
};

export type StripeCustomerDoc = ConvexDocument & {
  workspaceId: string;
  stripeCustomerId: string;
  email?: string;
  createdAt: number;
  updatedAt: number;
};

export type SubscriptionDoc = ConvexDocument & {
  workspaceId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripePriceId?: string;
  stripeProductId?: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd?: number;
  createdAt: number;
  updatedAt: number;
};

export type NoteDoc = ConvexDocument & {
  workspaceId: string;
  createdByUserId: string;
  title: string;
  body: string;
  createdAt: number;
  updatedAt: number;
};

export type ProcessedStripeEventDoc = ConvexDocument & {
  stripeEventId: string;
  type: string;
  workspaceId?: string;
  status: "applied" | "skipped";
  processedAt: number;
};

type QueryOperator = {
  eq: (field: string, value: unknown) => QueryOperator;
};

type QueryResult = {
  unique: () => Promise<ConvexDocument | null>;
  collect: () => Promise<ConvexDocument[]>;
  order: (direction: "asc" | "desc") => {
    take: (count: number) => Promise<ConvexDocument[]>;
  };
  take: (count: number) => Promise<ConvexDocument[]>;
};

export type DatabaseLike = {
  query: (table: string) => {
    withIndex: (
      indexName: string,
      cb: (query: QueryOperator) => QueryOperator,
    ) => QueryResult;
  };
  get: (id: string) => Promise<ConvexDocument | null>;
  insert: (table: string, value: Record<string, unknown>) => Promise<string>;
  patch: (id: string, value: Record<string, unknown>) => Promise<void>;
};

export type AuthLike = {
  getUserIdentity: () => Promise<{ subject: string } | null>;
};

export type SchedulerLike = {
  runAfter: (
    delayMs: number,
    reference: unknown,
    args: Record<string, unknown>,
  ) => Promise<unknown>;
};
