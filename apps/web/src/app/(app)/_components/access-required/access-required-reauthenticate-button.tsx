"use client";

import { useClerk } from "@clerk/nextjs";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function AccessRequiredReauthenticateButton({
	label,
	signInHref,
	variant,
	className,
}: {
	readonly label: string;
	readonly signInHref: string;
	readonly variant?: "default" | "secondary" | "outline";
	readonly className?: string;
}) {
	const clerk = useClerk();
	const [isSigningOut, setIsSigningOut] = useState(false);

	return (
		<Button
			type="button"
			size="lg"
			variant={variant}
			disabled={isSigningOut}
			aria-busy={isSigningOut ? "true" : "false"}
			className={className}
			onClick={() => {
				setIsSigningOut(true);
				void clerk.signOut({ redirectUrl: signInHref });
			}}
		>
			{isSigningOut ? (
				<>
					<Spinner data-icon="inline-start" />
					Signing out…
				</>
			) : (
				label
			)}
		</Button>
	);
}
