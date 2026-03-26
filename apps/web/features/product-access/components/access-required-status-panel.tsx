"use client";

import { useUser } from "@clerk/nextjs";

import { Skeleton } from "@/components/ui/skeleton";
import type { AccessViewModel } from "@/features/product-access/lib/access-required-view-model";

export function AccessRequiredStatusPanel({
	viewModel,
}: {
	viewModel: AccessViewModel;
}) {
	const { isLoaded, user } = useUser();
	const emailAddress = user?.primaryEmailAddress?.emailAddress ?? null;

	return (
		<section className="overflow-hidden rounded-[28px] border border-border/70 bg-card/95 shadow-sm">
			<div className="h-1 w-full bg-foreground/6" />
			<div className="grid gap-5 px-5 py-6 sm:px-7 sm:py-7">
				<div className="flex flex-wrap items-center gap-2 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-muted-foreground">
					<span className="rounded-full border border-border/70 bg-background/70 px-2.5 py-1">
						Protected workspace
					</span>
					<span className="rounded-full border border-border/70 bg-background/70 px-2.5 py-1">
						{viewModel.accessStateLabel}
					</span>
				</div>
				<div className="grid gap-3">
					<h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
						{viewModel.title}
					</h1>
					<p className="max-w-2xl text-base leading-7 text-foreground/80">
						{viewModel.shellSubtitle}
					</p>
					<p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-[0.95rem]">
						{viewModel.helperCopy}
					</p>
				</div>
				{viewModel.signedInAccountHint ? (
					<div
						className="rounded-[22px] border border-border/70 bg-background/80 px-4 py-4"
						data-testid="access-required-account-identity"
					>
						{!isLoaded ? (
							<div className="space-y-2">
								<Skeleton className="h-4 w-40" />
								<Skeleton className="h-4 w-full max-w-xl" />
							</div>
						) : emailAddress ? (
							<div className="space-y-1.5">
								<p className="text-sm font-medium text-foreground">
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
					<div className="rounded-[22px] border border-border/70 bg-background/80 px-4 py-4">
						<p className="text-sm font-medium text-foreground">
							{viewModel.statusCalloutTitle}
						</p>
						<p className="mt-1 text-sm leading-6 text-muted-foreground">
							{viewModel.statusCalloutBody}
						</p>
					</div>
				) : null}
			</div>
		</section>
	);
}
