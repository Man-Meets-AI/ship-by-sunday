"use client";

import { useEffect, useRef } from "react";

import {
	type HomePageBlueprintDraftFields,
	clearHomePageBlueprintDraft,
	loadHomePageBlueprintDraft,
} from "@/app/_components/home-page/sections/blueprint-demo/home-page-blueprint-draft-storage";
import {
	type BlueprintPageDraftValues,
	type SaveProjectDefinitionFactsArgs,
	buildSavePayloadForBlueprint,
} from "@/lib/blueprint-flow/blueprint-page-draft-model";
import type { BlueprintWorkspaceState } from "@/lib/blueprint-flow/blueprint-workspace-types";

type SaveProjectDefinitionFactsCaller = (
	args: SaveProjectDefinitionFactsArgs,
) => Promise<unknown>;

export type BlueprintLocalDraftSeederOptions = {
	isAuthenticated: boolean;
	isAuthLoading: boolean;
	workspaceState: BlueprintWorkspaceState | null | undefined;
	saveProjectDefinitionFacts: SaveProjectDefinitionFactsCaller;
	loadDraftFromStorage?: () => HomePageBlueprintDraftFields | null;
	clearDraftFromStorage?: () => void;
	onSeedSuccess?: () => void;
};

function buildDraftValuesFromHomeBlueprintFields(
	fields: HomePageBlueprintDraftFields,
): BlueprintPageDraftValues {
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
	workspaceState: BlueprintWorkspaceState,
): boolean {
	const facts = workspaceState.projectDefinition?.facts ?? {};
	return Object.keys(facts).length === 0;
}

export function useBlueprintLocalDraftSeeder({
	isAuthenticated,
	isAuthLoading,
	workspaceState,
	saveProjectDefinitionFacts,
	loadDraftFromStorage = loadHomePageBlueprintDraft,
	clearDraftFromStorage = clearHomePageBlueprintDraft,
	onSeedSuccess,
}: BlueprintLocalDraftSeederOptions): void {
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

		const savePayload = buildSavePayloadForBlueprint(
			buildDraftValuesFromHomeBlueprintFields(storedFields),
		);
		const hasAnyPatch = Object.keys(savePayload.factsPatch).length > 0;
		if (!hasAnyPatch) {
			hasRunRef.current = true;
			clearDraftFromStorage();
			return;
		}

		hasRunRef.current = true;

		saveProjectDefinitionFacts(savePayload)
			.then(() => {
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
