"use client";

import { ArrowRight, Code2, ListVideo, Loader2, Sparkles } from "lucide-react";
import { useMutation } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { api } from "@/convex/_generated/api";
import { routeConfig } from "@/config/product";
import type { FulfillmentTrack } from "@/platform/billing/checkout/checkout-intent";
import { cn } from "@/lib/utils";
import {
	getSupportModeBlockedMutationMessage,
	isSupportModeBlockedMutationResult,
} from "@/platform/admin-impersonation";

type ChoiceState = FulfillmentTrack | null;

const fulfillmentChoices = [
	{
		kind: "fulfillment",
		fulfillmentTrack: "generated_codebase",
		title: "Generate a new codebase",
		description:
			"Open the guided Codebase workspace and turn the product draft into a new repo package.",
		href: routeConfig.codebase,
		icon: Sparkles,
	},
	{
		kind: "fulfillment",
		fulfillmentTrack: "existing_codebase_doctor",
		title: "Set up an existing codebase",
		description:
			"Start the protected setup entry for runner pairing, repository binding, and the first sync-safe doctor pass.",
		href: routeConfig.workspaceSetup,
		icon: Code2,
	},
] as const;

const tutorialVideosChoice = {
	kind: "link",
	id: "tutorial-videos",
	title: "Watch tutorial videos",
	description:
		"Open the video library first without choosing or changing your product path.",
	href: routeConfig.tutorials,
	icon: ListVideo,
} as const;

const workspacePathChoices = [
	...fulfillmentChoices,
	tutorialVideosChoice,
] as const;

type WorkspacePathChoice = (typeof workspacePathChoices)[number];

export function WorkspaceFulfillmentChoice({
	showCheckoutWelcome = false,
	accountEmail,
}: {
	showCheckoutWelcome?: boolean;
	accountEmail?: string;
}) {
	const router = useRouter();
	const resolveFulfillmentTrack = useMutation(
		api.access.resolveViewerFulfillmentTrack,
	);
	const [pendingChoice, setPendingChoice] = useState<ChoiceState>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		if (!showCheckoutWelcome) {
			return;
		}

		window.history.replaceState(null, "", routeConfig.workspaceChoice);
	}, [showCheckoutWelcome]);

	async function chooseWorkspacePath(choice: WorkspacePathChoice) {
		if (choice.kind === "link") {
			router.replace(choice.href);
			return;
		}

		setPendingChoice(choice.fulfillmentTrack);
		setErrorMessage(null);

		try {
			const result = await resolveFulfillmentTrack({
				fulfillmentTrack: choice.fulfillmentTrack,
			});
			if (isSupportModeBlockedMutationResult(result)) {
				throw new Error(getSupportModeBlockedMutationMessage());
			}
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
					<h1 className="font-heading-serif text-4xl leading-none tracking-[-0.04em] sm:text-5xl">
						Choose your workspace path
					</h1>
					<p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
						Your access is active. Pick the fulfillment lane that matches what
						you bought so future handoffs open the right protected workspace.
					</p>
				</div>

				{showCheckoutWelcome ? (
					<div className="relative mt-6 overflow-hidden rounded-xl border border-border/60 bg-card p-4 shadow-sm shadow-foreground/5">
						<div className="pointer-events-none absolute inset-x-0 top-0 flex justify-around px-4 pt-2 text-xs text-foreground/40 motion-safe:animate-pulse">
							<span>*</span>
							<span>.</span>
							<span>*</span>
							<span>.</span>
							<span>*</span>
						</div>
						<div className="relative flex items-start gap-3">
							<span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-background text-foreground">
								<Sparkles className="size-4" aria-hidden />
							</span>
							<div className="min-w-0">
								<p className="text-sm font-semibold text-foreground">
									You&apos;re in. Access is active
									{accountEmail ? ` for ${accountEmail}` : ""}.
								</p>
								<p className="mt-1 text-sm leading-6 text-muted-foreground">
									This account is associated with your checkout email. You can
									manage account details from{" "}
									<Link
										href={routeConfig.settings}
										className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/70"
									>
										settings
									</Link>{" "}
									anytime.
								</p>
							</div>
						</div>
					</div>
				) : null}

				<div className="mt-8 grid gap-4 md:grid-cols-3">
					{workspacePathChoices.map((choice) => {
						const Icon = choice.icon;
						const choiceKey =
							choice.kind === "fulfillment"
								? choice.fulfillmentTrack
								: choice.id;
						const isPending =
							choice.kind === "fulfillment" &&
							pendingChoice === choice.fulfillmentTrack;
						const isDisabled = pendingChoice !== null;

						return (
							<button
								key={choiceKey}
								type="button"
								onClick={() => void chooseWorkspacePath(choice)}
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
