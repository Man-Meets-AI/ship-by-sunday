import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export type BlueprintQueryCtx = QueryCtx;
export type BlueprintMutationCtx = MutationCtx;
export type BlueprintReadCtx = QueryCtx | MutationCtx;

export type ProjectDefinitionDoc = Doc<"projectDefinitions">;
export type BlueprintWorkflowStateDoc = Doc<"blueprintWorkflowStates">;
