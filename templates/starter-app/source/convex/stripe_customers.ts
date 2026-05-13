import type { StripeCustomerDoc } from "./types";

type StripeCustomerDatabase = {
  insert: (...args: unknown[]) => Promise<string>;
  patch: (...args: unknown[]) => Promise<void>;
  query: (table: string) => {
    withIndex: (
      indexName: string,
      cb: (query: { eq: (field: string, value: unknown) => unknown }) => unknown,
    ) => {
      unique: () => Promise<unknown>;
    };
  };
};

type StripeCustomerConflictStrategy = "preserve_existing" | "throw";

function createStripeCustomerConflictError(message: string) {
  return new Error(message);
}

async function getStripeCustomerByStripeId(
  db: StripeCustomerDatabase,
  stripeCustomerId: string,
) {
  return (await db
    .query("stripeCustomers")
    .withIndex("by_stripe_customer_id", (query) =>
      query.eq("stripeCustomerId", stripeCustomerId),
    )
    .unique()) as StripeCustomerDoc | null;
}

async function getStripeCustomerByWorkspaceId(
  db: StripeCustomerDatabase,
  workspaceId: string,
) {
  return (await db
    .query("stripeCustomers")
    .withIndex("by_workspace", (query) => query.eq("workspaceId", workspaceId))
    .unique()) as StripeCustomerDoc | null;
}

export async function upsertStripeCustomerMapping(args: {
  conflictStrategy: StripeCustomerConflictStrategy;
  db: unknown;
  email?: string;
  now: number;
  stripeCustomerId: string;
  workspaceId: string;
}) {
  const db = args.db as StripeCustomerDatabase;
  const existingCustomerByStripeId = await getStripeCustomerByStripeId(
    db,
    args.stripeCustomerId,
  );

  if (existingCustomerByStripeId) {
    if (existingCustomerByStripeId.workspaceId !== args.workspaceId) {
      throw createStripeCustomerConflictError(
        "Stripe customer is already assigned to a different workspace.",
      );
    }

    await db.patch(existingCustomerByStripeId._id, {
      email: args.email ?? existingCustomerByStripeId.email,
      updatedAt: args.now,
    });

    return existingCustomerByStripeId.stripeCustomerId;
  }

  const existingCustomerByWorkspace = await getStripeCustomerByWorkspaceId(
    db,
    args.workspaceId,
  );

  if (existingCustomerByWorkspace) {
    if (
      existingCustomerByWorkspace.stripeCustomerId !== args.stripeCustomerId
    ) {
      if (args.conflictStrategy === "preserve_existing") {
        await db.patch(existingCustomerByWorkspace._id, {
          email: args.email ?? existingCustomerByWorkspace.email,
          updatedAt: args.now,
        });

        return existingCustomerByWorkspace.stripeCustomerId;
      }

      throw createStripeCustomerConflictError(
        "Workspace already has a different Stripe customer assigned.",
      );
    }

    await db.patch(existingCustomerByWorkspace._id, {
      email: args.email ?? existingCustomerByWorkspace.email,
      updatedAt: args.now,
    });

    return existingCustomerByWorkspace.stripeCustomerId;
  }

  await db.insert("stripeCustomers", {
    workspaceId: args.workspaceId,
    stripeCustomerId: args.stripeCustomerId,
    email: args.email,
    createdAt: args.now,
    updatedAt: args.now,
  });

  return args.stripeCustomerId;
}
