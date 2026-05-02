"use client";

import { useConvexAuth, useMutation } from "convex/react";

import { api } from "@/convex/_generated/api";
import { useBlueprintLocalDraftSeeder } from "@/lib/blueprint-flow/use-blueprint-local-draft-seeder";
import type { BlueprintWorkspaceState } from "@/lib/blueprint-flow/blueprint-workspace-types";

export function BlueprintLocalDraftSeeder({
	workspaceState,
}: {
	readonly workspaceState: BlueprintWorkspaceState | null | undefined;
}) {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const saveProjectDefinitionFacts = useMutation(
		api.blueprint.saveProjectDefinitionFacts,
	);

	useBlueprintLocalDraftSeeder({
		isAuthenticated,
		isAuthLoading: isLoading,
		workspaceState,
		saveProjectDefinitionFacts,
	});

	return null;
}
