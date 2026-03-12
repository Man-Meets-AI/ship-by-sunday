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

		expect(prompt).toContain(
			"You are doing a fast competitor / adjacent-solution research pass for a product-building workflow.",
		);
		expect(prompt).toContain("- User: Startup operators");
		expect(prompt).toContain(
			"- Problem to solve: They lose action items after meetings and waste time rebuilding them.",
		);
		expect(prompt).toContain(
			"- Desired outcome: Startup operators leave a meeting with a clean action summary they can review and send in minutes.",
		);
		expect(prompt).toContain(
			"- Reachability: I already know a few operators who would try this this week.",
		);
		expect(prompt).toContain(
			"- Difference for user: They stop losing decisions in messy notes and can close the loop while the meeting is still fresh.",
		);
		expect(prompt).toContain("Research Table");
		expect(prompt).toContain("Key pattern I noticed");
		expect(prompt).toContain("Evidence standard:");
		expect(prompt).toContain("Selection guidance:");
		expect(prompt).toContain("Writing guidance:");
		expect(prompt).toContain("- Do not use markdown table syntax.");
		expect(prompt).toContain("- Do not add a header row.");
		expect(prompt).toContain(
			"solution name | what it does well | where it falls short | what users care about most",
		);
	});

	it("omits empty optional context lines while keeping the output rules intact", () => {
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
		expect(prompt).not.toContain("Reachability:");
		expect(prompt).not.toContain("Success looks like:");
		expect(prompt).not.toContain("Difference for user:");
		expect(prompt).toContain(
			"- Keep the Research Table section as raw | delimited lines only.",
		);
		expect(prompt).toContain("- Do not add intro text");
	});
});
