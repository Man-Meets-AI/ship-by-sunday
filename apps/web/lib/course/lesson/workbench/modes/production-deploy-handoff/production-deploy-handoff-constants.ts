/** Persisted field ids for lesson 3.14 (must match `build.ts` workbenchFields). */
export const DEPLOY_STEPS_FIELD_ID = "deploy_handoff_steps";
export const DEPLOY_SUCCESS_FIELD_ID = "deploy_handoff_success_checks";
export const DEPLOY_PRODUCT_NAME_FIELD_ID = "deploy_handoff_product_name";
export const DEPLOY_DOMAIN_FIELD_ID = "deploy_handoff_domain";

export const DEPLOY_SERVICES = [
	"Cloudflare",
	"Stripe",
	"Clerk",
	"Vercel",
	"Convex",
] as const;

export const DEPLOY_STEP_OPTIONS = [
	"Open README",
	"Create Cloudflare token",
	"Copy Stripe production secret key",
	"Copy Clerk keys",
	"Confirm Stripe product + price are in production",
	"Deploy",
] as const;

export const DEPLOY_SUCCESS_OPTIONS = [
	"Site is live",
	"Domain connected",
	"Backend live",
	"Stripe prod/test sync confirmed",
] as const;

/**
 * Instructor-facing README deploy prompt. Replace with exact Codebase README wording when finalized.
 */
export const README_DEPLOY_PROMPT = `Open the project README and follow the production deployment section step by step.

Ask Codex (or your agent) to read the README deployment instructions and execute them using the credentials I provide separately. Do not print, log, or echo secret keys or API tokens.

Before marking deploy complete, confirm Stripe product and price IDs in the live Stripe account match what we used in development/sandbox.`;
