"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { CheckoutButton } from "@/components/checkout-button";
import { ProductShell } from "@/components/product-shell";
import type { ProductTheme } from "@/lib/product-theme";

type AccessStepState = "complete" | "active" | "pending";

type AccessProgressStep = {
	label: string;
	state: AccessStepState;
	detail: string;
};

function AccessProgress({ steps }: { steps: readonly AccessProgressStep[] }) {
	return (
		<div className="mt-6 grid gap-3 sm:grid-cols-3">
			{steps.map((step) => {
				const isComplete = step.state === "complete";
				const isActive = step.state === "active";
				const stepClassName = isActive
					? "border-product-accent/60 bg-product-accent/8"
					: isComplete
						? "border-product-border/70 bg-product-surface"
						: "border-product-border/40 bg-product-surface-strong/60";
				const dotClassName = isComplete
					? "bg-product-text"
					: isActive
						? "bg-product-accent/80 motion-safe:animate-pulse"
						: "bg-product-border/35";
				const detailClassName = isActive
					? "text-product-text"
					: "text-product-muted";

				return (
					<div
						key={step.label}
						className={`border px-3 py-3 transition-colors duration-200 ease-out motion-reduce:transition-none ${stepClassName}`}
					>
						<div className="flex items-center justify-between gap-2">
							<p className="font-mono text-[9px] uppercase tracking-[0.16em] text-product-text">
								{step.label}
							</p>
							<span
								className={`inline-flex size-2.5 rounded-full transition-colors duration-200 ease-out motion-reduce:transition-none ${dotClassName}`}
								aria-hidden="true"
							/>
						</div>
						<p className={`mt-2 text-xs leading-relaxed ${detailClassName}`}>
							{step.detail}
						</p>
					</div>
				);
			})}
		</div>
	);
}

function AccessHelpPanel({ isCheckingAccess }: { isCheckingAccess: boolean }) {
	const leadCopy = isCheckingAccess
		? "If you just paid, keep this tab open while we refresh your entitlement."
		: "If purchase happened on a different account, switch to that login first.";
	const guidance = isCheckingAccess
		? [
				"Stay on this page for a few seconds so purchase sync can finish.",
				"Use Open mission if your access was already granted.",
				"Retry checkout if you still need to unlock access.",
			]
		: [
				"Open mission to retry entitlement lookup.",
				"Sign in with the same email used at checkout.",
				"Use instant access if this account has not purchased yet.",
			];

	return (
		<aside className="h-fit border border-product-border/55 bg-product-surface-strong/72 p-4">
			<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted">
				Need help
			</p>
			<p className="mt-3 text-sm leading-relaxed text-product-text">
				{leadCopy}
			</p>
			<ul className="mt-4 space-y-2.5">
				{guidance.map((item) => (
					<li key={item} className="flex items-start gap-2">
						<span
							className="mt-1 inline-flex size-1.5 shrink-0 rounded-full bg-product-accent/80"
							aria-hidden="true"
						/>
						<span className="text-xs leading-relaxed text-product-muted">
							{item}
						</span>
					</li>
				))}
			</ul>
		</aside>
	);
}

export function AccessRequiredPage({
	initialTheme,
}: {
	initialTheme: ProductTheme;
}) {
	const router = useRouter();
	const access = useQuery(api.course.viewerAccess) as
		| {
				hasAccess: boolean;
				status: string;
		  }
		| undefined;
	const isCheckingAccess = access === undefined;
	const title = isCheckingAccess ? "Checking access" : "No active access";
	const helperCopy = isCheckingAccess
		? "We’re checking your purchase status in the background. If you just checked out, this page will update automatically."
		: "We could not find course access on this account yet. If you already bought Ship by Sunday, wait a few seconds and try Mission again.";
	const progressSteps = [
		{
			label: "Signed in",
			state: "complete",
			detail: "Identity confirmed.",
		},
		{
			label: "Check purchase",
			state: isCheckingAccess ? "active" : "complete",
			detail: isCheckingAccess
				? "Looking for recent Stripe entitlement events."
				: "Purchase lookup completed.",
		},
		{
			label: isCheckingAccess ? "Waiting on access" : "Choose next step",
			state: isCheckingAccess ? "pending" : "active",
			detail: isCheckingAccess
				? "Auto-refresh is active."
				: "Pick your best next action below.",
		},
	] as const;

	useEffect(() => {
		if (access?.hasAccess) {
			router.replace("/mission");
		}
	}, [access, router]);

	return (
		<ProductShell
			initialTheme={initialTheme}
			title="Access Required"
			subtitle="This account can sign in, but it does not have course access yet."
			enableMissionQuery={false}
			showSkillRail={false}
		>
			<section className="relative mx-auto w-full max-w-6xl overflow-hidden border border-product-border/70 bg-product-surface/80 p-5 shadow-panel backdrop-blur-xl sm:p-7">
				<div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-product-accent/10 to-transparent" />
				<div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_17rem]">
					<div>
						<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
							Account access
						</p>
						<div className="mt-4 flex flex-wrap items-center gap-2">
							<div
								className="inline-flex items-center gap-2 border border-product-border bg-product-surface-strong/80 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted"
								role="status"
								aria-live="polite"
								aria-atomic="true"
							>
								<span
									className={`inline-flex size-2.5 rounded-full ${
										isCheckingAccess
											? "bg-product-accent/70 motion-safe:animate-pulse"
											: "bg-product-text"
									}`}
									aria-hidden="true"
								/>
								{isCheckingAccess
									? "Checking course access"
									: "No course access found"}
							</div>
							<span className="border border-product-border/45 bg-product-surface px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-product-muted">
								Auto refresh enabled
							</span>
						</div>
						<h1 className="mt-4 font-display text-3xl uppercase leading-none tracking-[0.08em] text-product-text sm:text-4xl">
							{title}
						</h1>
						<p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-product-muted">
							{helperCopy}
						</p>
						<AccessProgress steps={progressSteps} />
						<div
							className={`mt-7 flex flex-wrap gap-3 transition-all duration-200 ease-out motion-reduce:transition-none ${
								isCheckingAccess
									? "translate-y-[4px] opacity-70"
									: "translate-y-0 opacity-100"
							}`}
						>
							{!isCheckingAccess ? (
								<CheckoutButton
									label="Get instant access"
									className="sbs-hover-lift inline-flex min-w-[14.5rem] justify-center rounded-none border border-product-accent bg-product-accent/10 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-product-accent hover:bg-product-accent hover:text-product-bg"
								/>
							) : null}
							<Link
								href="/mission"
								className="sbs-hover-lift sbs-press-feedback inline-flex min-w-[11rem] justify-center rounded-none border border-product-border bg-product-surface px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-product-text hover:bg-product-surface-alt focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-product-accent"
							>
								Open mission
							</Link>
							<Link
								href="/"
								className="sbs-hover-lift sbs-press-feedback inline-flex min-w-[11rem] justify-center rounded-none border border-product-border bg-product-surface px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-product-text hover:bg-product-surface-alt focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-product-accent"
							>
								Back home
							</Link>
						</div>
					</div>
					<AccessHelpPanel isCheckingAccess={isCheckingAccess} />
				</div>
			</section>
		</ProductShell>
	);
}
