import {
	DEFAULT_HOSTED_BILLING_PROOF_OFFER_ID,
	parseHostedBillingProofOfferId,
} from "../../../apps/web/scripts/lib/hosted-stripe-checkout-proof.mjs";

const PRODUCTION_BILLING_PROOF_HOSTS = new Set(["www.man-meets-ai.com"]);

function buildHostedBillingProofCommand({
	baseUrl,
	offerId,
	scriptName,
}) {
	const command = ["bun", "run", "--cwd", "apps/web", scriptName, "--"];

	if (baseUrl) {
		command.push(`--base-url=${baseUrl}`);
	}

	command.push(`--offer=${offerId}`);

	return command;
}

export function isProductionBillingTarget(urlString) {
	try {
		return PRODUCTION_BILLING_PROOF_HOSTS.has(new URL(urlString).hostname);
	} catch {
		return false;
	}
}

export function buildBillingIntegrationSteps({
	authenticatedBrowserEnv,
	billingProofOfferId = DEFAULT_HOSTED_BILLING_PROOF_OFFER_ID,
	isLocalBillingTarget,
	personaPrepareEnv,
	targetUrl,
}) {
	const offerId = parseHostedBillingProofOfferId(billingProofOfferId);
	const isProductionTarget = isProductionBillingTarget(targetUrl);
	const isHostedDevTarget = !isLocalBillingTarget && !isProductionTarget;

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
		...(isHostedDevTarget
			? []
			: [
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
				]),
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
			: isProductionTarget
			? [
					{
						label: "Run the hosted production billing proof",
						command: buildHostedBillingProofCommand({
							offerId,
							scriptName: "stripe:hosted:verify",
						}),
						env: {
							...authenticatedBrowserEnv,
							PLAYWRIGHT_BASE_URL: targetUrl,
						},
						requireBrowserEvidence: true,
					},
				]
			: [
					{
						label: "Run the hosted dev card payment proof",
						command: buildHostedBillingProofCommand({
							baseUrl: targetUrl,
							offerId,
							scriptName: "stripe:hosted:verify:dev-card",
						}),
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
