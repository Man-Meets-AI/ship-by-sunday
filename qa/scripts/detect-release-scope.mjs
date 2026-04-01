import { appendFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import process from "node:process";

const exactBillingSensitivePaths = new Set([
	".github/workflows/dev-staging-proof.yml",
	".github/workflows/production-release-proof.yml",
	"apps/web/convex/access.ts",
	"apps/web/convex/checkoutClaims.ts",
	"apps/web/convex/checkoutClaimsActions.ts",
	"apps/web/convex/stripeWebhook.ts",
	"apps/web/platform/billing/stripe.ts",
	"apps/web/scripts/create-stripe-product.mjs",
	"apps/web/scripts/ensure-clerk-entitled-test-user.mjs",
	"apps/web/scripts/local-stripe-doctor.mjs",
	"apps/web/scripts/local-stripe-webhook.mjs",
	"apps/web/scripts/verify-local-stripe-checkout.mjs",
	"apps/web/scripts/lib/convex-product-access-grant.mjs",
	"apps/web/scripts/lib/stripe-cli-project.mjs",
	"apps/web/tests/e2e/buyer-handoff.sandbox.spec.ts",
	"apps/web/tests/integration/stripe-checkout-route.test.ts",
	"apps/web/tests/unit/checkout-claims-actions.test.ts",
	"apps/web/tests/unit/checkout-claims.test.ts",
	"apps/web/tests/unit/checkout-session.test.ts",
	"apps/web/tests/unit/convex-product-access-grant.test.ts",
	"apps/web/tests/unit/course-access.test.ts",
	"apps/web/tests/unit/course-entitlements.test.ts",
	"apps/web/tests/unit/stripe-cli-project.test.ts",
	"apps/web/tests/unit/stripe-observability.test.ts",
	"apps/web/tests/unit/stripe-webhook-action.test.ts",
	"qa/scripts/detect-release-scope.mjs",
	"qa/scripts/run-pack.mjs",
]);

const billingSensitivePrefixes = [
	"apps/web/app/access-required/",
	"apps/web/app/api/stripe/",
	"apps/web/app/checkout/",
	"apps/web/convex/access/",
	"apps/web/features/checkout/",
	"apps/web/features/product-access/",
	"apps/web/features/auth/sign-up/",
	"apps/web/tests/integration-ui/checkout",
	"apps/web/tests/integration-ui/post-checkout",
	"apps/web/tests/integration-ui/access-required",
];

function parseArgs(argv) {
	const options = {};

	for (const argument of argv) {
		if (!argument.startsWith("--")) {
			continue;
		}

		const [key, value = ""] = argument.slice(2).split("=");
		options[key] = value;
	}

	return options;
}

function getChangedFiles(baseRef, headRef) {
	const result = spawnSync("git", ["diff", "--name-only", `${baseRef}..${headRef}`], {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	});

	if (result.status !== 0) {
		throw new Error(
			result.stderr.trim() ||
				`git diff failed for ${baseRef}..${headRef} with status ${result.status ?? 1}.`,
		);
	}

	return result.stdout
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
}

function isBillingSensitivePath(filePath) {
	if (exactBillingSensitivePaths.has(filePath)) {
		return true;
	}

	return billingSensitivePrefixes.some((prefix) => filePath.startsWith(prefix));
}

async function writeGitHubOutput(summary) {
	const githubOutputPath = process.env.GITHUB_OUTPUT;
	if (!githubOutputPath) {
		return;
	}

	await appendFile(
		githubOutputPath,
		[
			`billing_sensitive=${summary.billingSensitive ? "true" : "false"}`,
			`changed_files_count=${summary.changedFiles.length}`,
		].join("\n") + "\n",
		"utf8",
	);
}

async function writeJsonOutput(summary, outputPath) {
	if (!outputPath) {
		return;
	}

	await writeFile(outputPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

async function main() {
	const options = parseArgs(process.argv.slice(2));
	const baseRef = options.base?.trim();
	const headRef = options.head?.trim();

	if (!baseRef || !headRef) {
		throw new Error("detect-release-scope requires both --base=<ref> and --head=<ref>.");
	}

	const changedFiles = getChangedFiles(baseRef, headRef);
	const billingSensitiveFiles = changedFiles.filter(isBillingSensitivePath);
	const summary = {
		baseRef,
		headRef,
		changedFiles,
		billingSensitive: billingSensitiveFiles.length > 0,
		billingSensitiveFiles,
	};

	await writeGitHubOutput(summary);
	await writeJsonOutput(summary, options.output?.trim());
	process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

await main();
