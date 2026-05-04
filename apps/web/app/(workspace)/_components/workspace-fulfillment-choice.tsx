"use client";

import { ArrowRight, Code2, Loader2, Sparkles } from "lucide-react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { api } from "@/convex/_generated/api";
import { routeConfig } from "@/config/product";
import type { FulfillmentTrack } from "@/platform/billing/checkout/checkout-intent";
import { cn } from "@/lib/utils";

type ChoiceState = FulfillmentTrack | null;

const fulfillmentChoices = [
	{
		fulfillmentTrack: "generated_codebase",
		checkoutCtaId: "choice_generated",
		title: "Generate a new codebase",
		description:
			"Open the guided Codebase workspace and turn the product draft into a new repo package.",
		href: routeConfig.codebase,
		icon: Sparkles,
	},
	{
		fulfillmentTrack: "existing_codebase_doctor",
		checkoutCtaId: "choice_existing",
		title: "Set up an existing codebase",
		description:
			"Start the protected setup entry for runner pairing, repository binding, and the first sync-safe doctor pass.",
		href: routeConfig.workspaceSetup,
		icon: Code2,
	},
] as const;

export function WorkspaceFulfillmentChoice() {
	const router = useRouter();
	const resolveFulfillmentTrack = useMutation(
		api.access.resolveViewerFulfillmentTrack,
	);
	const [pendingChoice, setPendingChoice] = useState<ChoiceState>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	async function chooseFulfillmentPath(
		choice: (typeof fulfillmentChoices)[number],
	) {
		setPendingChoice(choice.fulfillmentTrack);
		setErrorMessage(null);

		try {
			await resolveFulfillmentTrack({
				fulfillmentTrack: choice.fulfillmentTrack,
				checkoutCtaId: choice.checkoutCtaId,
			});
			router.replace(choice.href);
		} catch (error) {
			setErrorMessage(
				error instanceof Error
					? error.message
					: "Unable to save the selected path.",
			);
			setPendingChoice(null);
		}
	}

	return (
		<main className="min-h-dvh bg-background text-foreground tracking-normal">
			<div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
				<div className="max-w-2xl">
					<p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
						Checkout path
					</p>
					<h1 className="mt-3 font-heading-serif text-4xl leading-none tracking-[-0.04em] sm:text-5xl">
						Choose your workspace path
					</h1>
					<p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
						Your access is active. Pick the fulfillment lane that matches what
						you bought so future handoffs open the right protected workspace.
					</p>
				</div>

				<div className="mt-8 grid gap-4 md:grid-cols-2">
					{fulfillmentChoices.map((choice) => {
						const Icon = choice.icon;
						const isPending = pendingChoice === choice.fulfillmentTrack;
						const isDisabled = pendingChoice !== null;

						return (
							<button
								key={choice.fulfillmentTrack}
								type="button"
								onClick={() => void chooseFulfillmentPath(choice)}
								disabled={isDisabled}
								className={cn(
									"group flex min-h-52 flex-col rounded-xl border border-border/60 bg-card p-5 text-left shadow-sm shadow-foreground/5 transition-colors hover:border-foreground/25 hover:bg-muted/30 disabled:pointer-events-none disabled:opacity-60",
								)}
							>
								<span className="flex size-10 items-center justify-center rounded-lg border border-border/60 bg-background text-foreground">
									{isPending ? (
										<Loader2 className="size-4 animate-spin" aria-hidden />
									) : (
										<Icon className="size-4" aria-hidden />
									)}
								</span>
								<span className="mt-5 text-xl font-semibold tracking-tight">
									{choice.title}
								</span>
								<span className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">
									{choice.description}
								</span>
								<span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-foreground">
									Continue
									<ArrowRight
										className="size-4 transition-transform group-hover:translate-x-0.5"
										aria-hidden
									/>
								</span>
							</button>
						);
					})}
				</div>

				{errorMessage ? (
					<div className="mt-5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
						{errorMessage}
					</div>
				) : null}
			</div>
		</main>
	);
}
