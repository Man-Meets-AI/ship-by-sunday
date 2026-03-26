import {
	buildStripeCliProjectCheck,
	buildStripeCliRepairCommand,
	parseStripeCliConfigListOutput,
} from "@/scripts/lib/stripe-cli-project.mjs";

const stripeAccount = {
	id: "acct_expected",
	displayName: "Glaucous Swing",
};

describe("stripe CLI project helper", () => {
	it("parses the named Stripe CLI project output", () => {
		const config = parseStripeCliConfigListOutput(`
[ship-by-sunday]
  account_id=acct_expected
  display_name=Glaucous Swing
  device_name=rex
`);

		expect(config).toMatchObject({
			projectName: "ship-by-sunday",
			accountId: "acct_expected",
			displayName: "Glaucous Swing",
		});
	});

	it("reports a missing pinned project with exact repair guidance", () => {
		const check = buildStripeCliProjectCheck({
			projectConfig: null,
			stripeAccount,
		});

		expect(check).toMatchObject({
			status: "missing",
			passed: false,
			detail: "missing",
		});
		expect(check.guidance).toBe(
			`Run \`${buildStripeCliRepairCommand()}\` and sign into Glaucous Swing (acct_expected).`,
		);
	});

	it("reports a mismatched pinned project with the expected account id", () => {
		const check = buildStripeCliProjectCheck({
			projectConfig: {
				projectName: "ship-by-sunday",
				accountId: "acct_wrong",
				displayName: "Story Blast",
			},
			stripeAccount,
		});

		expect(check).toMatchObject({
			status: "mismatch",
			passed: false,
			detail:
				"Story Blast (acct_wrong); expected Glaucous Swing (acct_expected)",
		});
		expect(check.guidance).toContain("select Glaucous Swing (acct_expected)");
	});
});
