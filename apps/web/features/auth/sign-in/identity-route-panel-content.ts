import type { AuthPageSupportPanelContent } from "@/features/auth/sign-in/auth-page-support-panel";

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

export const ssoCallbackSupportPanelContent = {
	bullets: [
		"If the Google account matches a paid Ship by Sunday account, we continue automatically without extra clicks.",
		"If Clerk needs another task, we route into that recovery step instead of dropping the original destination.",
		"If the identity does not match a purchased account, we send you back to sign in with the correct checkout email.",
	],
	description:
		"This route exists only long enough to finish the OAuth callback and restore the intended destination.",
	title:
		"We are stitching the Google session back into your purchased account.",
} as const satisfies AuthPageSupportPanelContent;
