"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useState } from "react";
import { useQuery } from "convex/react";

import {
	getSignInRedirectHref,
	routeConfig,
	timingConfig,
} from "@/config/product";
import { api } from "@/convex/_generated/api";
import { CheckoutButton } from "@/features/checkout/components/checkout-button";
import { ProductShell } from "@/features/course/shared/components/product-shell";
import type { ProductTheme } from "@/features/course/shared/utils/product-theme";

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

function formatRefreshTime(timestamp: number | null) {
	if (!timestamp) {
		return null;
	}

	return new Intl.DateTimeFormat("en-US", {
		hour: "numeric",
		minute: "2-digit",
		second: "2-digit",
	}).format(timestamp);
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
	const [isRetryingAccess, setIsRetryingAccess] = useState(false);
	const [lastRefreshAt, setLastRefreshAt] = useState<number | null>(null);
	const accessStatus = access?.status ?? "loading";
	const isCheckingAccess = access === undefined;
	const isSignedOut =
		accessStatus === "signed_out" || accessStatus === "missing_token";
	const shellSubtitle = isCheckingAccess
		? "We’re checking whether this signed-in account already has access."
		: isSignedOut
			? "Use the same account you used at checkout so we can reconnect your access."
			: "This signed-in account does not have Ship by Sunday access yet.";
	const title = isCheckingAccess
		? "Checking access"
		: isSignedOut
			? "Sign in to check your access"
			: "Access not attached to this account";
	const helperCopy = isCheckingAccess
		? "We’re checking your purchase status in the background so we can send you into Ship by Sunday automatically."
		: isSignedOut
			? "If you already paid, sign in with the same email you used at checkout. If you have not purchased yet, review the offer before starting checkout."
			: "We could not find an active Ship by Sunday entitlement on this account. Most people here either just completed checkout and need a few more seconds, or they are signed into a different email than the one used at purchase.";
	const accessStateLabel = isCheckingAccess
		? "Purchase sync in progress"
		: isSignedOut
			? "Sign-in required"
			: access?.status === "none"
				? "No active entitlement found"
				: `Entitlement status: ${access?.status ?? "unknown"}`;
	const progressSteps = [
		{
			label: "Signed in",
			state: isSignedOut ? "active" : "complete",
			detail: isSignedOut
				? "Sign in to load account access."
				: "Identity confirmed.",
		},
		{
			label: "Check purchase",
			state: isCheckingAccess ? "active" : isSignedOut ? "pending" : "complete",
			detail: isCheckingAccess
				? "Looking for recent Stripe entitlement events."
				: isSignedOut
					? "We can only check entitlement after auth."
					: "Purchase lookup completed.",
		},
		{
			label: isCheckingAccess
				? "Waiting on access"
				: isSignedOut
					? "Continue to sign in"
					: "Choose next step",
			state: isCheckingAccess || isSignedOut ? "pending" : "active",
			detail: isCheckingAccess
				? "Auto-refresh is active."
				: isSignedOut
					? "Return here after account auth."
					: "Pick your best next action below.",
		},
	] as const;
	const purchaseDecisionDescription = isCheckingAccess
		? "If you already paid, keep this page open. If nothing changes after a short wait, you can still check mission manually."
		: isSignedOut
			? "If you have already purchased, sign in with the same email you used at checkout before trying anything else."
			: "If you completed checkout already, use retry access check first. Buy access only if this account has not purchased yet.";
	const lastRefreshLabel = formatRefreshTime(lastRefreshAt);

	useEffect(() => {
		if (access?.hasAccess) {
			router.replace(routeConfig.mission);
		}
	}, [access, router]);

	useEffect(() => {
		if (!isRetryingAccess || isCheckingAccess) {
			return;
		}

		const timeout = window.setTimeout(() => {
			setIsRetryingAccess(false);
		}, timingConfig.accessRetryResetMs);

		return () => window.clearTimeout(timeout);
	}, [isCheckingAccess, isRetryingAccess]);

	function handleRetryAccessCheck() {
		setIsRetryingAccess(true);
		setLastRefreshAt(Date.now());
		startTransition(() => {
			router.refresh();
		});
	}

	return (
		<ProductShell
			initialTheme={initialTheme}
			title="Access Required"
			subtitle={shellSubtitle}
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
							<span className="border border-product-border/45 bg-product-surface px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-product-muted">
								{accessStateLabel}
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
							className={`mt-7 grid gap-3 transition-all duration-200 ease-out motion-reduce:transition-none lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] ${
								isCheckingAccess
									? "translate-y-[4px] opacity-85"
									: "translate-y-0 opacity-100"
							}`}
						>
							<div className="border border-product-border/55 bg-product-surface-strong/72 p-4">
								<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted">
									Already paid
								</p>
								<p className="mt-3 text-sm leading-relaxed text-product-text">
									{isSignedOut
										? "Use this path if you already bought Ship by Sunday and need to sign in with the same account used at checkout."
										: "Use this path if you already bought Ship by Sunday and just need the access grant to catch up with your account."}
								</p>
								<div className="mt-4 flex flex-wrap gap-2.5">
									{isSignedOut ? (
										<>
											<Link
												href={getSignInRedirectHref(routeConfig.accessRequired)}
												className="sbs-hover-lift sbs-press-feedback inline-flex min-w-[11rem] justify-center rounded-none border border-product-accent bg-product-accent/10 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-product-accent hover:bg-product-accent hover:text-product-bg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-product-accent"
											>
												Sign in
											</Link>
											<Link
												href={routeConfig.home}
												className="sbs-hover-lift sbs-press-feedback inline-flex min-w-[11rem] justify-center rounded-none border border-product-border bg-product-surface px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-product-text hover:bg-product-surface-alt focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-product-accent"
											>
												Back home
											</Link>
										</>
									) : (
										<>
											<button
												type="button"
												onClick={handleRetryAccessCheck}
												disabled={isRetryingAccess}
												aria-busy={isRetryingAccess}
												className="sbs-hover-lift sbs-press-feedback inline-flex min-w-[11rem] justify-center rounded-none border border-product-accent bg-product-accent/10 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-product-accent hover:bg-product-accent hover:text-product-bg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-product-accent disabled:cursor-not-allowed disabled:opacity-70"
											>
												{isRetryingAccess
													? "Refreshing access..."
													: "Retry access check"}
											</button>
											<Link
												href={routeConfig.home}
												className="sbs-hover-lift sbs-press-feedback inline-flex min-w-[11rem] justify-center rounded-none border border-product-border bg-product-surface px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-product-text hover:bg-product-surface-alt focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-product-accent"
											>
												Back home
											</Link>
										</>
									)}
								</div>
								{!isSignedOut ? (
									<p
										className="mt-3 text-[11px] uppercase tracking-[0.12em] text-product-muted"
										aria-live="polite"
									>
										{isRetryingAccess
											? "Refreshing entitlement status now."
											: lastRefreshLabel
												? `Last checked ${lastRefreshLabel}`
												: "No manual refresh yet."}
									</p>
								) : null}
							</div>
							<div className="border border-product-border/55 bg-product-surface-strong/72 p-4">
								<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted">
									Need to buy access
								</p>
								<p className="mt-3 text-sm leading-relaxed text-product-text">
									{purchaseDecisionDescription}
								</p>
								<div className="mt-4 flex flex-wrap gap-2.5">
									{!isCheckingAccess && !isSignedOut ? (
										<CheckoutButton
											label="Buy access now"
											className="sbs-hover-lift inline-flex min-w-[12rem] justify-center rounded-none border border-product-accent bg-product-accent/10 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-product-accent hover:bg-product-accent hover:text-product-bg"
										/>
									) : isSignedOut ? (
										<Link
											href={getSignInRedirectHref(routeConfig.accessRequired)}
											className="sbs-hover-lift sbs-press-feedback inline-flex min-w-[12rem] justify-center rounded-none border border-product-accent bg-product-accent/10 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-product-accent hover:bg-product-accent hover:text-product-bg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-product-accent"
										>
											Sign in first
										</Link>
									) : null}
									<Link
										href={routeConfig.home}
										className="sbs-hover-lift sbs-press-feedback inline-flex min-w-[11rem] justify-center rounded-none border border-product-border bg-product-surface px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-product-text hover:bg-product-surface-alt focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-product-accent"
									>
										See offer
									</Link>
								</div>
							</div>
						</div>
					</div>
					<AccessHelpPanel isCheckingAccess={isCheckingAccess} />
				</div>
			</section>
		</ProductShell>
	);
}
