import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";

export type BlueprintWorkspaceState = FunctionReturnType<
	typeof api.blueprint.getBlueprintWorkspaceState
>;
