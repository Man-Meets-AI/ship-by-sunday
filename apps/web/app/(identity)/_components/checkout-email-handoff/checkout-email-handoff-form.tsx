"use client";

import type { FormEvent } from "react";
import { AlertCircleIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

type CheckoutEmailHandoffFormProps = {
	emailAddress: string;
	emailError: { message?: string } | null;
	globalErrors: Array<{ message?: string }> | null;
	isBusy: boolean;
	isLoaded: boolean;
	resendVerificationCode: () => Promise<void>;
	setVerificationCode: (value: string) => void;
	startEmailCode: () => Promise<void>;
	step: "send" | "verify";
	submitVerification: () => Promise<void>;
	verificationCode: string;
	verificationError: { message?: string } | null;
};

export function CheckoutEmailHandoffForm({
	emailAddress,
	emailError,
	globalErrors,
	isBusy,
	isLoaded,
	resendVerificationCode,
	setVerificationCode,
	startEmailCode,
	step,
	submitVerification,
	verificationCode,
	verificationError,
}: CheckoutEmailHandoffFormProps) {
	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (step === "send") {
			await startEmailCode();
			return;
		}

		await submitVerification();
	}

	return (
		<div className="flex flex-col gap-5">
			{globalErrors?.length ? (
				<Alert variant="destructive">
					<AlertCircleIcon aria-hidden />
					<AlertTitle>We couldn&apos;t prove the checkout email.</AlertTitle>
					<AlertDescription>
						{globalErrors[0]?.message ?? "Use a fresh code and try again."}
					</AlertDescription>
				</Alert>
			) : null}
			<form className="flex flex-col gap-5" onSubmit={handleSubmit}>
				<FieldGroup>
					<Field data-invalid={Boolean(emailError) || undefined}>
						<FieldLabel htmlFor="checkout-email-handoff-email">
							Checkout email
						</FieldLabel>
						<Input
							id="checkout-email-handoff-email"
							autoComplete="email"
							disabled={true}
							readOnly={true}
							type="email"
							value={emailAddress}
						/>
						<FieldError errors={[emailError ?? undefined]} />
					</Field>
					{step === "verify" ? (
						<Field data-invalid={Boolean(verificationError) || undefined}>
							<FieldLabel htmlFor="checkout-email-handoff-code">
								Email code
							</FieldLabel>
							<Input
								id="checkout-email-handoff-code"
								autoComplete="one-time-code"
								disabled={isBusy}
								aria-invalid={Boolean(verificationError) || undefined}
								placeholder="Enter the code from your inbox"
								type="text"
								value={verificationCode}
								onChange={(event) => setVerificationCode(event.target.value)}
							/>
							<FieldError errors={[verificationError ?? undefined]} />
						</Field>
					) : null}
				</FieldGroup>
				<Button className="w-full" disabled={!isLoaded || isBusy} type="submit">
					{isBusy ? <Spinner data-icon="inline-start" /> : null}
					{step === "send" ? "Send email code" : "Verify and continue"}
				</Button>
			</form>
			{step === "verify" ? (
				<Button
					type="button"
					variant="link"
					size="sm"
					className="h-auto justify-start px-0"
					disabled={!isLoaded || isBusy}
					onClick={() => void resendVerificationCode()}
				>
					Send a new code
				</Button>
			) : null}
		</div>
	);
}
