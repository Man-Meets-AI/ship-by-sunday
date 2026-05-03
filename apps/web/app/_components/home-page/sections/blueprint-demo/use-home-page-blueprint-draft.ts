"use client";

import { buildDesignPresetFactSeed } from "@shipbysunday/blueprint-compiler";
import { useCallback, useEffect, useRef, useState } from "react";

import {
	type HomePageBlueprintDraftFields,
	type HomePageBlueprintPricingModel,
	loadHomePageBlueprintDraft,
	saveHomePageBlueprintDraft,
} from "./home-page-blueprint-draft-storage";

export type HomePageBlueprintDraftDefaults = {
	defaultPresetId: string;
	defaultPricingModel: HomePageBlueprintPricingModel;
	defaultPrice: string;
};

const SAVE_LOCALLY_DEBOUNCE_MS = 600;

function buildInitialDraftFields(
	defaults: HomePageBlueprintDraftDefaults,
): HomePageBlueprintDraftFields {
	const designSeed = buildDesignPresetFactSeed(defaults.defaultPresetId);
	return {
		product_name: "",
		product_summary: "",
		primary_user: "",
		design_preset_id: designSeed.design_preset_id,
		theme_preset: designSeed.theme_preset,
		pricing_model: defaults.defaultPricingModel,
		pricing: defaults.defaultPrice,
	};
}

export type HomePageBlueprintDraftHandle = {
	fields: HomePageBlueprintDraftFields;
	lastSavedAt: number | null;
	setFoundationField: (
		fieldKey: "product_name" | "product_summary" | "primary_user",
		nextValue: string,
	) => void;
	selectDesignPreset: (presetId: string) => void;
	setPricingModel: (model: HomePageBlueprintPricingModel) => void;
	setPricing: (price: string) => void;
	persistNow: () => void;
};

export function useHomePageBlueprintDraft(
	defaults: HomePageBlueprintDraftDefaults,
): HomePageBlueprintDraftHandle {
	const [fields, setFields] = useState<HomePageBlueprintDraftFields>(() =>
		buildInitialDraftFields(defaults),
	);
	const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
	const fieldsRef = useRef(fields);
	const hasUserEditedRef = useRef(false);

	useEffect(() => {
		fieldsRef.current = fields;
	}, [fields]);

	useEffect(() => {
		const storedFields = loadHomePageBlueprintDraft();
		if (!storedFields) {
			return;
		}
		setFields(storedFields);
		fieldsRef.current = storedFields;
	}, []);

	useEffect(() => {
		if (!hasUserEditedRef.current) {
			return;
		}
		const handle = window.setTimeout(() => {
			saveHomePageBlueprintDraft(fieldsRef.current);
			setLastSavedAt(Date.now());
		}, SAVE_LOCALLY_DEBOUNCE_MS);
		return () => {
			window.clearTimeout(handle);
		};
	}, [fields]);

	const setFoundationField = useCallback(
		(
			fieldKey: "product_name" | "product_summary" | "primary_user",
			nextValue: string,
		) => {
			hasUserEditedRef.current = true;
			setFields((currentFields) => ({
				...currentFields,
				[fieldKey]: nextValue,
			}));
		},
		[],
	);

	const selectDesignPreset = useCallback((presetId: string) => {
		hasUserEditedRef.current = true;
		const designSeed = buildDesignPresetFactSeed(presetId);
		setFields((currentFields) => ({
			...currentFields,
			design_preset_id: designSeed.design_preset_id,
			theme_preset: designSeed.theme_preset,
		}));
	}, []);

	const setPricingModel = useCallback(
		(model: HomePageBlueprintPricingModel) => {
			hasUserEditedRef.current = true;
			setFields((currentFields) => ({
				...currentFields,
				pricing_model: model,
			}));
		},
		[],
	);

	const setPricing = useCallback((price: string) => {
		hasUserEditedRef.current = true;
		setFields((currentFields) => ({
			...currentFields,
			pricing: price,
		}));
	}, []);

	const persistNow = useCallback(() => {
		saveHomePageBlueprintDraft(fieldsRef.current);
		setLastSavedAt(Date.now());
	}, []);

	return {
		fields,
		lastSavedAt,
		setFoundationField,
		selectDesignPreset,
		setPricingModel,
		setPricing,
		persistNow,
	};
}
