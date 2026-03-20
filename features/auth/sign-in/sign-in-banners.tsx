"use client";

import { AlertCircleIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import type { SignInAuthError } from "@/features/auth/sign-in/types";

type SignInBannerProps = {
	authError: SignInAuthError | null;
	globalErrors: Array<{ message?: string }> | null;
	pricingHref: string;
};

export function SignInBanners({
	authError,
	globalErrors,
	pricingHref,
}: SignInBannerProps) {
	return (
		<>
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
						{globalErrors[0]?.message ??
							"Try again with the account tied to your purchase."}
					</AlertDescription>
				</Alert>
			) : null}
		</>
	);
}
