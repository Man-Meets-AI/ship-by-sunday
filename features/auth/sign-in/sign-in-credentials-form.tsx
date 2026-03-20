"use client";

import { AlertCircleIcon } from "lucide-react";
import type { ComponentProps, FormEvent } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";

import type { SignInAuthError } from "@/features/auth/sign-in/types";

type SignInCredentialsFormProps = {
	authError: SignInAuthError | null;
	emailAddress: string;
	emailError: { message?: string } | null;
	globalErrors: Array<{ message?: string }> | null;
	isBusy: boolean;
	isLoaded: boolean;
	password: string;
	passwordError: { message?: string } | null;
	pricingHref: string;
	setEmailAddress: (value: string) => void;
	setPassword: (value: string) => void;
	startGoogleSignIn: () => Promise<void>;
	startPasswordReset: () => Promise<void>;
	submitPassword: () => Promise<void>;
};

function GoogleIcon(props: ComponentProps<"svg">) {
	return (
		<svg fill="currentColor" viewBox="0 0 24 24" {...props}>
			<path d="M3.06364 7.50914C4.70909 4.24092 8.09084 2 12 2C14.6954 2 16.959 2.99095 18.6909 4.60455L15.8227 7.47274C14.7864 6.48185 13.4681 5.97727 12 5.97727C9.39542 5.97727 7.19084 7.73637 6.40455 10.1C6.2045 10.7 6.09086 11.3409 6.09086 12C6.09086 12.6591 6.2045 13.3 6.40455 13.9C7.19084 16.2636 9.39542 18.0227 12 18.0227C13.3454 18.0227 14.4909 17.6682 15.3864 17.0682C16.4454 16.3591 17.15 15.3 17.3818 14.05H12V10.1818H21.4181C21.5364 10.8363 21.6 11.5182 21.6 12.2273C21.6 15.2727 20.5091 17.8363 18.6181 19.5773C16.9636 21.1046 14.7 22 12 22C8.09084 22 4.70909 19.7591 3.06364 16.4909C2.38638 15.1409 2 13.6136 2 12C2 10.3864 2.38638 8.85911 3.06364 7.50914Z" />
		</svg>
	);
}

export function SignInCredentialsForm({
	authError,
	emailAddress,
	emailError,
	globalErrors,
	isBusy,
	isLoaded,
	password,
	passwordError,
	pricingHref,
	setEmailAddress,
	setPassword,
	startGoogleSignIn,
	startPasswordReset,
	submitPassword,
}: SignInCredentialsFormProps) {
	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		await submitPassword();
	}

	return (
		<div className="flex flex-col gap-5">
			{authError === "purchase_required" ? (
				<Alert>
					<AlertCircleIcon aria-hidden />
					<AlertTitle>Google sign-in is for purchased accounts.</AlertTitle>
					<AlertDescription>
						Buy access first, then return here with the Google account tied to your
						purchase. <a href={pricingHref}>See pricing</a>.
					</AlertDescription>
				</Alert>
			) : null}
			{globalErrors?.length ? (
				<Alert variant="destructive">
					<AlertCircleIcon aria-hidden />
					<AlertTitle>We couldn&apos;t sign you in.</AlertTitle>
					<AlertDescription>
						{globalErrors[0]?.message ?? "Try again with the account tied to your purchase."}
					</AlertDescription>
				</Alert>
			) : null}
			<form className="flex flex-col gap-5" onSubmit={handleSubmit}>
				<FieldGroup>
					<Field data-invalid={Boolean(emailError) || undefined}>
						<FieldLabel htmlFor="sign-in-email">Email</FieldLabel>
						<Input
							id="sign-in-email"
							autoComplete="email"
							disabled={!isLoaded || isBusy}
							aria-invalid={Boolean(emailError) || undefined}
							placeholder="you@company.com"
							type="email"
							value={emailAddress}
							onChange={(event) => setEmailAddress(event.target.value)}
						/>
						<FieldError errors={[emailError ?? undefined]} />
					</Field>
					<Field data-invalid={Boolean(passwordError) || undefined}>
						<FieldLabel htmlFor="sign-in-password">Password</FieldLabel>
						<Input
							id="sign-in-password"
							autoComplete="current-password"
							disabled={!isLoaded || isBusy}
							aria-invalid={Boolean(passwordError) || undefined}
							placeholder="Enter your password"
							type="password"
							value={password}
							onChange={(event) => setPassword(event.target.value)}
						/>
						<FieldError errors={[passwordError ?? undefined]} />
					</Field>
				</FieldGroup>
				<Button className="w-full" disabled={!isLoaded || isBusy} type="submit">
					{isBusy ? <Spinner data-icon="inline-start" /> : null}
					Sign in
				</Button>
			</form>
			<div className="flex items-center gap-2">
				<Separator className="flex-1" />
				<span className="text-xs uppercase text-muted-foreground">or with</span>
				<Separator className="flex-1" />
			</div>
			<Button
				className="w-full"
				variant="outline"
				type="button"
				disabled={!isLoaded || isBusy}
				onClick={() => void startGoogleSignIn()}
			>
				{isBusy ? (
					<Spinner data-icon="inline-start" />
				) : (
					<GoogleIcon data-icon="inline-start" aria-hidden />
				)}
				Continue with Google
			</Button>
			<div className="flex flex-col gap-2">
				<Button
					type="button"
					variant="link"
					size="sm"
					className="h-auto justify-start px-0"
					disabled={!isLoaded || isBusy}
					onClick={() => void startPasswordReset()}
				>
					Forgot your password?
				</Button>
				<FieldDescription>
					New accounts are created only after checkout. Use Google only if it is
					already tied to your purchased access.
				</FieldDescription>
			</div>
		</div>
	);
}
