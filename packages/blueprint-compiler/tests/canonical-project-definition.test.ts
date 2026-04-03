import {
	canonicalProjectDefinitionSchema,
	createCanonicalProjectDefinition,
	createCompleteProjectDefinition,
	parseCanonicalProjectDefinition,
} from "../src/index";

describe("canonical project definition schema", () => {
	it("accepts the complete fixture and derives the reduced aliases", () => {
		const projectDefinition = createCompleteProjectDefinition();

		expect(projectDefinition.schemaVersion).toBe(1);
		expect(projectDefinition.facts.product_name).toBe("Ship by Sunday OS");
		expect(projectDefinition.facts.core_flow).toEqual([
			"Capture product facts",
			"Unlock blueprints",
			"Download repo",
		]);
		expect(projectDefinition.facts.pricing).toBe(29);
		expect(projectDefinition.facts.theme_hex).toBe("#0f766e");
		expect(projectDefinition.facts.contact_email).toBe("support@example.com");
	});

	it("derives legacy render fields from a reduced intake", () => {
		const projectDefinition = createCanonicalProjectDefinition({
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
			},
			placeholdersInUse: [],
			createdAt: 1,
			updatedAt: 1,
		});

		expect(projectDefinition.facts.screen_sequence).toEqual([
			"Capture product facts",
			"Unlock blueprints",
			"Download repo",
		]);
		expect(projectDefinition.facts.price_usd_cents).toBe(2900);
		expect(projectDefinition.facts.price_display).toBe("$29");
		expect(projectDefinition.facts.currency).toBe("USD");
		expect(projectDefinition.facts.problem_urgency).toBe("Needs action now");
		expect(projectDefinition.facts.outcome_statement).toBe(
			"A founder downloads a working blueprint and repo zip.",
		);
		expect(projectDefinition.facts.scope_in).toEqual([
			"Capture product facts",
			"Unlock blueprints",
			"Download repo",
		]);
	});

	it("allows placeholder-friendly domain and contact_email omissions", () => {
		const projectDefinition = createCompleteProjectDefinition();
		const {
			domain,
			contact_email,
			support_email,
			...factsWithoutPlaceholders
		} = projectDefinition.facts;

		const parsedProjectDefinition = parseCanonicalProjectDefinition({
			...projectDefinition,
			facts: factsWithoutPlaceholders,
			placeholdersInUse: ["domain", "contact_email", "support_email"],
		});

		expect(domain).toBe("example.com");
		expect(contact_email).toBe("support@example.com");
		expect(support_email).toBe("support@example.com");
		expect(parsedProjectDefinition.placeholdersInUse).toEqual([
			"domain",
			"contact_email",
			"support_email",
		]);
		expect(parsedProjectDefinition.facts.domain).toBeUndefined();
		expect(parsedProjectDefinition.facts.contact_email).toBeUndefined();
		expect(parsedProjectDefinition.facts.support_email).toBeUndefined();
	});

	it("defaults blank design references to a compiler-owned reference", () => {
		const parsedProjectDefinition = parseCanonicalProjectDefinition(
			createCompleteProjectDefinition({
				facts: {
					design_references: [],
				},
			}),
		);

		expect(parsedProjectDefinition.facts.design_references).toEqual([
			"https://ui.shadcn.com/",
		]);
	});

	it("rejects legacy planning-only intake keys in canonical facts", () => {
		const projectDefinition = createCompleteProjectDefinition();

		expect(() =>
			canonicalProjectDefinitionSchema.parse({
				...projectDefinition,
				facts: {
					...projectDefinition.facts,
					starter_repo_github_username: "octocat",
					verification_plan: ["Run a smoke test"],
					validation_commands: ["bun run test"],
					rollback_plan: "Revert the feature flag",
				},
			}),
		).toThrow();
	});
});
