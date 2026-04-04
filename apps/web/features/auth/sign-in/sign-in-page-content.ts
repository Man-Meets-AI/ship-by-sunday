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
					"Use the email or Google account from checkout.",
					"Password reset stays in this route if you need recovery.",
				],
				description:
					"The Google account that signed in is not tied to a paid account.",
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
					"Google works only when it matches the account from checkout.",
					"Password reset stays in this route — no bouncing around.",
				],
				description:
					"Sign in with the same email or Google account you used at checkout.",
				title: "Reconnect the workspace tied to your checkout.",
			},
			title: "Sign in",
		};
	}

	return {
		description: "Use the account attached to your purchase to continue.",
		supportPanel: {
			bullets: [
				"We preserve your original destination after sign-in.",
				"Use the purchased account first, then recovery tools if needed.",
			],
			description:
				"You came from a protected page — sign in to pick up where you left off.",
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
						"The code goes to the purchased email before any password change.",
						"Once verified, we finish sign-in automatically.",
					],
					description: "Recovery stays in this same route the whole way.",
					title: "Request a fresh reset code.",
				},
				title: "Reset password",
			};
		case "reset_submit":
			return {
				description: "Set a new password, then we’ll sign you back in.",
				supportPanel: {
					bullets: [
						"We finish sign-in automatically after the password is set.",
						"Your original destination stays intact.",
					],
					description: "You proved ownership — just set the new password.",
					title: "Set the password that gets you back in.",
				},
				title: "Choose a new password",
			};
		case "reset_verify":
			return {
				description: "Enter the reset code from your inbox to keep going.",
				supportPanel: {
					bullets: [
						"The code proves email ownership before any password change.",
						"You can resend without leaving this route.",
					],
					description: "Check your inbox for the verification code.",
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
									"This browser needs approval before we return access.",
									"Once approved, sign-in continues without restarting.",
								]
							: [
									"One more factor is required before access is restored.",
									"If a factor is unavailable, start over from the sign-in screen.",
								],
					description:
						step.status === "needs_client_trust"
							? "An extra trust check was triggered for this browser."
							: "One more verification factor is needed.",
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
