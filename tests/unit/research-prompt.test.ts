import {
	buildCompetitorResearchPrompt,
	buildPromptImportFieldValues,
	parseCompetitorResearchImport,
} from "@/lib/course/research-prompt";

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
			"- Do not include citations, source lists, or a references appendix in the returned output.",
		);
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
		expect(prompt).toContain("- Do not add any extra sections");
	});
});

describe("parseCompetitorResearchImport", () => {
	it("parses a clean two-section response into rows and summary", () => {
		const parsed = parseCompetitorResearchImport(`Research Table
Notion | Fast setup | Weak export | Speed
Tana | Flexible workflows | Steeper learning curve | Adaptability

Key pattern I noticed
Users care about speed first, but they keep running into limits when the workflow gets more real.`);

		expect(parsed).toEqual({
			rows: [
				["Notion", "Fast setup", "Weak export", "Speed"],
				[
					"Tana",
					"Flexible workflows",
					"Steeper learning curve",
					"Adaptability",
				],
			],
			summary:
				"Users care about speed first, but they keep running into limits when the workflow gets more real.",
		});
	});

	it("cleans citations, markdown-table noise, and footnotes from a Deep Research style paste", () => {
		const parsed = parseCompetitorResearchImport(`## Research Table
| solution name | what it does well | where it falls short | what users care about most |
| --- | --- | --- | --- |
buildspace / Nights and Weekends | Strongest evidence for a structured "make and ship" process instead of just coding; participants describe concrete challenges around creating, getting feedback, and marketing, plus motivating community mechanics like leaderboards. ([camhouser.com][1]) | It is no longer active, and even positive reviews note it did not teach subject-matter specifics; users still had to be resourceful on tools and execution details. ([buildspace.so][2]) | A real process, accountability, and momentum around shipping rather than endless learning. ([camhouser.com][1])
2. Lovable | Very good at turning prompts into a working UI and MVP fast; Lovable positions itself as a fast AI app builder, and users report getting functional frontends in hours or days instead of weeks. ([Lovable][3]) | Repeated public discussion says the hard part starts after the first build: backend logic, auth, data boundaries, deployment, scaling, and maintainability are where users get stuck or move to other tools. ([Reddit][4]) | Speed to first version, one-click-ish progress, and whether the app can survive the jump from demo to real production use. ([Reddit][5])

### Key pattern I noticed
Across the options, the gap is not "can I generate an app?" It is "can I reliably go from idea to shipped product with structure?" Fast builders like Lovable win on immediate output, while courses and YouTube win on guidance, but public evidence keeps pointing to the same missing layer: scoping, architecture, auth, deployment, debugging, and production judgment. ([Reddit][5])

[1]: https://www.camhouser.com/a-review-of-buildspaces-nights-and-weekends-program/
[2]: https://buildspace.so/
[3]: https://lovable.dev/
[4]: https://www.reddit.com/r/vibecoding/comments/1qnhzxw/i_am_willing_to_pay_someone_who_can_teach_me_how/
[5]: https://www.reddit.com/r/lovable/comments/1pprwth/i_shipped_a_full_saas_mvp_in_3_days_using/`);

		expect(parsed.rows).toEqual([
			[
				"buildspace / Nights and Weekends",
				'Strongest evidence for a structured "make and ship" process instead of just coding; participants describe concrete challenges around creating, getting feedback, and marketing, plus motivating community mechanics like leaderboards.',
				"It is no longer active, and even positive reviews note it did not teach subject-matter specifics; users still had to be resourceful on tools and execution details.",
				"A real process, accountability, and momentum around shipping rather than endless learning.",
			],
			[
				"Lovable",
				"Very good at turning prompts into a working UI and MVP fast; Lovable positions itself as a fast AI app builder, and users report getting functional frontends in hours or days instead of weeks.",
				"Repeated public discussion says the hard part starts after the first build: backend logic, auth, data boundaries, deployment, scaling, and maintainability are where users get stuck or move to other tools.",
				"Speed to first version, one-click-ish progress, and whether the app can survive the jump from demo to real production use.",
			],
		]);
		expect(parsed.summary).toBe(
			'Across the options, the gap is not "can I generate an app?" It is "can I reliably go from idea to shipped product with structure?" Fast builders like Lovable win on immediate output, while courses and YouTube win on guidance, but public evidence keeps pointing to the same missing layer: scoping, architecture, auth, deployment, debugging, and production judgment.',
		);
	});

	it("returns field updates for the lesson import mapping", () => {
		const updates = buildPromptImportFieldValues(
			{
				promptTemplateId: "competitor_research",
				tableFieldId: "research_table",
				summaryFieldId: "research_summary",
			},
			`Research Table
Notion | Fast setup | Weak export | Speed

Key pattern I noticed
Users want speed first.`,
		);

		expect(updates).toEqual({
			research_table: [["Notion", "Fast setup", "Weak export", "Speed"]],
			research_summary: "Users want speed first.",
		});
	});

	it("throws a clear error when either required section is missing", () => {
		expect(() =>
			parseCompetitorResearchImport(`Research Table
Notion | Fast setup | Weak export | Speed`),
		).toThrow(
			"Paste the full ChatGPT response that includes both Research Table and Key pattern I noticed.",
		);
	});

	it("throws a clear error when rows are not pipe-delimited into four cells", () => {
		expect(() =>
			parseCompetitorResearchImport(`Research Table
Notion - Fast setup - Weak export - Speed

Key pattern I noticed
Users want speed first.`),
		).toThrow(
			"Paste the full response with a Research Table section that contains at least one usable row.",
		);
	});
});
