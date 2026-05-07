"use client";

import { useEffect, useRef } from "react";

import {
	type HomePageCodebaseDraftFields,
	clearHomePageCodebaseDraft,
	loadHomePageCodebaseDraft,
} from "@/app/_components/home-page/sections/codebase-demo/home-page-codebase-draft-storage";
import {
	type CodebasePageDraftValues,
	type SaveProjectDefinitionFactsArgs,
	buildSavePayloadForCodebase,
} from "@/lib/codebase-flow/codebase-page-draft-model";
import type { CodebaseWorkspaceState } from "@/lib/codebase-flow/codebase-workspace-types";
import { isSupportModeBlockedMutationResult } from "@/platform/admin-impersonation";

type SaveProjectDefinitionFactsCaller = (
	args: SaveProjectDefinitionFactsArgs,
) => Promise<object | null>;

export type CodebaseLocalDraftSeederOptions = {
	isAuthenticated: boolean;
	isAuthLoading: boolean;
	workspaceState: CodebaseWorkspaceState | null | undefined;
	saveProjectDefinitionFacts: SaveProjectDefinitionFactsCaller;
	loadDraftFromStorage?: () => HomePageCodebaseDraftFields | null;
	clearDraftFromStorage?: () => void;
	onSeedSuccess?: () => void;
};

function buildDraftValuesFromHomeCodebaseFields(
	fields: HomePageCodebaseDraftFields,
): CodebasePageDraftValues {
	return {
		product_name: fields.product_name,
		product_summary: fields.product_summary,
		primary_user: fields.primary_user,
		design_preset_id: fields.design_preset_id,
		theme_preset: fields.theme_preset,
		pricing_model: fields.pricing_model,
		pricing: fields.pricing,
	};
}

function isWorkspaceFactsEmpty(
	workspaceState: CodebaseWorkspaceState,
): boolean {
	const facts = workspaceState.projectDefinition?.facts ?? {};
	return Object.keys(facts).length === 0;
}

export function useCodebaseLocalDraftSeeder({
	isAuthenticated,
	isAuthLoading,
	workspaceState,
	saveProjectDefinitionFacts,
	loadDraftFromStorage = loadHomePageCodebaseDraft,
	clearDraftFromStorage = clearHomePageCodebaseDraft,
	onSeedSuccess,
}: CodebaseLocalDraftSeederOptions): void {
	const hasRunRef = useRef(false);
	const onSeedSuccessRef = useRef(onSeedSuccess);

	useEffect(() => {
		onSeedSuccessRef.current = onSeedSuccess;
	}, [onSeedSuccess]);

	useEffect(() => {
		if (hasRunRef.current) {
			return;
		}
		if (isAuthLoading || !isAuthenticated) {
			return;
		}
		if (!workspaceState) {
			return;
		}

		const storedFields = loadDraftFromStorage();
		if (!storedFields) {
			hasRunRef.current = true;
			return;
		}

		if (!isWorkspaceFactsEmpty(workspaceState)) {
			hasRunRef.current = true;
			clearDraftFromStorage();
			return;
		}

		const savePayload = buildSavePayloadForCodebase(
			buildDraftValuesFromHomeCodebaseFields(storedFields),
		);
		const hasAnyPatch = Object.keys(savePayload.factsPatch).length > 0;
		if (!hasAnyPatch) {
			hasRunRef.current = true;
			clearDraftFromStorage();
			return;
		}

		hasRunRef.current = true;

		saveProjectDefinitionFacts(savePayload)
			.then((result) => {
				if (isSupportModeBlockedMutationResult(result)) {
					hasRunRef.current = false;
					return;
				}
				clearDraftFromStorage();
				onSeedSuccessRef.current?.();
			})
			.catch(() => {
				hasRunRef.current = false;
			});
	}, [
		clearDraftFromStorage,
		isAuthLoading,
		isAuthenticated,
		loadDraftFromStorage,
		saveProjectDefinitionFacts,
		workspaceState,
	]);
}
