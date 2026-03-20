"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import type { WorkbenchField } from "@/features/course/lesson/model/manifest";

import { BUILD_PRODUCT_ITERATION_FIELD_IDS } from "./build-product-iteration-constants";
import { BuildProductIterationBrandResponseCard } from "./build-product-iteration-brand-response-card";
import { BuildProductIterationPromptCard } from "./build-product-iteration-prompt-card";
import { BuildProductIterationStarterPostsCards } from "./build-product-iteration-starter-posts-cards";

type BuildProductIterationOutputsTabProps = {
	fieldsById: Map<string, WorkbenchField>;
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	invalidFieldIds: Set<string>;
	invalidFieldMessages: Map<string, string>;
};

function stringField(
	fieldValues: Record<string, unknown>,
	fieldId: string,
): string {
	const raw = fieldValues[fieldId];
	return typeof raw === "string" ? raw : "";
}

export function BuildProductIterationOutputsTab({
	fieldsById,
	fieldValues,
	onFieldChange,
	invalidFieldIds,
	invalidFieldMessages,
}: BuildProductIterationOutputsTabProps) {
	const fieldMessage = (fieldId: string) => {
		if (!invalidFieldIds.has(fieldId)) {
			return null;
		}
		return (
			invalidFieldMessages.get(fieldId) ?? "Finish this before continuing."
		);
	};

	const strategyVal = stringField(
		fieldValues,
		BUILD_PRODUCT_ITERATION_FIELD_IDS.brandStrategy,
	);
	const designVal = stringField(
		fieldValues,
		BUILD_PRODUCT_ITERATION_FIELD_IDS.brandDesign,
	);
	const starterVal = stringField(
		fieldValues,
		BUILD_PRODUCT_ITERATION_FIELD_IDS.starterIdea,
	);
	const postsVal = stringField(
		fieldValues,
		BUILD_PRODUCT_ITERATION_FIELD_IDS.generatedPosts,
	);

	return (
		<div className="space-y-5">
			<Alert>
				<AlertTitle className="flex flex-wrap items-center gap-2">
					v1 templates
					<Badge variant="secondary">Provisional</Badge>
				</AlertTitle>
				<AlertDescription className="mt-2 text-sm">
					Posts and prompts here are starting points—expect to refine tone and
					format after you ship.
				</AlertDescription>
			</Alert>

			<BuildProductIterationPromptCard />

			<BuildProductIterationBrandResponseCard
				strategyField={fieldsById.get(
					BUILD_PRODUCT_ITERATION_FIELD_IDS.brandStrategy,
				)}
				designField={fieldsById.get(
					BUILD_PRODUCT_ITERATION_FIELD_IDS.brandDesign,
				)}
				strategyVal={strategyVal}
				designVal={designVal}
				onFieldChange={onFieldChange}
				invalidFieldIds={invalidFieldIds}
				fieldMessage={fieldMessage}
			/>

			<BuildProductIterationStarterPostsCards
				starterField={fieldsById.get(
					BUILD_PRODUCT_ITERATION_FIELD_IDS.starterIdea,
				)}
				postsField={fieldsById.get(
					BUILD_PRODUCT_ITERATION_FIELD_IDS.generatedPosts,
				)}
				starterVal={starterVal}
				postsVal={postsVal}
				strategyVal={strategyVal}
				designVal={designVal}
				onFieldChange={onFieldChange}
				invalidFieldIds={invalidFieldIds}
				fieldMessage={fieldMessage}
			/>
		</div>
	);
}
