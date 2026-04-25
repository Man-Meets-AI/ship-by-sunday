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
	"apps/web/scripts/verify-hosted-stripe-checkout.mjs",
	"apps/web/scripts/verify-local-stripe-checkout.mjs",
	"apps/web/scripts/lib/convex-product-access-grant.mjs",
	"apps/web/scripts/lib/hosted-stripe-checkout-proof.mjs",
	"apps/web/scripts/lib/stripe-cli-project.mjs",
	"apps/web/tests/e2e/buyer-handoff.sandbox.spec.ts",
	"apps/web/tests/integration/stripe-checkout-route.test.ts",
	"apps/web/tests/unit/checkout-claims-actions.test.ts",
	"apps/web/tests/unit/checkout-claims.test.ts",
	"apps/web/tests/unit/checkout-session.test.ts",
	"apps/web/tests/unit/convex-product-access-grant.test.ts",
	"apps/web/tests/unit/course-access.test.ts",
	"apps/web/tests/unit/course-entitlements.test.ts",
	"apps/web/tests/unit/hosted-stripe-checkout-proof.test.ts",
	"apps/web/tests/unit/stripe-cli-project.test.ts",
	"apps/web/tests/unit/stripe-line-item.test.ts",
	"apps/web/tests/unit/stripe-observability.test.ts",
	"apps/web/tests/unit/stripe-webhook-action.test.ts",
	"scripts/release/run-release-proof.mjs",
	"scripts/release/prepare-release-personas.mjs",
	"scripts/release/detect-release-scope.mjs",
	"scripts/release/lib/billing-integration-step-planner.mjs",
	"scripts/release/lib/release-personas.mjs",
	"scripts/release/lib/release-scope.mjs",
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

const convexSensitiveExactPaths = new Set([
	"apps/web/convex/schema.ts",
	"scripts/release/detect-release-scope.mjs",
	"scripts/release/lib/release-scope.mjs",
]);

const convexSensitivePrefixes = ["apps/web/convex/"];

export function isBillingSensitivePath(filePath) {
	if (exactBillingSensitivePaths.has(filePath)) {
		return true;
	}

	return billingSensitivePrefixes.some((prefix) => filePath.startsWith(prefix));
}

export function isConvexSensitivePath(filePath) {
	if (convexSensitiveExactPaths.has(filePath)) {
		return true;
	}

	return convexSensitivePrefixes.some((prefix) => filePath.startsWith(prefix));
}

export function classifyReleaseScope(changedFiles) {
	const billingSensitiveFiles = changedFiles.filter(isBillingSensitivePath);
	const convexSensitiveFiles = changedFiles.filter(isConvexSensitivePath);

	return {
		changedFiles,
		billingSensitive: billingSensitiveFiles.length > 0,
		billingSensitiveFiles,
		convexSensitive: convexSensitiveFiles.length > 0,
		convexSensitiveFiles,
	};
}
