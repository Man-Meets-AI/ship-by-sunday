"use client";

import { useEffect, useRef, useState } from "react";

import type { WorkbenchField } from "@/lib/course/manifest";

const FIRST_SLICE_EXAMPLE =
	"User can create an account and reach the Mission page.";
const DEFINITION_OF_DONE_EXAMPLE =
	"New user signs up, lands on Mission, and sees Day 1 checklist without errors.";

function getTextValue(fieldValues: Record<string, unknown>, fieldId: string) {
	const value = fieldValues[fieldId];
	return typeof value === "string" ? value : "";
}

export function useBuildKickoffFlow({
	fieldValues,
	onFieldChange,
	fields,
}: {
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	fields: WorkbenchField[];
}) {
	const currentPath =
		typeof fieldValues.build_path === "string" ? fieldValues.build_path : null;
	const firstSliceValue = getTextValue(fieldValues, "first_slice");
	const definitionOfDoneValue = getTextValue(fieldValues, "definition_of_done");
	const firstSliceTrimmed = firstSliceValue.trim();
	const definitionOfDoneTrimmed = definitionOfDoneValue.trim();
	const hasPath =
		currentPath === "Use template" || currentPath === "Custom path";
	const hasFirstSlice = firstSliceTrimmed.length > 0;
	const hasDefinitionOfDone = definitionOfDoneTrimmed.length > 0;
	const [activeStep, setActiveStep] = useState<1 | 2 | 3>(() => {
		if (!hasPath) {
			return 1;
		}

		if (!hasFirstSlice) {
			return 2;
		}

		return 3;
	});
	const seededExamplesRef = useRef(false);
	const firstSliceField = fields.find((field) => field.id === "first_slice");
	const definitionOfDoneField = fields.find(
		(field) => field.id === "definition_of_done",
	);
	const progressItems = [
		{ id: "choose-path", label: "1. Choose path", complete: hasPath },
		{ id: "name-slice", label: "2. Name first slice", complete: hasFirstSlice },
		{
			id: "define-done",
			label: "3. Define done",
			complete: hasDefinitionOfDone,
		},
	];

	useEffect(() => {
		if (seededExamplesRef.current) {
			return;
		}

		const nextFirstSlice = getTextValue(fieldValues, "first_slice").trim();
		const nextDefinitionOfDone = getTextValue(
			fieldValues,
			"definition_of_done",
		).trim();

		if (!nextFirstSlice) {
			onFieldChange("first_slice", FIRST_SLICE_EXAMPLE);
		}

		if (!nextDefinitionOfDone) {
			onFieldChange("definition_of_done", DEFINITION_OF_DONE_EXAMPLE);
		}

		seededExamplesRef.current = true;
	}, [fieldValues, onFieldChange]);

	useEffect(() => {
		if (activeStep === 2 && !hasPath) {
			setActiveStep(1);
			return;
		}

		if (activeStep === 3 && !hasPath) {
			setActiveStep(1);
			return;
		}

		if (activeStep === 3 && !hasFirstSlice) {
			setActiveStep(2);
		}
	}, [activeStep, hasFirstSlice, hasPath]);

	useEffect(() => {
		if (activeStep === 1 && hasPath) {
			setActiveStep(2);
		}
	}, [activeStep, hasPath]);

	useEffect(() => {
		if (activeStep === 2 && hasFirstSlice) {
			setActiveStep(3);
		}
	}, [activeStep, hasFirstSlice]);

	return {
		currentPath,
		firstSliceTrimmed,
		definitionOfDoneTrimmed,
		hasPath,
		hasFirstSlice,
		hasDefinitionOfDone,
		activeStep,
		setActiveStep,
		firstSliceField,
		definitionOfDoneField,
		progressItems,
		readyToGenerate: hasPath && hasFirstSlice && hasDefinitionOfDone,
		resetKey: `${currentPath ?? "none"}|${firstSliceTrimmed}|${definitionOfDoneTrimmed}`,
	};
}
