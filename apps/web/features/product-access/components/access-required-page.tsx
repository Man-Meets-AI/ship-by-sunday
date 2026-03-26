"use client";

import { AccessRequiredShell } from "@/features/product-access/components/access-required-shell";
import { useAccessRequiredController } from "@/features/product-access/hooks/use-access-required-controller";
import type { ProductAccess } from "@/features/product-access/lib/product-access";

export function AccessRequiredPage({
	initialAccess,
}: {
	initialAccess?: ProductAccess;
}) {
	const { isRetryingAccess, lastRefreshLabel, onRetryAccessCheck, viewModel } =
		useAccessRequiredController(initialAccess);

	return (
		<main className="relative min-h-screen overflow-hidden bg-background text-foreground">
			<div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-muted/60 via-background to-background" />
			<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-border/80" />
			<div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[24rem] border-l border-border/40 bg-muted/20 lg:block" />
			<div className="relative">
				<AccessRequiredShell
					viewModel={viewModel}
					isRetryingAccess={isRetryingAccess}
					lastRefreshLabel={lastRefreshLabel}
					onRetryAccessCheck={onRetryAccessCheck}
				/>
			</div>
		</main>
	);
}
