import type { SignInAuthError } from "@/platform/auth/auth-route-utils";
import type { SignInStep } from "@/app/(identity)/_components/sign-in/sign-in-flow-types";
import { assertNever } from "@/lib/assert";

type SignInPageContent = {
	description: string;
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
			title: "Sign in",
		};
	}

	if (isColdDefaultVisit) {
		return {
			description: "Use the account attached to your purchase to continue.",
			title: "Sign in",
		};
	}

	return {
		description: "Use the account attached to your purchase to continue.",
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
				title: "Reset password",
			};
		case "reset_submit":
			return {
				description: "Set a new password, then we’ll sign you back in.",
				title: "Choose a new password",
			};
		case "reset_verify":
			return {
				description: "Enter the reset code from your inbox to keep going.",
				title: "Verify reset code",
			};
		case "verification":
			return {
				description:
					step.status === "needs_client_trust"
						? "Verify this device before we complete your sign-in."
						: "Complete the additional verification step to sign in.",
				title: "Verify your sign-in",
			};
		default:
			return assertNever(step, "Unsupported sign-in step");
	}
}
