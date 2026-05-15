"use client";

import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";

import { SignInBanners } from "@/app/(auth)/_components/sign-in/sign-in-banners";

type SignInEmailCodeFormProps = {
	emailAddress: string;
	emailError: { message?: string } | null;
	globalErrors: Array<{ message?: string }> | null;
	isEmailLocked: boolean;
	isBusy: boolean;
	isLoaded: boolean;
	resendEmailCode: () => Promise<void>;
	setEmailAddress: (value: string) => void;
	setVerificationCode: (value: string) => void;
	startEmailCode: () => Promise<void>;
	startOver: () => Promise<void>;
	step: "email" | "email_code";
	submitEmailCode: () => Promise<void>;
	verificationCode: string;
	verificationError: { message?: string } | null;
};

export function SignInEmailCodeForm({
	emailAddress,
	emailError,
	globalErrors,
	isEmailLocked,
	isBusy,
	isLoaded,
	resendEmailCode,
	setEmailAddress,
	setVerificationCode,
	startEmailCode,
	startOver,
	step,
	submitEmailCode,
	verificationCode,
	verificationError,
}: SignInEmailCodeFormProps) {
	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (step === "email") {
			await startEmailCode();
			return;
		}

		await submitEmailCode();
	}

	return (
		<div className="flex flex-col gap-5">
			<SignInBanners globalErrors={globalErrors} />
			<form className="flex flex-col gap-5" onSubmit={handleSubmit}>
				<FieldGroup>
					<Field data-invalid={Boolean(emailError) || undefined}>
						<FieldLabel htmlFor="sign-in-email">Email</FieldLabel>
						<Input
							id="sign-in-email"
							autoComplete="email"
							disabled={
								!isLoaded || isBusy || isEmailLocked || step === "email_code"
							}
							readOnly={isEmailLocked || step === "email_code"}
							aria-invalid={Boolean(emailError) || undefined}
							placeholder="you@company.com"
							type="email"
							value={emailAddress}
							onChange={(event) => setEmailAddress(event.target.value)}
						/>
						<FieldError errors={[emailError ?? undefined]} />
					</Field>
					{step === "email_code" ? (
						<Field data-invalid={Boolean(verificationError) || undefined}>
							<FieldLabel htmlFor="sign-in-email-code">Email code</FieldLabel>
							<FieldDescription>
								Enter the one-time code Clerk sent to your inbox.
							</FieldDescription>
							<InputOTP
								id="sign-in-email-code"
								inputMode="numeric"
								maxLength={6}
								value={verificationCode}
								onChange={setVerificationCode}
							>
								<InputOTPGroup>
									<InputOTPSlot index={0} />
									<InputOTPSlot index={1} />
									<InputOTPSlot index={2} />
									<InputOTPSlot index={3} />
									<InputOTPSlot index={4} />
									<InputOTPSlot index={5} />
								</InputOTPGroup>
							</InputOTP>
							<FieldError errors={[verificationError ?? undefined]} />
						</Field>
					) : null}
				</FieldGroup>
				<Button className="w-full" disabled={!isLoaded || isBusy} type="submit">
					{isBusy ? <Spinner data-icon="inline-start" /> : null}
					{step === "email" ? "Send email code" : "Verify and continue"}
				</Button>
			</form>
			{step === "email_code" ? (
				<div className="flex flex-col gap-2">
					<Button
						type="button"
						variant="link"
						size="sm"
						className="h-auto justify-start px-0"
						disabled={!isLoaded || isBusy}
						onClick={() => void resendEmailCode()}
					>
						Send a new code
					</Button>
					<Button
						type="button"
						variant="link"
						size="sm"
						className="h-auto justify-start px-0"
						disabled={!isLoaded || isBusy}
						onClick={() => void startOver()}
					>
						{isEmailLocked ? "Start over" : "Use a different email"}
					</Button>
				</div>
			) : (
				<FieldDescription>
					New accounts are created only after checkout. Use the email tied to
					your purchased access.
				</FieldDescription>
			)}
		</div>
	);
}
