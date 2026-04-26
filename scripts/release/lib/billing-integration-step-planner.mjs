const PRODUCTION_BILLING_PROOF_HOSTS = new Set(["www.man-meets-ai.com"]);

export function isProductionBillingTarget(urlString) {
	try {
		return PRODUCTION_BILLING_PROOF_HOSTS.has(new URL(urlString).hostname);
	} catch {
		return false;
	}
}

export function buildBillingIntegrationSteps({
	authenticatedBrowserEnv,
	isLocalBillingTarget,
	personaPrepareEnv,
	targetUrl,
}) {
	return [
		...(isLocalBillingTarget
			? [
					{
						label: "Run the local Stripe guardrail doctor",
						command: ["bun", "run", "stripe:dev:doctor"],
						warningOnFailure:
							"Local Stripe guardrail drift detected. Review the pinned `ship-by-sunday` Stripe profile and doctor output before treating billing failures as app bugs.",
					},
				]
			: []),
		{
			label: "Prepare billing-integration release personas",
			command: [
				"bun",
				"run",
				"release:personas:prepare",
				"--",
				"--proof=billing_integration",
			],
			env: personaPrepareEnv,
		},
		...(isLocalBillingTarget
			? [
					{
						label: "Run the billing-integration sandbox browser pack",
						command: [
							"bun",
							"run",
							"--cwd",
							"apps/web",
							"test:e2e:sandbox:billing-integration",
						],
						env: authenticatedBrowserEnv,
						requireBrowserEvidence: true,
					},
				]
			: isProductionBillingTarget(targetUrl)
			? [
					{
						label: "Run the hosted production billing proof",
						command: [
							"bun",
							"run",
							"--cwd",
							"apps/web",
							"stripe:hosted:verify",
						],
						env: {
							...authenticatedBrowserEnv,
							PLAYWRIGHT_BASE_URL: targetUrl,
						},
						requireBrowserEvidence: true,
					},
				]
			: [
					{
						label: "Run the hosted dev billing proof",
						command: [
							"bun",
							"run",
							"--cwd",
							"apps/web",
							"stripe:hosted:verify:dev",
							"--",
							`--base-url=${targetUrl}`,
						],
						env: authenticatedBrowserEnv,
						requireBrowserEvidence: true,
					},
				]),
		...(isLocalBillingTarget
			? [
					{
						label: "Verify the local Stripe-to-Convex handoff",
						command: ["bun", "run", "stripe:dev:verify"],
					},
				]
			: []),
	];
}
