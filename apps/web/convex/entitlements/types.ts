import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export type EntitlementQueryCtx = QueryCtx;
export type EntitlementMutationCtx = MutationCtx;
export type EntitlementReadCtx = QueryCtx | MutationCtx;

export type ProductAccessGrantDoc = Doc<"productAccessGrants">;
export type ProductAccessGrantSource = ProductAccessGrantDoc["source"];
