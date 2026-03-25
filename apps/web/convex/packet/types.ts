import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export type PacketQueryCtx = QueryCtx;
export type PacketMutationCtx = MutationCtx;
export type PacketReadCtx = QueryCtx | MutationCtx;

export type ProjectDefinitionDoc = Doc<"projectDefinitions">;
