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

type PostCheckoutSignUpFormProps = {
	emailAddress: string;
	emailError: { message?: string } | null;
	globalErrors: Array<{ message?: string }> | null;
	isBusy: boolean;
	password: string;
	passwordError: { message?: string } | null;
	resendVerificationCode: () => Promise<void>;
	setPassword: (value: string) => void;
	setVerificationCode: (value: string) => void;
	step: "create" | "verify";
	submitSignUp: () => Promise<void>;
	submitVerification: () => Promise<void>;
	verificationCode: string;
	verificationError: { message?: string } | null;
};

export function PostCheckoutSignUpForm({
	emailAddress,
	emailError,
	globalErrors,
	isBusy,
	password,
	passwordError,
	resendVerificationCode,
	setPassword,
	setVerificationCode,
	step,
	submitSignUp,
	submitVerification,
	verificationCode,
	verificationError,
}: PostCheckoutSignUpFormProps) {
	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (step === "create") {
			await submitSignUp();
			return;
		}

		await submitVerification();
	}

	return (
		<div className="flex flex-col gap-5">
			{globalErrors?.length ? (
				<Alert variant="destructive">
					<AlertCircleIcon aria-hidden />
					<AlertTitle>We couldn&apos;t finish the account setup.</AlertTitle>
					<AlertDescription>
						{globalErrors[0]?.message ??
							"Use the checkout email and try again."}
					</AlertDescription>
				</Alert>
			) : null}
			<form className="flex flex-col gap-5" onSubmit={handleSubmit}>
				<FieldGroup>
					<Field data-invalid={Boolean(emailError) || undefined}>
						<FieldLabel htmlFor="sign-up-email">Checkout email</FieldLabel>
						<Input
							id="sign-up-email"
							autoComplete="email"
							disabled={true}
							readOnly={true}
							type="email"
							value={emailAddress}
						/>
						<FieldError errors={[emailError ?? undefined]} />
					</Field>
					{step === "create" ? (
						<Field data-invalid={Boolean(passwordError) || undefined}>
							<FieldLabel htmlFor="sign-up-password">
								Create password
							</FieldLabel>
							<Input
								id="sign-up-password"
								autoComplete="new-password"
								disabled={isBusy}
								aria-invalid={Boolean(passwordError) || undefined}
								placeholder="Create a password"
								type="password"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
							/>
							<FieldError errors={[passwordError ?? undefined]} />
						</Field>
					) : (
						<Field data-invalid={Boolean(verificationError) || undefined}>
							<FieldLabel htmlFor="sign-up-code">Verification code</FieldLabel>
							<Input
								id="sign-up-code"
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
					)}
				</FieldGroup>
				<Button className="w-full" disabled={isBusy} type="submit">
					{isBusy ? <Spinner data-icon="inline-start" /> : null}
					{step === "create" ? "Create account" : "Verify and continue"}
				</Button>
			</form>
			{step === "verify" ? (
				<Button
					type="button"
					variant="link"
					size="sm"
					className="h-auto justify-start px-0"
					disabled={isBusy}
					onClick={() => void resendVerificationCode()}
				>
					I need a new code
				</Button>
			) : null}
			<div id="clerk-captcha" />
		</div>
	);
}
