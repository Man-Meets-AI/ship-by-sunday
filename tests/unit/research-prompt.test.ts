import {
	buildBuildKickoffPrompt,
	buildCompetitorResearchPrompt,
	buildScopeBoundaryPrompt,
	buildPromptImportFieldValues,
	buildVisualDirectionGuidePrompt,
	getPromptTemplateState,
	parseCompetitorResearchImport,
	parseScopeBoundaryImport,
	parseVisualDirectionGuideImport,
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
		expect(prompt).toContain("What this means for my v1");
		expect(prompt).toContain("Evidence standard:");
		expect(prompt).toContain("Selection guidance:");
		expect(prompt).toContain("Writing guidance:");
		expect(prompt).toContain("- Do not use markdown table syntax.");
		expect(prompt).toContain("- Do not add a header row.");
		expect(prompt).toContain(
			"- Do not include citations, source lists, or a references appendix in the returned output.",
		);
		expect(prompt).toContain(
			"solution name | what it does well | where it falls short | what users care about most | what evidence you saw",
		);
		expect(prompt).toContain(
			'In "what evidence you saw", name the concrete surface briefly, such as product page, pricing page, onboarding flow, help doc, review thread, or app store listing.',
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
Notion | Fast setup | Weak export | Speed | Pricing page
Tana | Flexible workflows | Steeper learning curve | Adaptability | App store listing

What this means for my v1
Users care about speed first, but they keep running into limits when the workflow gets more real.`);

		expect(parsed).toEqual({
			rows: [
				["Notion", "Fast setup", "Weak export", "Speed", "Pricing page"],
				[
					"Tana",
					"Flexible workflows",
					"Steeper learning curve",
					"Adaptability",
					"App store listing",
				],
			],
			summary:
				"Users care about speed first, but they keep running into limits when the workflow gets more real.",
		});
	});

	it("cleans citations, markdown-table noise, and footnotes from a Deep Research style paste", () => {
		const parsed = parseCompetitorResearchImport(`## Research Table
| solution name | what it does well | where it falls short | what users care about most | what evidence you saw |
| --- | --- | --- | --- | --- |
buildspace / Nights and Weekends | Strongest evidence for a structured "make and ship" process instead of just coding; participants describe concrete challenges around creating, getting feedback, and marketing, plus motivating community mechanics like leaderboards. ([camhouser.com][1]) | It is no longer active, and even positive reviews note it did not teach subject-matter specifics; users still had to be resourceful on tools and execution details. ([buildspace.so][2]) | A real process, accountability, and momentum around shipping rather than endless learning. ([camhouser.com][1]) | public review + product site
2. Lovable | Very good at turning prompts into a working UI and MVP fast; Lovable positions itself as a fast AI app builder, and users report getting functional frontends in hours or days instead of weeks. ([Lovable][3]) | Repeated public discussion says the hard part starts after the first build: backend logic, auth, data boundaries, deployment, scaling, and maintainability are where users get stuck or move to other tools. ([Reddit][4]) | Speed to first version, one-click-ish progress, and whether the app can survive the jump from demo to real production use. ([Reddit][5]) | product site + Reddit threads

### What this means for my v1
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
				"public review + product site",
			],
			[
				"Lovable",
				"Very good at turning prompts into a working UI and MVP fast; Lovable positions itself as a fast AI app builder, and users report getting functional frontends in hours or days instead of weeks.",
				"Repeated public discussion says the hard part starts after the first build: backend logic, auth, data boundaries, deployment, scaling, and maintainability are where users get stuck or move to other tools.",
				"Speed to first version, one-click-ish progress, and whether the app can survive the jump from demo to real production use.",
				"product site + Reddit threads",
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
Notion | Fast setup | Weak export | Speed | Pricing page

What this means for my v1
Users want speed first.`,
		);

		expect(updates).toEqual({
			research_table: [
				["Notion", "Fast setup", "Weak export", "Speed", "Pricing page"],
			],
			research_summary: "Users want speed first.",
		});
	});

	it("throws a clear error when either required section is missing", () => {
		expect(() =>
			parseCompetitorResearchImport(`Research Table
Notion | Fast setup | Weak export | Speed`),
		).toThrow(
			"Paste the full ChatGPT response that includes both Research Table and What this means for my v1.",
		);
	});

	it("accepts older four-cell research rows and leaves the new evidence cell blank", () => {
		const parsed = parseCompetitorResearchImport(`Research Table
Notion | Fast setup | Weak export | Speed

Key pattern I noticed
Users want speed first.`);

		expect(parsed.rows).toEqual([["Notion", "Fast setup", "Weak export", "Speed"]]);
		expect(parsed.summary).toBe("Users want speed first.");
	});

	it("throws a clear error when rows are not pipe-delimited into usable cells", () => {
		expect(() =>
			parseCompetitorResearchImport(`Research Table
Notion - Fast setup - Weak export - Speed

What this means for my v1
Users want speed first.`),
		).toThrow(
			"Paste the full response with a Research Table section that contains at least one usable row.",
		);
	});
});

describe("buildScopeBoundaryPrompt", () => {
	it("builds a scope-cut prompt from saved user, outcome, and research context", () => {
		const prompt = buildScopeBoundaryPrompt({
			user: {
				statement: "Startup operators",
				problem:
					"They lose action items after meetings and waste time rebuilding them.",
				painMoment:
					"Right after team meetings when they need to share next steps fast.",
				currentSolution:
					"Messy notes, memory, and a manual cleanup pass after the meeting.",
			},
			outcome: {
				statement:
					"Startup operators leave a meeting with a clean action summary they can review and send in minutes.",
				successLooksLike:
					"They can paste notes, review a usable action summary, and share it without rebuilding everything by hand.",
			},
			research: {
				rows: [
					{
						solutionName: "Notion",
						whatItDoesWell: "Fast capture",
						whereItFallsShort: "Weak workflow handoff",
						whatUsersCareAboutMost: "Speed",
					},
				],
				summary:
					"Users want speed first, but they do not trust generic summaries when the workflow gets more real.",
			},
		});

		expect(prompt).toContain(
			"You are helping a builder cut an MVP to the smallest believable version they can ship in a weekend sprint.",
		);
		expect(prompt).toContain("- User: Startup operators");
		expect(prompt).toContain(
			"- Desired outcome: Startup operators leave a meeting with a clean action summary they can review and send in minutes.",
		);
		expect(prompt).toContain(
			"- Notion: does well -> Fast capture; falls short -> Weak workflow handoff; users care about -> Speed",
		);
		expect(prompt).toContain(
			"- Research pattern: Users want speed first, but they do not trust generic summaries when the workflow gets more real.",
		);
		expect(prompt).toContain("Keep in v1");
		expect(prompt).toContain("Cut from v1");
		expect(prompt).toContain("Why this version is enough");
		expect(prompt).toContain(
			"- Avoid dashboards, analytics, settings, collaboration, team roles, notifications, admin panels, integrations, billing, or platform-level extras unless they are absolutely required for the user to reach the outcome in the core flow.",
		);
		expect(prompt).toContain(
			"- Return only these three sections in this order:",
		);
	});
});

describe("buildVisualDirectionGuidePrompt", () => {
	it("builds a visual-guide prompt from saved references and a direction note", () => {
		const prompt = buildVisualDirectionGuidePrompt({
			directionNotes:
				"Push the references toward a sharper editorial landing page with tighter spacing, darker surfaces, and more trust-heavy hierarchy.",
			referenceImageUrls: [
				"https://images.example.com/ref-1.png",
				"https://images.example.com/ref-2.png",
			],
		});

		expect(prompt).toContain(
			"You are helping a builder turn saved visual references into a practical app visual system they can build from this weekend.",
		);
		expect(prompt).toContain(
			"- Push the references toward a sharper editorial landing page with tighter spacing, darker surfaces, and more trust-heavy hierarchy.",
		);
		expect(prompt).toContain(
			"- Reference 1: https://images.example.com/ref-1.png",
		);
		expect(prompt).toContain(
			"- Reference 2: https://images.example.com/ref-2.png",
		);
		expect(prompt).toContain(
			"Return only the markdown contents of `visualguide.md`.",
		);
		expect(prompt).toContain("## Components and UI Patterns");
		expect(prompt).toContain("## What To Avoid");
	});

	it("requires both saved references and a local direction note for prompt state", () => {
		expect(
			getPromptTemplateState("visual_direction_guide", [
				{
					artifactKey: "reference_board",
					fieldValues: {
						reference_gallery: {
							kind: "reference_gallery",
							items: [
								{
									id: "remote-1",
									source: "remote_url",
									url: "https://images.example.com/ref-1.png",
								},
							],
						},
					},
				},
			]).disabledReason,
		).toContain("Save at least one visual direction note here");

		expect(
			getPromptTemplateState(
				"visual_direction_guide",
				[
					{
						artifactKey: "reference_board",
						fieldValues: {
							reference_gallery: {
								kind: "reference_gallery",
								items: [
									{
										id: "remote-1",
										source: "remote_url",
										url: "https://images.example.com/ref-1.png",
									},
								],
							},
						},
					},
				],
				{
					visual_direction_notes:
						"Keep the hero bold, editorial, and high contrast.",
				},
			).prompt,
		).toContain("https://images.example.com/ref-1.png");
	});
});

describe("buildBuildKickoffPrompt", () => {
	it("builds the kickoff prompt from saved product and design handoff context", () => {
		const prompt = buildBuildKickoffPrompt({
			buildPath: "template",
			templateRepoUrl: "https://github.com/example/starter",
			firstSlice: "Marketing hero and CTA",
			definitionOfDone:
				"The hero renders locally, the CTA is clickable, and Playwright confirms the core path loads.",
			productBrief: [
				["Who", "Startup operators with messy post-meeting action items."],
				[
					"Outcome",
					"Leave the meeting with a clean action summary they can review and send in minutes.",
				],
			].map(([label, body]) => ({ label, body })),
			designSpec: [
				[
					"Rough screens",
					"Hero, summary review, and share state with dark surfaces.",
				],
				[
					"Visual direction",
					"High contrast, tight spacing, and obvious trust hierarchy.",
				],
			].map(([label, body]) => ({ label, body })),
		});

		expect(prompt).toContain(
			"You are helping a builder implement a sharp weekend-v1 from a locked product brief and design spec.",
		);
		expect(prompt).toContain("- Starting path: Use template");
		expect(prompt).toContain(
			"- First slice to build now: Marketing hero and CTA",
		);
		expect(prompt).toContain(
			"Starter repo: https://github.com/example/starter",
		);
		expect(prompt).toContain("## Source-of-truth product brief");
		expect(prompt).toContain("### Who");
		expect(prompt).toContain("## Source-of-truth design spec");
		expect(prompt).toContain("## Validation");
		expect(prompt).toContain("## Stop condition");
	});

	it("requires a configured template URL before returning the template path prompt", () => {
		const originalRepoUrl =
			process.env.NEXT_PUBLIC_SHIP_BY_SUNDAY_TEMPLATE_REPO_URL;
		delete process.env.NEXT_PUBLIC_SHIP_BY_SUNDAY_TEMPLATE_REPO_URL;

		try {
			const state = getPromptTemplateState(
				"build_kickoff_prompt",
				[
					{
						artifactKey: "product_brief",
						fieldValues: {},
						fields: [["Who", "Startup operators"]],
					},
					{
						artifactKey: "design_spec",
						fieldValues: {},
						fields: [["Rough screens", "Hero and summary review"]],
					},
				],
				{
					build_path: "Use template",
					first_slice: "Marketing hero and CTA",
					definition_of_done:
						"The hero renders locally, the CTA is clickable, and Playwright confirms the core path loads.",
				},
			);

			expect(state.prompt).toBeNull();
			expect(state.disabledReason).toContain(
				"NEXT_PUBLIC_SHIP_BY_SUNDAY_TEMPLATE_REPO_URL",
			);
		} finally {
			process.env.NEXT_PUBLIC_SHIP_BY_SUNDAY_TEMPLATE_REPO_URL =
				originalRepoUrl;
		}
	});

	it("returns the custom-path prompt without needing a template URL", () => {
		const state = getPromptTemplateState(
			"build_kickoff_prompt",
			[
				{
					artifactKey: "product_brief",
					fieldValues: {},
					fields: [["Who", "Startup operators"]],
				},
				{
					artifactKey: "design_spec",
					fieldValues: {},
					fields: [["Rough screens", "Hero and summary review"]],
				},
			],
			{
				build_path: "Custom path",
				first_slice: "Marketing hero and CTA",
				definition_of_done:
					"The hero renders locally, the CTA is clickable, and Playwright confirms the core path loads.",
			},
		);

		expect(state.disabledReason).toBeNull();
		expect(state.prompt).toContain("- Starting path: Custom path");
		expect(state.prompt).not.toContain("Starter repo:");
	});
});

describe("parseScopeBoundaryImport", () => {
	it("parses a clean three-section response into keep, cut, and rationale fields", () => {
		const parsed = parseScopeBoundaryImport(`Keep in v1
- Paste meeting notes
- Generate a clean action summary

Cut from v1
- Slack integration
- Team analytics dashboard

Why this version is enough
The user can get from messy notes to a usable action summary in one pass, which creates a real before-and-after win this weekend.`);

		expect(parsed).toEqual({
			inScope: ["Paste meeting notes", "Generate a clean action summary"],
			outOfScope: ["Slack integration", "Team analytics dashboard"],
			rationale:
				"The user can get from messy notes to a usable action summary in one pass, which creates a real before-and-after win this weekend.",
		});
	});

	it("accepts alternate scope headings and numbered lists", () => {
		const parsed = parseScopeBoundaryImport(`## In Scope Features
1. Paste meeting notes
2. Review and send the action summary

## Out of Scope Features
1. Calendar sync
2. Multi-user workspaces

## Why this is enough for v1
This version proves the user can close the loop immediately after the meeting.`);

		expect(parsed.inScope).toEqual([
			"Paste meeting notes",
			"Review and send the action summary",
		]);
		expect(parsed.outOfScope).toEqual([
			"Calendar sync",
			"Multi-user workspaces",
		]);
		expect(parsed.rationale).toBe(
			"This version proves the user can close the loop immediately after the meeting.",
		);
	});

	it("returns field updates for the scope lesson import mapping", () => {
		const updates = buildPromptImportFieldValues(
			{
				promptTemplateId: "scope_boundary",
				inScopeFieldId: "in_scope",
				outOfScopeFieldId: "out_of_scope",
				rationaleFieldId: "v1_rationale",
			},
			`Keep in v1
- Paste meeting notes

Cut from v1
- Slack integration

Why this version is enough
It gives the user one clean win this weekend.`,
		);

		expect(updates).toEqual({
			in_scope: ["Paste meeting notes"],
			out_of_scope: ["Slack integration"],
			v1_rationale: "It gives the user one clean win this weekend.",
		});
	});

	it("throws a clear error when a required scope section is missing", () => {
		expect(() =>
			parseScopeBoundaryImport(`Keep in v1
- Paste meeting notes

Cut from v1
- Slack integration`),
		).toThrow(
			"Paste the full ChatGPT response that includes Keep in v1, Cut from v1, and Why this version is enough.",
		);
	});
});

describe("parseVisualDirectionGuideImport", () => {
	it("accepts raw markdown for visualguide.md", () => {
		const parsed = parseVisualDirectionGuideImport(`# Visual Guide
## Overall Direction
Keep the UI sharp and dense.`);

		expect(parsed).toBe(`# Visual Guide
## Overall Direction
Keep the UI sharp and dense.`);
	});

	it("strips one fenced markdown wrapper before saving", () => {
		const parsed = parseVisualDirectionGuideImport(`\`\`\`markdown
# Visual Guide
## Overall Direction
Keep the UI sharp and dense.
\`\`\``);

		expect(parsed).toBe(`# Visual Guide
## Overall Direction
Keep the UI sharp and dense.`);
	});

	it("returns field updates for the visual-direction lesson import mapping", () => {
		const updates = buildPromptImportFieldValues(
			{
				promptTemplateId: "visual_direction_guide",
				markdownFieldId: "visual_guide_markdown",
			},
			`# Visual Guide
## Overall Direction
Keep the UI sharp and dense.`,
		);

		expect(updates).toEqual({
			visual_guide_markdown: `# Visual Guide
## Overall Direction
Keep the UI sharp and dense.`,
		});
	});

	it("rejects fenced markdown with extra commentary around it", () => {
		expect(() =>
			parseVisualDirectionGuideImport(`Here is your file:

\`\`\`markdown
# Visual Guide
## Overall Direction
Keep the UI sharp and dense.
\`\`\``),
		).toThrow(
			"Paste only the raw `visualguide.md` markdown or one fenced markdown block with no extra commentary.",
		);
	});
});
