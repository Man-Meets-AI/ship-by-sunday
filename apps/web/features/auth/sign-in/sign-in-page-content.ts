import type { AuthPageSupportPanelContent } from "@/features/auth/sign-in/auth-page-support-panel";
import { getPricingHref } from "@/features/auth/sign-in/sign-in-route-utils";
import type {
	SignInAuthError,
	SignInStep,
} from "@/features/auth/sign-in/types";
import { assertNever } from "@/features/course/lesson/lib/assert";

type SignInPageContent = {
	description: string;
	supportPanel: AuthPageSupportPanelContent;
	title: string;
};

function getCredentialsContent({
	authError,
	isColdDefaultVisit,
}: {
	authError: SignInAuthError | null;
	isColdDefaultVisit: boolean;
}): SignInPageContent {
	if (authError === "purchase_required") {
		return {
			description: "Use the account attached to your purchase to continue.",
			supportPanel: {
				bullets: [
					"Use the checkout email address or the Google account already attached to that purchase.",
					"Password reset stays inside this same shell if the purchased account needs recovery.",
					"Once the account matches, we hand access back without extra navigation.",
				],
				description:
					"Google OAuth reached us, but the returned identity was not tied to a paid Ship by Sunday account.",
				eyebrow: "Purchased Access",
				title: "Google did not match a paid account.",
			},
			title: "Sign in",
		};
	}

	if (isColdDefaultVisit) {
		return {
			description: "Use the account attached to your purchase to continue.",
			supportPanel: {
				action: {
					href: getPricingHref(),
					label: "See pricing",
				},
				bullets: [
					"We send you straight into the product as soon as the session is confirmed.",
					"Google works only when it already matches the account from checkout.",
					"Password reset stays in this route, so recovery does not bounce you around.",
				],
				description:
					"Use the same email or Google account you used when you bought Ship by Sunday.",
				eyebrow: "Purchased Access",
				note: "Need access first? Review the offer before you start a session.",
				title: "Reconnect the workspace tied to your checkout.",
			},
			title: "Sign in",
		};
	}

	return {
		description: "Use the account attached to your purchase to continue.",
		supportPanel: {
			bullets: [
				"We preserve the original target so the route can send you straight back.",
				"Use the purchased account first, then switch recovery tools only if needed.",
				"This screen stays intentionally quiet so access recovery does not turn into a sales page.",
			],
			description:
				"You arrived here from a protected page, so a successful sign-in should hand the session back immediately.",
			eyebrow: "Return Flow",
			title: "Sign in, then continue where you left off.",
		},
		title: "Sign in",
	};
}

export function getSignInPageContent({
	authError,
	isColdDefaultVisit,
	step,
}: {
	authError: SignInAuthError | null;
	isColdDefaultVisit: boolean;
	step: SignInStep;
}): SignInPageContent {
	switch (step.kind) {
		case "credentials":
			return getCredentialsContent({ authError, isColdDefaultVisit });
		case "reset_request":
			return {
				description:
					"We’ll email a reset code so you can get back into your account.",
				supportPanel: {
					bullets: [
						"We send the code to the purchased account before any password change happens.",
						"The rest of the recovery flow stays in this same shell, so context does not jump around.",
						"Once the reset is complete, we finish sign-in and hand the session back.",
					],
					description:
						"Password recovery should feel deliberate and secure, not like a detached utility page.",
					eyebrow: "Secure Recovery",
					title: "Request a fresh reset code.",
				},
				title: "Reset password",
			};
		case "reset_submit":
			return {
				description: "Set a new password, then we’ll sign you back in.",
				supportPanel: {
					bullets: [
						"Choose the password that gets this purchased account back into a working state.",
						"As soon as the password is accepted, we finish the sign-in flow automatically.",
						"The original redirect target stays intact while you complete this step.",
					],
					description:
						"You already proved ownership. This step is only about replacing the old password cleanly.",
					eyebrow: "Secure Recovery",
					title: "Set the password that gets you back in.",
				},
				title: "Choose a new password",
			};
		case "reset_verify":
			return {
				description: "Enter the reset code from your inbox to keep going.",
				supportPanel: {
					bullets: [
						"The code keeps recovery tied to the purchased inbox before any password change happens.",
						"You stay inside the same recovery shell while Clerk verifies ownership.",
						"If the inbox is delayed, the flow can resend without leaving this route.",
					],
					description:
						"This is the verification step that proves the email account can authorize the reset.",
					eyebrow: "Secure Recovery",
					title: "Verify the code from your inbox.",
				},
				title: "Verify reset code",
			};
		case "verification":
			return {
				description:
					step.status === "needs_client_trust"
						? "Verify this device before we complete your sign-in."
						: "Complete the additional verification step to sign in.",
				supportPanel: {
					bullets:
						step.status === "needs_client_trust"
							? [
									"This browser needs one explicit approval before we return access.",
									"The extra trust check protects the purchased account without changing your destination.",
									"Once approved, we continue the same sign-in flow instead of restarting it.",
								]
							: [
									"This account requires one more factor before we hand the session back.",
									"The verification method stays scoped to this sign-in attempt and original redirect target.",
									"If a factor is unavailable, start over and recover the purchased account instead of guessing.",
								],
					description:
						step.status === "needs_client_trust"
							? "Clerk flagged this browser for an extra trust check before completing the purchased-account session."
							: "The account needs one more verification factor before access can be restored.",
					eyebrow:
						step.status === "needs_client_trust"
							? "Device Trust"
							: "Extra Verification",
					title:
						step.status === "needs_client_trust"
							? "Approve this browser and keep moving."
							: "Complete the final sign-in check.",
				},
				title: "Verify your sign-in",
			};
		default:
			return assertNever(step, "Unsupported sign-in step");
	}
}
