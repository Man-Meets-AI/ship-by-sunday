/** Lesson 3.12 — persisted field ids */
export const CHECKOUT_QA_PREFLIGHT_FIELD_ID = "checkout_qa_preflight";
export const CHECKOUT_QA_PROMPT_FIELD_ID = "checkout_qa_prompt";
export const CHECKOUT_QA_REPORT_FIELD_ID = "checkout_qa_report";
export const CHECKOUT_QA_CURRENT_STEP_FIELD_ID = "checkout_qa_current_step";
export const CHECKOUT_QA_LAST_ISSUE_FIELD_ID = "checkout_qa_last_issue";
export const CHECKOUT_QA_BROWSER_FIELD_ID = "checkout_qa_browser_running";
export const CHECKOUT_QA_SCENARIO_FIELD_ID = "checkout_qa_scenario";

export const CHECKOUT_QA_SCENARIO_FRESH = "fresh";
export const CHECKOUT_QA_SCENARIO_EXISTING = "existing";

export const CHECKOUT_QA_PREFLIGHT_OPTIONS = [
	"App / API running locally",
	"Marketing website running locally",
	"Stripe test mode and webhooks (or Stripe CLI forward) running",
	"Test account available or auto-create is allowed for this flow",
] as const;

/**
 * Instructor-style QA request: QA skill, Playwright, fresh purchase, standard test card, report issues.
 */
export const CHECKOUT_QA_INSTRUCTOR_PROMPT = `Use the QA Browser skill with Playwright to run an end-to-end test of the fresh-account purchase path on my local stack.

Goals:
- Start from the marketing site, buy the product, and complete checkout as a brand-new customer.
- Create a new account when the flow requires it (do not reuse an existing session unless the scenario says otherwise).
- Use Stripe's standard test card: 4242 4242 4242 4242, any future expiry, any CVC, any postal code.
- If you get stuck at Clerk sign-up or verification, stop and describe the blocker; I may change Clerk settings while you wait.

Report back with: pass/fail, the exact step where you stopped (if failed), and a short list of concrete bugs or UX issues (copy, contrast, wrong price, dead ends, etc.). Do not move on to launch checklist or production deploy—this pass is QA and bug discovery only.`;

export const CHECKOUT_QA_TRANSCRIPT_ISSUES = [
	"Signup detour before checkout",
	"Verification wall blocking the agent",
	"Stale $99 Stripe price shown",
	"Low contrast or unclear copy",
] as const;

export const CHECKOUT_QA_CLERK_SETTING_NOTE =
	"If the agent hits Clerk verification or sign-up friction, open Clerk → User & authentication → Email (and related sign-up settings), adjust what blocks your dev test, then tell the agent you changed settings so it can retry.";

export const CHECKOUT_QA_PARALLEL_AGENTS_NOTE =
	"You can run browser automation in parallel with other work, but this lesson is about one focused checkout QA pass and capturing real issues—not spinning up unrelated tasks.";
