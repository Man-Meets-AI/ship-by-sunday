import {
	canonicalProjectDefinitionSchema,
	createCompleteProjectDefinition,
	parseCanonicalProjectDefinition,
} from "../src/index";

describe("canonical project definition schema", () => {
	it("accepts the complete fixture", () => {
		const projectDefinition = createCompleteProjectDefinition();

		expect(projectDefinition.schemaVersion).toBe(1);
		expect(projectDefinition.facts.product_name).toBe("Ship by Sunday OS");
	});

	it("defaults surface_type to web_app", () => {
		const projectDefinition = createCompleteProjectDefinition();
		const { surface_type, ...factsWithoutSurfaceType } =
			projectDefinition.facts;

		const parsedProjectDefinition = parseCanonicalProjectDefinition({
			...projectDefinition,
			facts: factsWithoutSurfaceType,
		});

		expect(surface_type).toBe("web_app");
		expect(parsedProjectDefinition.facts.surface_type).toBe("web_app");
	});

	it("allows placeholder-friendly domain and support_email omissions", () => {
		const projectDefinition = createCompleteProjectDefinition();
		const { domain, support_email, ...factsWithoutPlaceholders } =
			projectDefinition.facts;

		const parsedProjectDefinition = parseCanonicalProjectDefinition({
			...projectDefinition,
			facts: factsWithoutPlaceholders,
			placeholdersInUse: ["domain", "support_email"],
		});

		expect(domain).toBe("example.com");
		expect(support_email).toBe("support@example.com");
		expect(parsedProjectDefinition.placeholdersInUse).toEqual([
			"domain",
			"support_email",
		]);
		expect(parsedProjectDefinition.facts.domain).toBeUndefined();
		expect(parsedProjectDefinition.facts.support_email).toBeUndefined();
	});

	it("rejects empty design references", () => {
		expect(() =>
			parseCanonicalProjectDefinition(
				createCompleteProjectDefinition({
					facts: {
						design_references: [],
					},
				}),
			),
		).toThrow();
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
