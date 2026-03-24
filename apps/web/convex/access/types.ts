import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export type AccessQueryCtx = QueryCtx;
export type AccessMutationCtx = MutationCtx;
export type AccessReadCtx = QueryCtx | MutationCtx;

export type ProductAccessGrantDoc = Doc<"productAccessGrants">;
export type ProductAccessGrantSource = ProductAccessGrantDoc["source"];
