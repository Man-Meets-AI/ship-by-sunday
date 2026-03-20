"use client";

import { AlertCircleIcon } from "lucide-react";
import type { FormEvent } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

import type {
	VerificationMethod,
	VerificationStatus,
} from "@/features/auth/sign-in/types";

type SignInVerificationFormProps = {
	activeVerificationMethod: VerificationMethod;
	availableVerificationMethods: VerificationMethod[];
	globalErrors: Array<{ message?: string }> | null;
	isBusy: boolean;
	verificationCode: string;
	verificationError: { message?: string } | null;
	selectVerificationMethod: (method: VerificationMethod) => void;
	resendVerificationCode: () => Promise<void>;
	setVerificationCode: (value: string) => void;
	startOver: () => Promise<void>;
	status: VerificationStatus;
	submitVerification: () => Promise<void>;
};

function getVerificationCopy(
	method: VerificationMethod,
	status: VerificationStatus,
) {
	if (method === "backup_code") {
		return {
			description:
				"Enter one of your backup codes to finish signing in on this device.",
			label: "Backup code",
			submitLabel: "Verify backup code",
			usesOtp: false,
		};
	}

	if (method === "totp") {
		return {
			description:
				status === "needs_client_trust"
					? "Enter the authenticator code for this trusted-device check."
					: "Enter the authenticator code from your app to finish signing in.",
			label: "Authenticator code",
			submitLabel: "Verify authenticator code",
			usesOtp: false,
		};
	}

	const isEmail = method === "email_code";

	return {
		description: isEmail
			? "We sent a verification code to your email address."
			: "We sent a verification code to your phone number.",
		label: isEmail ? "Email code" : "Phone code",
		submitLabel: isEmail ? "Verify email code" : "Verify phone code",
		usesOtp: true,
	};
}

function getAlternateMethodLabel(method: VerificationMethod) {
	switch (method) {
		case "backup_code":
			return "Use a backup code instead";
		case "email_code":
			return "Use an email code instead";
		case "phone_code":
			return "Use a phone code instead";
		case "totp":
			return "Use your authenticator instead";
		default:
			return method;
	}
}

export function SignInVerificationForm({
	activeVerificationMethod,
	availableVerificationMethods,
	globalErrors,
	isBusy,
	verificationCode,
	verificationError,
	selectVerificationMethod,
	resendVerificationCode,
	setVerificationCode,
	startOver,
	status,
	submitVerification,
}: SignInVerificationFormProps) {
	const copy = getVerificationCopy(activeVerificationMethod, status);
	const alternateMethods = availableVerificationMethods.filter(
		(method) => method !== activeVerificationMethod,
	);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		await submitVerification();
	}

	return (
		<div className="flex flex-col gap-5">
			{globalErrors?.length ? (
				<Alert variant="destructive">
					<AlertCircleIcon aria-hidden />
					<AlertTitle>Verification failed.</AlertTitle>
					<AlertDescription>
						{globalErrors[0]?.message ?? "Double-check the code and try again."}
					</AlertDescription>
				</Alert>
			) : null}
			<form className="flex flex-col gap-5" onSubmit={handleSubmit}>
				<FieldGroup>
					<Field data-invalid={Boolean(verificationError) || undefined}>
						<FieldLabel htmlFor="sign-in-verification-code">
							{copy.label}
						</FieldLabel>
						<FieldDescription>{copy.description}</FieldDescription>
						{copy.usesOtp ? (
							<InputOTP
								id="sign-in-verification-code"
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
						) : (
							<Input
								id="sign-in-verification-code"
								autoComplete="one-time-code"
								aria-invalid={Boolean(verificationError) || undefined}
								disabled={isBusy}
								value={verificationCode}
								onChange={(event) => setVerificationCode(event.target.value)}
							/>
						)}
						<FieldError errors={[verificationError ?? undefined]} />
					</Field>
				</FieldGroup>
				<Button className="w-full" disabled={isBusy} type="submit">
					{isBusy ? <Spinner data-icon="inline-start" /> : null}
					{copy.submitLabel}
				</Button>
			</form>
			<div className="flex flex-col gap-2">
				{activeVerificationMethod === "email_code" ||
				activeVerificationMethod === "phone_code" ? (
					<Button
						type="button"
						variant="link"
						size="sm"
						className="h-auto justify-start px-0"
						disabled={isBusy}
						onClick={() => void resendVerificationCode()}
					>
						Resend code
					</Button>
				) : null}
				{alternateMethods.map((method) => (
					<Button
						key={method}
						type="button"
						variant="link"
						size="sm"
						className="h-auto justify-start px-0"
						disabled={isBusy}
						onClick={() => selectVerificationMethod(method)}
					>
						{getAlternateMethodLabel(method)}
					</Button>
				))}
				<Button
					type="button"
					variant="link"
					size="sm"
					className="h-auto justify-start px-0"
					disabled={isBusy}
					onClick={() => void startOver()}
				>
					Start over
				</Button>
			</div>
		</div>
	);
}
