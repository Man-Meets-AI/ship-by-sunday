"use client";

import { useUser } from "@clerk/nextjs";

import { Skeleton } from "@/components/ui/skeleton";
import type { AccessViewModel } from "../../_lib/access-required-view-model";

import { AccessRequiredStatusPulse } from "./access-required-status-pulse";

export function AccessRequiredStatusPanel({
	viewModel,
	isRetryingAccess,
}: {
	viewModel: AccessViewModel;
	isRetryingAccess: boolean;
}) {
	const { isLoaded, user } = useUser();
	const emailAddress = user?.primaryEmailAddress?.emailAddress ?? null;
	const hasSupportingDetails =
		Boolean(viewModel.signedInAccountHint) ||
		(Boolean(viewModel.statusCalloutTitle) &&
			Boolean(viewModel.statusCalloutBody));

	return (
		<section className="grid gap-5">
			<div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm leading-6 text-muted-foreground">
				<span className="inline-flex items-center gap-2">
					<AccessRequiredStatusPulse isPolling={isRetryingAccess} />
					<span className="font-medium text-foreground/90">
						Protected workspace
					</span>
				</span>
				<span className="hidden text-border sm:inline" aria-hidden>
					·
				</span>
				<span className="min-w-0 text-muted-foreground">
					{viewModel.accessStateLabel}
				</span>
			</div>
			<div className="grid max-w-3xl gap-3">
				<h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
					{viewModel.title}
				</h1>
				<p className="text-base leading-7 text-foreground/90 sm:text-lg sm:leading-8">
					{viewModel.shellSubtitle}
				</p>
				<p className="text-sm leading-7 text-muted-foreground sm:text-[0.95rem] sm:leading-7">
					{viewModel.helperCopy}
				</p>
			</div>
			{hasSupportingDetails ? (
				<div className="grid gap-6 border-t border-border/60 pt-6 md:grid-cols-2 md:gap-8">
					{viewModel.signedInAccountHint ? (
						<div
							className="grid gap-2"
							data-testid="access-required-account-identity"
						>
							<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
								Signed-in account
							</p>
							{!isLoaded ? (
								<div className="space-y-2">
									<Skeleton className="h-4 w-40" />
									<Skeleton className="h-4 w-full max-w-xl" />
								</div>
							) : emailAddress ? (
								<div className="space-y-1.5">
									<p className="break-all text-sm font-medium text-foreground">
										Signed in as {emailAddress}
									</p>
									<p className="text-sm leading-6 text-muted-foreground">
										{viewModel.signedInAccountHint}
									</p>
								</div>
							) : null}
						</div>
					) : null}
					{viewModel.statusCalloutTitle && viewModel.statusCalloutBody ? (
						<div className="grid gap-2">
							<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
								{viewModel.statusCalloutTitle}
							</p>
							<p className="text-sm leading-6 text-foreground/90">
								{viewModel.statusCalloutBody}
							</p>
						</div>
					) : null}
				</div>
			) : null}
		</section>
	);
}
