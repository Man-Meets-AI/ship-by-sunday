"use client";

import { useConvexAuth, useMutation } from "convex/react";
import { useCallback } from "react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import { useBlueprintLocalDraftSeeder } from "@/lib/blueprint-flow/use-blueprint-local-draft-seeder";
import type { BlueprintWorkspaceState } from "@/lib/blueprint-flow/blueprint-workspace-types";

const SEEDER_SUCCESS_TOAST_ID = "blueprint-local-draft-seeder-success";

export function BlueprintLocalDraftSeeder({
	workspaceState,
}: {
	readonly workspaceState: BlueprintWorkspaceState | null | undefined;
}) {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const saveProjectDefinitionFacts = useMutation(
		api.blueprint.saveProjectDefinitionFacts,
	);

	const handleSeedSuccess = useCallback(() => {
		toast.success("We carried your homepage answers in", {
			id: SEEDER_SUCCESS_TOAST_ID,
			description:
				"Foundation, Design, and Pricing are prefilled. Lock in the rest of the Blueprint to generate.",
			duration: 6000,
		});
	}, []);

	useBlueprintLocalDraftSeeder({
		isAuthenticated,
		isAuthLoading: isLoading,
		workspaceState,
		saveProjectDefinitionFacts,
		onSeedSuccess: handleSeedSuccess,
	});

	return null;
}
