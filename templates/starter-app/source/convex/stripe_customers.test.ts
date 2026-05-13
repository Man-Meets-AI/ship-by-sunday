import { describe, expect, it, vi } from "vitest";

import { upsertStripeCustomerMapping } from "./stripe_customers";

type QueryOperator = {
  eq: (field: string, value: unknown) => QueryOperator;
};

function createDb(args?: { stripeCustomers?: Array<Record<string, unknown>> }) {
  const stripeCustomers = [...(args?.stripeCustomers ?? [])];

  return {
    stripeCustomers,
    db: {
      insert: vi.fn(async (table: string, value: Record<string, unknown>) => {
        if (table === "stripeCustomers") {
          stripeCustomers.push({
            _id: `stripe_customer_${stripeCustomers.length + 1}`,
            ...value,
          });
        }

        return `${table}_${stripeCustomers.length}`;
      }),
      patch: vi.fn(async (id: string, value: Record<string, unknown>) => {
        const existingCustomer = stripeCustomers.find(
          (customer) => customer._id === id,
        );

        if (existingCustomer) {
          Object.assign(existingCustomer, value);
        }
      }),
      query: vi.fn((table: string) => ({
        withIndex: vi.fn(
          (_indexName: string, cb: (query: QueryOperator) => unknown) => {
            const filters: Record<string, unknown> = {};
            const queryOperator: QueryOperator = {
              eq(field: string, value: unknown) {
                filters[field] = value;
                return queryOperator;
              },
            };

            cb(queryOperator);

            return {
              unique: vi.fn(async () => {
                if (table !== "stripeCustomers") {
                  return null;
                }

                if (filters.stripeCustomerId) {
                  return (
                    stripeCustomers.find(
                      (customer) =>
                        customer.stripeCustomerId === filters.stripeCustomerId,
                    ) ?? null
                  );
                }

                if (filters.workspaceId) {
                  return (
                    stripeCustomers.find(
                      (customer) =>
                        customer.workspaceId === filters.workspaceId,
                    ) ?? null
                  );
                }

                return null;
              }),
            };
          },
        ),
      })),
    },
  };
}

describe("upsertStripeCustomerMapping", () => {
  it("fails closed when a Stripe customer belongs to another workspace", async () => {
    const { db } = createDb({
      stripeCustomers: [
        {
          _id: "stripe_customer_1",
          workspaceId: "workspace_a",
          stripeCustomerId: "cus_123",
          createdAt: 1,
          updatedAt: 1,
        },
      ],
    });

    await expect(
      upsertStripeCustomerMapping({
        conflictStrategy: "throw",
        db: db as never,
        now: 2,
        stripeCustomerId: "cus_123",
        workspaceId: "workspace_b",
      }),
    ).rejects.toThrow(
      "Stripe customer is already assigned to a different workspace.",
    );
  });

  it("preserves the existing workspace mapping during duplicate customer races", async () => {
    const { db } = createDb({
      stripeCustomers: [
        {
          _id: "stripe_customer_1",
          workspaceId: "workspace_123",
          stripeCustomerId: "cus_existing",
          email: "hello@example.com",
          createdAt: 1,
          updatedAt: 1,
        },
      ],
    });

    await expect(
      upsertStripeCustomerMapping({
        conflictStrategy: "preserve_existing",
        db: db as never,
        email: "hello@example.com",
        now: 2,
        stripeCustomerId: "cus_raced",
        workspaceId: "workspace_123",
      }),
    ).resolves.toBe("cus_existing");
  });
});
