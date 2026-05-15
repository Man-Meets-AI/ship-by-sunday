import type { AuthPageSupportPanelContent } from "../_components/auth-page-support-panel";

export const resetPasswordSupportPanelContent = {
	bullets: [
		"This task belongs to the sign-in you just completed, so the original redirect target stays attached.",
		"When the password task is accepted, we hand the session back without asking you to restart sign-in.",
		"Only the surrounding shell is customized here; the Clerk reset form itself stays on the shared shadcn theme.",
	],
	description:
		"Clerk requires one more recovery step before the purchased-account session can open cleanly.",
	title: "Finish the required recovery step.",
} as const satisfies AuthPageSupportPanelContent;
