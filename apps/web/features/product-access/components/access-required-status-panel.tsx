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
	const hasSupportingDetails =
		Boolean(viewModel.signedInAccountHint) ||
		(Boolean(viewModel.statusCalloutTitle) &&
			Boolean(viewModel.statusCalloutBody));

	return (
		<section className="grid gap-6">
			<div className="flex flex-wrap gap-x-5 gap-y-2 text-sm leading-6 text-muted-foreground">
				<p>Protected workspace</p>
				<p>{viewModel.accessStateLabel}</p>
			</div>
			<div className="grid gap-4">
				<h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
					{viewModel.title}
				</h1>
				<p className="max-w-3xl text-lg leading-8 text-foreground/82">
					{viewModel.shellSubtitle}
				</p>
				<p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-[0.95rem]">
					{viewModel.helperCopy}
				</p>
			</div>
			{hasSupportingDetails ? (
				<div className="grid gap-6 border-t border-border/60 pt-6 sm:grid-cols-2">
					{viewModel.signedInAccountHint ? (
						<div
							className="grid gap-2"
							data-testid="access-required-account-identity"
						>
							<p className="text-sm leading-6 text-muted-foreground">
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
							<p className="text-sm leading-6 text-muted-foreground">
								{viewModel.statusCalloutTitle}
							</p>
							<p className="text-sm leading-6 text-foreground/82">
								{viewModel.statusCalloutBody}
							</p>
						</div>
					) : null}
				</div>
			) : null}
		</section>
	);
}
