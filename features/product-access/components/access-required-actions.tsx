"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CheckoutButton } from "@/features/checkout/components/checkout-button";
import type {
	AccessActionModel,
	AccessCardModel,
} from "@/features/product-access/lib/access-required-view-model";

function AccessAction({
	action,
	isRetryingAccess,
	onRetryAccessCheck,
}: {
	action: AccessActionModel;
	isRetryingAccess: boolean;
	onRetryAccessCheck: () => void;
}) {
	if (action.kind === "checkout") {
		return (
			<CheckoutButton
				label={action.label}
				className="min-w-48 justify-center"
			/>
		);
	}

	if (action.kind === "retry") {
		return (
			<Button
				type="button"
				onClick={onRetryAccessCheck}
				disabled={isRetryingAccess}
				aria-busy={isRetryingAccess}
				variant={action.variant}
				className="min-w-44 justify-center"
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

	return (
		<Button
			asChild
			variant={action.variant}
			className="min-w-44 justify-center"
		>
			<Link href={action.href}>{action.label}</Link>
		</Button>
	);
}

export function AccessRequiredActions({
	cards,
	refreshHint,
	isRetryingAccess,
	onRetryAccessCheck,
}: {
	cards: readonly AccessCardModel[];
	refreshHint: string;
	isRetryingAccess: boolean;
	onRetryAccessCheck: () => void;
}) {
	return (
		<div className="flex flex-col gap-8">
			{cards.map((card, index) => (
				<section key={`${card.title}-${index}`} className="flex flex-col gap-3">
					<h2 className="text-sm font-semibold">{card.title}</h2>
					<p className="text-sm text-muted-foreground">{card.description}</p>
					{card.actions.some((action) => action.kind === "retry") ? (
						<p className="text-xs text-muted-foreground" aria-live="polite">
							{refreshHint}
						</p>
					) : null}
					<div className="flex flex-wrap gap-2">
						{card.actions.map((action, actionIndex) => (
							<AccessAction
								key={`${card.title}-${action.kind}-${actionIndex}`}
								action={action}
								isRetryingAccess={isRetryingAccess}
								onRetryAccessCheck={onRetryAccessCheck}
							/>
						))}
					</div>
				</section>
			))}
		</div>
	);
}
