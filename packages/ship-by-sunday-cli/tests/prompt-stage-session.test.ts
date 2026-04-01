import { createCanonicalProjectDefinitionDraft } from "@manmeetsai/packet-compiler";
import { createStagePromptSession } from "../src/prompts/stage-prompt-session";

describe("stage prompt session", () => {
	it("describes stage progress and control commands", () => {
		const session = createStagePromptSession({ stageId: "product" });
		const firstStep = session.stage.steps[0];
		const firstFieldKey = firstStep.fieldKeys[0]!;
		const draft = createCanonicalProjectDefinitionDraft({
			clerkUserId: "local-cli-user",
			productKey: "ship-by-sunday",
			facts: {
				product_name: "Ship by Sunday OS",
			},
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
		const session = createStagePromptSession({ stageId: "product" });
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
		const session = createStagePromptSession({ stageId: "product" });

		expect(session.formatExitMessage("quit")).toContain(
			"Resume with bun run sbs resume.",
		);
		expect(session.formatExitMessage("cancelled")).toContain("Interrupted.");
	});
});
