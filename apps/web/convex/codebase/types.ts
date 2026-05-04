import type { Doc } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export type CodebaseQueryCtx = QueryCtx;
export type CodebaseMutationCtx = MutationCtx;
export type CodebaseReadCtx = QueryCtx | MutationCtx;

export type ProjectDefinitionDoc = Doc<"projectDefinitions">;
export type CodebaseWorkflowStateDoc = Doc<"codebaseWorkflowStates">;
