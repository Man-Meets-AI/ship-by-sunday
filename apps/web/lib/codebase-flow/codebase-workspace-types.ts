import type { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";

export type CodebaseWorkspaceState = FunctionReturnType<
	typeof api.codebase.getCodebaseWorkspaceState
>;
