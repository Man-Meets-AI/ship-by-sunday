"use client";

import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

import { SignInBanners } from "@/features/auth/sign-in/sign-in-banners";
import { SignInCredentialFields } from "@/features/auth/sign-in/sign-in-credential-fields";
import { SignInSecondaryActions } from "@/features/auth/sign-in/sign-in-secondary-actions";
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
	setEmailAddress: (value: string) => void;
	setPassword: (value: string) => void;
	startGoogleSignIn: () => Promise<void>;
	startPasswordReset: () => Promise<void>;
	submitPassword: () => Promise<void>;
};

export function SignInCredentialsForm({
	authError,
	emailAddress,
	emailError,
	globalErrors,
	isBusy,
	isLoaded,
	password,
	passwordError,
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
			<SignInBanners authError={authError} globalErrors={globalErrors} />
			<form className="flex flex-col gap-5" onSubmit={handleSubmit}>
				<SignInCredentialFields
					emailAddress={emailAddress}
					emailError={emailError}
					isBusy={isBusy}
					isLoaded={isLoaded}
					password={password}
					passwordError={passwordError}
					setEmailAddress={setEmailAddress}
					setPassword={setPassword}
				/>
				<Button className="w-full" disabled={!isLoaded || isBusy} type="submit">
					{isBusy ? <Spinner data-icon="inline-start" /> : null}
					Sign in
				</Button>
			</form>
			<SignInSecondaryActions
				isBusy={isBusy}
				isLoaded={isLoaded}
				startGoogleSignIn={startGoogleSignIn}
				startPasswordReset={startPasswordReset}
			/>
		</div>
	);
}
