import type { SignInStep } from "@/app/(identity)/_components/sign-in/sign-in-flow-types";
import { assertNever } from "@/lib/assert";

type SignInPageContent = {
	description: string;
	title: string;
};

function getCredentialsContent(): SignInPageContent {
	return {
		description:
			"Enter the email tied to your purchase. We’ll send a one-time code.",
		title: "Sign in",
	};
}

export function getSignInPageContent({
	step,
}: {
	step: SignInStep;
}): SignInPageContent {
	switch (step.kind) {
		case "email":
			return getCredentialsContent();
		case "email_code":
			return {
				description: "Enter the one-time code from your inbox to continue.",
				title: "Check your email",
			};
		default:
			return assertNever(step, "Unsupported sign-in step");
	}
}
