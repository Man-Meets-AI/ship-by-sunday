import type { SignInStep } from "@/app/(identity)/_components/sign-in/sign-in-flow-types";
import { assertNever } from "@/lib/assert";

type SignInPageContent = {
	description: string;
	title: string;
};

function getCredentialsContent(): SignInPageContent {
	return {
		description: "Use the account attached to your purchase to continue.",
		title: "Sign in",
	};
}

export function getSignInPageContent({
	step,
}: {
	step: SignInStep;
}): SignInPageContent {
	switch (step.kind) {
		case "credentials":
			return getCredentialsContent();
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
