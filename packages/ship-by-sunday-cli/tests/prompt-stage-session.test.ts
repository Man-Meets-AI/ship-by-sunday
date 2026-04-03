import { createStagePromptSession } from "../src/prompts/stage-prompt-session";
import { DEFAULT_THEME_HEX } from "../src/field-contract";
import { createLocalDraftDefinition } from "../src/draft/draft-store";

describe("stage prompt session", () => {
	it("describes stage progress and control commands", () => {
		const session = createStagePromptSession({ stageId: "blueprint" });
		const firstStep = session.stage.steps[0];
		const firstFieldKey = firstStep.fieldKeys[0]!;
		const draft = createLocalDraftDefinition({
			product_name: "Ship by Sunday OS",
		});

		expect(session.formatIntroLines().join("\n")).toContain("Controls:");
		expect(session.formatStepHeader(0, firstStep.fieldKeys.length)).toContain(
			"Step 1 of",
		);

		const prompt = session.formatFieldPrompt({
			draft,
			fieldKey: firstFieldKey,
			stepIndex: 0,
			fieldIndex: 0,
			fieldCount: firstStep.fieldKeys.length,
		});

		expect(prompt.prompt).toContain("Step 1 of");
		expect(prompt.prompt).toContain("Current value:");
		if (prompt.mode === "single-line") {
			expect(prompt.prompt).toContain("Press Enter to keep the current value.");
		} else {
			expect(prompt.prompt).toContain("Enter one or more lines.");
		}
	});

	it("handles clear, quit, and value answers", () => {
		const session = createStagePromptSession({ stageId: "blueprint" });
		const fieldKey = session.stage.steps[0]!.fieldKeys[0]!;

		expect(
			session.resolveFieldAction({
				answerLines: [""],
				fieldKey,
			}),
		).toEqual({ kind: "keep" });

		expect(
			session.resolveFieldAction({
				answerLines: [":clear"],
				fieldKey,
			}),
		).toEqual({ kind: "clear" });

		expect(
			session.resolveFieldAction({
				answerLines: [":quit"],
				fieldKey,
			}),
		).toEqual({ kind: "quit", reason: "quit" });

		expect(
			session.resolveFieldAction({
				answerLines: ["Ship by Sunday CLI"],
				fieldKey,
			}),
		).toEqual({ kind: "value", value: "Ship by Sunday CLI" });
	});

	it("formats safe exit guidance for quit and interrupt", () => {
		const session = createStagePromptSession({ stageId: "blueprint" });

		expect(session.formatExitMessage("quit")).toContain(
			"Resume with bun run sbs resume.",
		);
		expect(session.formatExitMessage("cancelled")).toContain("Interrupted.");
	});

	it("shows the reduced design default and generated scope suggestions", () => {
		const designSession = createStagePromptSession({ stageId: "blueprint" });
		const themePrompt = designSession.formatFieldPrompt({
			draft: { facts: {} },
			fieldKey: "theme_hex",
			stepIndex: 0,
			fieldIndex: 0,
			fieldCount: 2,
		});
		expect(themePrompt.prompt).toContain(DEFAULT_THEME_HEX);

		const buildPlanSession = createStagePromptSession({
			stageId: "blueprint",
		});
		const scopePrompt = buildPlanSession.formatFieldPrompt({
			draft: {
				facts: {
					core_flow: ["Capture facts", "Review readiness"],
				},
			},
			fieldKey: "scope_in",
			stepIndex: 5,
			fieldIndex: 0,
			fieldCount: 4,
		});
		expect(scopePrompt.prompt).toContain("Build Capture facts");
	});

	it("prompts for pricing in the blueprint stage", () => {
		const session = createStagePromptSession({ stageId: "blueprint" });
		const pricingPrompt = session.formatFieldPrompt({
			draft: { facts: {} },
			fieldKey: "pricing",
			stepIndex: 4,
			fieldIndex: 0,
			fieldCount: 1,
		});

		expect(pricingPrompt.prompt).toContain("Enter the one-time USD amount.");
	});
});
