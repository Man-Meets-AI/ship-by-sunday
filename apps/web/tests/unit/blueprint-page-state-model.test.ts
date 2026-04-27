import {
	buildDesignPresetFactSeed,
	createCanonicalProjectDefinition,
	createCompleteProjectDefinition,
	designPresetDerivedFactKeys,
} from "@shipbysunday/blueprint-compiler";
import { describe, expect, it } from "vitest";
import {
	buildFlattenedDraftValues,
	buildSavePayloadForBlueprint,
	clearStaleDerivedDesignFields,
	stripUntouchedGeneratedScopeFields,
} from "@/lib/blueprint-flow/blueprint-page-draft-model";
import {
	buildFieldErrors,
	buildPageFeedback,
	buildSectionStatuses,
} from "@/lib/blueprint-flow/blueprint-page-validation-model";

function createProjectFacts(factOverrides: Record<string, unknown> = {}) {
	return {
		...createCompleteProjectDefinition().facts,
		...factOverrides,
	};
}

describe("blueprint page state model", () => {
	it("builds flattened draft values and seeds contact email without overwriting saved values", () => {
		expect(
			buildFlattenedDraftValues(
				createProjectFacts({ contact_email: "" }),
				"founder@example.com",
			).contact_email,
		).toBe("founder@example.com");
		expect(
			buildFlattenedDraftValues(
				createProjectFacts({ contact_email: "saved@example.com" }),
				"founder@example.com",
			).contact_email,
		).toBe("saved@example.com");
	});

	it("keeps generated scope placeholders out of untouched save payloads", () => {
		const projectFacts = createProjectFacts({
			scope_in: undefined,
			scope_out: undefined,
		});
		const savedBaselineValues = buildFlattenedDraftValues(projectFacts);
		const savePayload = stripUntouchedGeneratedScopeFields({
			projectFacts,
			savedBaselineValues,
			savePayload: buildSavePayloadForBlueprint(savedBaselineValues),
		});

		expect(savePayload.factsPatch.scope_in).toBeUndefined();
		expect(savePayload.factsPatch.scope_out).toBeUndefined();
		expect(savePayload.clearedFieldKeys).not.toContain("scope_in");
		expect(savePayload.clearedFieldKeys).not.toContain("scope_out");
	});

	it("clears stale derived design facts when preset inputs change", () => {
		const projectFacts = createCanonicalProjectDefinition({
			clerkUserId: "user_123",
			productKey: "ship-by-sunday",
			facts: {
				product_name: "Ship by Sunday OS",
				product_summary: "Blueprint-first runtime",
				primary_user: "Founders",
				problem_statement: "Planning stays vague",
				problem_trigger:
					"They need a clear blueprint and repo handoff immediately.",
				problem_severity: "8",
				success_looks_like:
					"A founder downloads a working blueprint and repo zip.",
				core_flow: [
					"Capture product facts",
					"Unlock blueprints",
					"Download repo",
				],
				pricing: 29,
				design_preset_id: "vercel",
				theme_preset: buildDesignPresetFactSeed("vercel").theme_preset,
				design_references: ["https://getdesign.md/vercel/design-md"],
			},
			placeholdersInUse: [],
			createdAt: 1,
			updatedAt: 1,
		}).facts;
		const savedBaselineValues = buildFlattenedDraftValues(projectFacts);
		const submittedDraftValues = {
			...savedBaselineValues,
			design_preset_id: "notion",
			theme_preset: buildDesignPresetFactSeed("notion").theme_preset,
			design_references: "https://getdesign.md/notion/design-md",
		};
		const savePayload = clearStaleDerivedDesignFields({
			projectFacts,
			savedBaselineValues,
			submittedDraftValues,
			savePayload: buildSavePayloadForBlueprint(submittedDraftValues),
		});

		expect(savePayload.clearedFieldKeys).toEqual(
			expect.arrayContaining([...designPresetDerivedFactKeys]),
		);
	});

	it("builds validation statuses, field errors, and incomplete feedback", () => {
		const sectionStatuses = buildSectionStatuses(
			createProjectFacts({
				product_summary: undefined,
			}),
		);
		const missingFactKeys = sectionStatuses.flatMap(
			(status) => status.missingFactKeys,
		);

		expect(missingFactKeys).toEqual(
			expect.arrayContaining(["product_summary"]),
		);
		expect(buildFieldErrors(sectionStatuses).product_summary).toBe(
			"Add an answer here before Review can unlock.",
		);
		expect(
			buildPageFeedback({
				hasAnyAnswer: true,
				isComplete: false,
				previouslyComplete: false,
				missingFactKeys,
			}),
		).toEqual(
			expect.objectContaining({
				title: "Draft saved.",
			}),
		);
	});
});
