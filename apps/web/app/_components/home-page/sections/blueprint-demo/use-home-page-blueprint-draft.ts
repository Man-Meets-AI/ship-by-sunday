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
	const fieldsRef = useRef(fields);

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

	const setFoundationField = useCallback(
		(
			fieldKey: "product_name" | "product_summary" | "primary_user",
			nextValue: string,
		) => {
			setFields((currentFields) => ({
				...currentFields,
				[fieldKey]: nextValue,
			}));
		},
		[],
	);

	const selectDesignPreset = useCallback((presetId: string) => {
		const designSeed = buildDesignPresetFactSeed(presetId);
		setFields((currentFields) => ({
			...currentFields,
			design_preset_id: designSeed.design_preset_id,
			theme_preset: designSeed.theme_preset,
		}));
	}, []);

	const setPricingModel = useCallback(
		(model: HomePageBlueprintPricingModel) => {
			setFields((currentFields) => ({
				...currentFields,
				pricing_model: model,
			}));
		},
		[],
	);

	const setPricing = useCallback((price: string) => {
		setFields((currentFields) => ({
			...currentFields,
			pricing: price,
		}));
	}, []);

	const persistNow = useCallback(() => {
		saveHomePageBlueprintDraft(fieldsRef.current);
	}, []);

	return {
		fields,
		setFoundationField,
		selectDesignPreset,
		setPricingModel,
		setPricing,
		persistNow,
	};
}
