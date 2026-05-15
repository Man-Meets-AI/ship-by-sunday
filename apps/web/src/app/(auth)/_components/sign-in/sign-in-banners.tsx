"use client";

import { AlertCircleIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type SignInBannerProps = {
	globalErrors: Array<{ message?: string }> | null;
};

export function SignInBanners({ globalErrors }: SignInBannerProps) {
	return (
		<>
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
