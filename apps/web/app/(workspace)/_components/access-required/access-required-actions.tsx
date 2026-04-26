"use client";

import { useClerk } from "@clerk/nextjs";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CheckoutButton } from "@/features/checkout/components/checkout-button";
import type { AccessActionModel } from "../../_lib/access-required-view-model";

function AccessRequiredActionButton({
	action,
	isRetryingAccess,
	onRetryAccessCheck,
}: {
	action: AccessActionModel;
	isRetryingAccess: boolean;
	onRetryAccessCheck: () => void;
}) {
	const clerk = useClerk();

	if (action.kind === "checkout") {
		return (
			<CheckoutButton
				label={action.label}
				testId="access-required-buy-access"
				className="w-full justify-center sm:w-auto sm:min-w-44"
			/>
		);
	}

	if (action.kind === "retry") {
		return (
			<Button
				type="button"
				size="lg"
				onClick={onRetryAccessCheck}
				disabled={isRetryingAccess}
				aria-busy={isRetryingAccess ? "true" : "false"}
				variant={action.variant}
				className="w-full justify-center sm:w-auto sm:min-w-44"
			>
				{isRetryingAccess ? (
					<>
						<Spinner data-icon="inline-start" />
						{action.busyLabel}
					</>
				) : (
					action.label
				)}
			</Button>
		);
	}

	if (action.kind === "reauthenticate") {
		return (
			<Button
				type="button"
				size="lg"
				variant={action.variant}
				className="w-full justify-center sm:w-auto sm:min-w-44"
				onClick={() => {
					void clerk.signOut({ redirectUrl: action.signInHref });
				}}
			>
				{action.label}
			</Button>
		);
	}

	return (
		<Button
			asChild
			size="lg"
			variant={action.variant}
			className="w-full justify-center sm:w-auto sm:min-w-44"
		>
			<Link href={action.href}>{action.label}</Link>
		</Button>
	);
}

export function AccessRequiredActions({
	actions,
	refreshHint,
	isRetryingAccess,
	onRetryAccessCheck,
}: {
	actions: readonly AccessActionModel[];
	refreshHint: string;
	isRetryingAccess: boolean;
	onRetryAccessCheck: () => void;
}) {
	return (
		<div className="flex flex-col gap-3">
			{actions.some((action) => action.kind === "retry") ? (
				<p
					className="text-xs leading-5 text-muted-foreground"
					aria-live="polite"
				>
					{refreshHint}
				</p>
			) : null}
			<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
				{actions.map((action, actionIndex) => (
					<AccessRequiredActionButton
						key={`${action.kind}-${actionIndex}`}
						action={action}
						isRetryingAccess={isRetryingAccess}
						onRetryAccessCheck={onRetryAccessCheck}
					/>
				))}
			</div>
		</div>
	);
}
