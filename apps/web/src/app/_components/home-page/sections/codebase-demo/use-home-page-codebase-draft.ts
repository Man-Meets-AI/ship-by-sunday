"use client";

import { buildDesignPresetFactSeed } from "@shipbysunday/codebase-compiler";
import { useCallback, useEffect, useRef, useState } from "react";

import {
	type HomePageCodebaseDraftFields,
	type HomePageCodebasePricingModel,
	loadHomePageCodebaseDraft,
	saveHomePageCodebaseDraft,
} from "./home-page-codebase-draft-storage";

export type HomePageCodebaseDraftDefaults = {
	defaultPresetId: string;
	defaultPricingModel: HomePageCodebasePricingModel;
	defaultPrice: string;
};

const SAVE_LOCALLY_DEBOUNCE_MS = 600;

function buildInitialDraftFields(
	defaults: HomePageCodebaseDraftDefaults,
): HomePageCodebaseDraftFields {
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

export type HomePageCodebaseDraftHandle = {
	fields: HomePageCodebaseDraftFields;
	lastSavedAt: number | null;
	setFoundationField: (
		fieldKey: "product_name" | "product_summary" | "primary_user",
		nextValue: string,
	) => void;
	selectDesignPreset: (presetId: string) => void;
	setPricingModel: (model: HomePageCodebasePricingModel) => void;
	setPricing: (price: string) => void;
	persistNow: () => void;
};

export function useHomePageCodebaseDraft(
	defaults: HomePageCodebaseDraftDefaults,
): HomePageCodebaseDraftHandle {
	const [fields, setFields] = useState<HomePageCodebaseDraftFields>(() =>
		buildInitialDraftFields(defaults),
	);
	const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
	const fieldsRef = useRef(fields);
	const hasUserEditedRef = useRef(false);

	useEffect(() => {
		fieldsRef.current = fields;
	}, [fields]);

	useEffect(() => {
		const storedFields = loadHomePageCodebaseDraft();
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
			saveHomePageCodebaseDraft(fieldsRef.current);
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

	const setPricingModel = useCallback((model: HomePageCodebasePricingModel) => {
		hasUserEditedRef.current = true;
		setFields((currentFields) => ({
			...currentFields,
			pricing_model: model,
		}));
	}, []);

	const setPricing = useCallback((price: string) => {
		hasUserEditedRef.current = true;
		setFields((currentFields) => ({
			...currentFields,
			pricing: price,
		}));
	}, []);

	const persistNow = useCallback(() => {
		saveHomePageCodebaseDraft(fieldsRef.current);
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
