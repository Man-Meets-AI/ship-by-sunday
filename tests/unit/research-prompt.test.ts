import { buildCompetitorResearchPrompt } from "@/lib/course/research-prompt";

describe("buildCompetitorResearchPrompt", () => {
	it("injects the saved user and outcome context into the prompt contract", () => {
		const prompt = buildCompetitorResearchPrompt({
			user: {
				statement: "Startup operators",
				problem:
					"They lose action items after meetings and waste time rebuilding them.",
				painMoment:
					"Right after team meetings when they need to share next steps fast.",
				currentSolution:
					"Messy notes, memory, and a manual cleanup pass after the meeting.",
				reachability:
					"I already know a few operators who would try this this week.",
			},
			outcome: {
				statement:
					"Startup operators leave a meeting with a clean action summary they can review and send in minutes.",
				successLooksLike:
					"They can paste notes, review a usable action summary, and share it without rebuilding everything by hand.",
				differenceForUser:
					"They stop losing decisions in messy notes and can close the loop while the meeting is still fresh.",
			},
		});

		expect(prompt).toContain("Act as a deep research analyst.");
		expect(prompt).toContain("- User: Startup operators");
		expect(prompt).toContain(
			"- Problem to solve: They lose action items after meetings and waste time rebuilding them.",
		);
		expect(prompt).toContain(
			"- Desired outcome: Startup operators leave a meeting with a clean action summary they can review and send in minutes.",
		);
		expect(prompt).toContain("Research Table");
		expect(prompt).toContain("Key pattern I noticed");
		expect(prompt).toContain("- Do not use markdown table syntax.");
		expect(prompt).toContain("- Do not add a header row.");
		expect(prompt).toContain(
			"- Paste the raw | delimited lines into the Research Table field in Ship by Sunday.",
		);
	});

	it("omits empty optional context lines while keeping the pasteback rules intact", () => {
		const prompt = buildCompetitorResearchPrompt({
			user: {
				statement: "Freelancers",
				problem: "They lose track of client follow-ups after calls.",
			},
			outcome: {
				statement:
					"Freelancers leave calls with clear next steps they can send immediately.",
			},
		});

		expect(prompt).not.toContain("Pain moment:");
		expect(prompt).not.toContain("Current workaround:");
		expect(prompt).not.toContain("Why I can reach them quickly:");
		expect(prompt).not.toContain("Success looks like:");
		expect(prompt).not.toContain("What should feel different for the user:");
		expect(prompt).toContain(
			"- Keep the Research Table section as raw | delimited lines only.",
		);
		expect(prompt).toContain(
			"- Paste the 2-4 sentence summary into the Key pattern I noticed field.",
		);
	});
});
