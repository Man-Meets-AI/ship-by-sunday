"use client";

import { AlertCircleIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import type { SignInAuthError } from "@/platform/auth/auth-route-utils";

type SignInBannerProps = {
	authError: SignInAuthError | null;
	globalErrors: Array<{ message?: string }> | null;
};

export function SignInBanners({ authError, globalErrors }: SignInBannerProps) {
	return (
		<>
			{authError === "purchase_required" ? (
				<Alert>
					<AlertCircleIcon aria-hidden />
					<AlertTitle>Google sign-in is for purchased accounts.</AlertTitle>
					<AlertDescription>
						Use the email tied to checkout or recover that purchased account
						before trying Google again.
					</AlertDescription>
				</Alert>
			) : null}
			{globalErrors?.length ? (
				<Alert variant="destructive">
					<AlertCircleIcon aria-hidden />
					<AlertTitle>We couldn&apos;t sign you in.</AlertTitle>
					<AlertDescription>
						{globalErrors[0]?.message ??
							"Try again with the account tied to your purchase."}
					</AlertDescription>
				</Alert>
			) : null}
		</>
	);
}
