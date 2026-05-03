"use client";

import { CheckoutEmailHandoffForm } from "@/app/(identity)/_components/checkout-email-handoff/checkout-email-handoff-form";
import { useCheckoutEmailHandoffFlow } from "@/app/(identity)/_components/checkout-email-handoff/use-checkout-email-handoff-flow";

import { AuthPageShell } from "../auth-page-shell";

const checkoutEmailHandoffSupportPanel = {
	bullets: [
		"The code is sent to the exact email used during checkout.",
		"No Google sign-in or password setup is used on this recovery path.",
		"After verification, we return to the paid access handoff automatically.",
	],
	description:
		"Finish the paid checkout by proving ownership of the Stripe checkout email.",
	title: "Verify the paid checkout email.",
} as const;

export function CheckoutEmailHandoffPage({
	checkoutEmail,
	redirectPath,
}: {
	checkoutEmail: string;
	redirectPath: string;
}) {
	const flow = useCheckoutEmailHandoffFlow({
		lockedEmailAddress: checkoutEmail,
		redirectPath,
	});

	return (
		<AuthPageShell
			title="Prove checkout email"
			description="Enter the one-time code Clerk sends to the email used for this paid checkout."
			supportPanel={checkoutEmailHandoffSupportPanel}
		>
			<CheckoutEmailHandoffForm
				emailAddress={checkoutEmail}
				emailError={flow.emailError}
				globalErrors={flow.globalErrors}
				isBusy={flow.isBusy}
				isLoaded={flow.isLoaded}
				resendVerificationCode={flow.resendVerificationCode}
				setVerificationCode={flow.setVerificationCode}
				startEmailCode={flow.startEmailCode}
				step={flow.step}
				submitVerification={flow.submitVerification}
				verificationCode={flow.verificationCode}
				verificationError={flow.verificationError}
			/>
		</AuthPageShell>
	);
}
