"use client";

import { useConvexAuth, useMutation } from "convex/react";
import { useCallback } from "react";
import { toast } from "sonner";

import { api } from "@/convex/_generated/api";
import { useCodebaseLocalDraftSeeder } from "@/lib/codebase-flow/use-codebase-local-draft-seeder";
import type { CodebaseWorkspaceState } from "@/lib/codebase-flow/codebase-workspace-types";

const SEEDER_SUCCESS_TOAST_ID = "codebase-local-draft-seeder-success";

export function CodebaseLocalDraftSeeder({
	workspaceState,
}: {
	readonly workspaceState: CodebaseWorkspaceState | null | undefined;
}) {
	const { isAuthenticated, isLoading } = useConvexAuth();
	const saveProjectDefinitionFacts = useMutation(
		api.codebase.saveProjectDefinitionFacts,
	);

	const handleSeedSuccess = useCallback(() => {
		toast.success("We carried your homepage answers in", {
			id: SEEDER_SUCCESS_TOAST_ID,
			description:
				"Foundation, Design, and Pricing are prefilled. Lock in the rest of the Codebase to generate.",
			duration: 6000,
		});
	}, []);

	useCodebaseLocalDraftSeeder({
		isAuthenticated,
		isAuthLoading: isLoading,
		workspaceState,
		saveProjectDefinitionFacts,
		onSeedSuccess: handleSeedSuccess,
	});

	return null;
}
