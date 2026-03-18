"use client";

import { useConvexAuth, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
	getCheckoutSuccessHref,
	getSignInRedirectHref,
	routeConfig,
	timingConfig,
} from "@/config/product";
import { api } from "@/convex/_generated/api";
import { ProductShell } from "@/features/course/shared/components/product-shell";

type CheckoutSessionState =
	| {
			kind: "missing_session_id";
	  }
	| {
			kind: "invalid_session";
			sessionId: string;
	  }
	| {
			kind: "sign_in_required";
			sessionId: string;
	  }
	| {
			kind: "wrong_account";
			sessionId: string;
	  }
	| {
			kind: "payment_pending";
			sessionId: string;
			paymentStatus: string;
	  }
	| {
			kind: "validated";
			sessionId: string;
	  };

type CheckoutProgressState = "complete" | "active" | "pending";

type CheckoutProgressStep = {
	label: string;
	state: CheckoutProgressState;
	detail: string;
};

function CheckoutProgress({
	steps,
}: {
	steps: readonly CheckoutProgressStep[];
}) {
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

function getCheckoutHelpContent(
	checkoutSessionState: CheckoutSessionState,
	isAccessReady: boolean,
) {
	switch (checkoutSessionState.kind) {
		case "validated":
			return isAccessReady
				? {
						title: "Access confirmed",
						leadCopy:
							"Your purchase and entitlement are both confirmed. The next step is just getting you into the workspace.",
						items: [
							"Use Open mission if the redirect has not fired yet.",
							"Use Check access only if you want to force one more lookup.",
							"Keep this tab if you want a clean post-purchase handoff.",
						],
					}
				: {
						title: "What happens next",
						leadCopy:
							"Stripe is done. This page is polling your account access and will forward you automatically once the entitlement lands.",
						items: [
							"Keep this tab open for a few seconds while the access grant catches up.",
							"If you signed in with a different email, fix that first before retrying.",
							"Use Check access if the handoff feels stalled.",
						],
					};
		case "sign_in_required":
			return {
				title: "Use the checkout account",
				leadCopy:
					"This browser is not signed in, so we cannot attach the completed checkout to an account yet.",
				items: [
					"Sign in with the same email you used during payment.",
					"Return to this tab after sign-in so the access handoff can finish.",
					"Do not start a second checkout unless payment actually failed.",
				],
			};
		case "wrong_account":
			return {
				title: "Account mismatch",
				leadCopy:
					"The purchase exists, but it belongs to a different signed-in account than the one currently open here.",
				items: [
					"Switch to the email used at checkout.",
					"Then use Check access to retry the entitlement lookup.",
					"Open mission only after the correct account is attached.",
				],
			};
		case "payment_pending":
			return {
				title: "Waiting on Stripe",
				leadCopy:
					"The success URL resolved, but Stripe still has the payment in a non-final state.",
				items: [
					"Give Stripe another moment to settle the payment.",
					"Come back to this page from the same browser after payment confirms.",
					"Do not retry checkout unless Stripe shows the payment failed.",
				],
			};
		case "invalid_session":
			return {
				title: "Session could not be verified",
				leadCopy:
					"This URL does not include a Stripe session we can trust for the access handoff.",
				items: [
					"Return to checkout from the offer page if you still need to buy.",
					"Use Check access if you already paid in this account.",
					"Keep the success URL intact when testing the live handoff.",
				],
			};
		default:
			return {
				title: "No checkout session attached",
				leadCopy:
					"This page works as a recovery surface, but it is strongest when it arrives directly from Stripe.",
				items: [
					"Use Check access if you already completed purchase on this account.",
					"Return home if you still need to start checkout.",
					"Keep the same browser session for the cleanest handoff.",
				],
			};
	}
}

function getCheckoutSessionCopy(
	checkoutSessionState: CheckoutSessionState,
	isAccessReady: boolean,
	statusCopy: string[],
	statusIndex: number,
) {
	switch (checkoutSessionState.kind) {
		case "validated":
			return {
				shellTitle: "Payment received",
				shellSubtitle: "We’re unlocking your Ship by Sunday access now.",
				statusLabel: isAccessReady ? "Access ready" : statusCopy[statusIndex],
				heading: isAccessReady ? "Opening mission" : "Finalizing access",
				body: isAccessReady
					? "Your access is live. Sending you into Ship by Sunday now."
					: "This page will send you into Ship by Sunday automatically as soon as access is ready. If it takes longer than a few seconds, use one of the buttons below.",
				progressSteps: [
					{
						label: "Payment confirmed",
						state: "complete" as const,
						detail: "Stripe marked the checkout as paid.",
					},
					{
						label: "Access handoff",
						state: isAccessReady ? ("complete" as const) : ("active" as const),
						detail: isAccessReady
							? "Entitlement is attached to this account."
							: "We are polling for the access grant now.",
					},
					{
						label: "Open mission",
						state: isAccessReady ? ("active" as const) : ("pending" as const),
						detail: isAccessReady
							? "Redirect is ready."
							: "Mission opens once access confirms.",
					},
				],
			};
		case "sign_in_required":
			return {
				shellTitle: "Finish access handoff",
				shellSubtitle:
					"Sign in with the same account you used at checkout so we can attach access.",
				statusLabel: "Sign in required",
				heading: "Sign in to continue",
				body: "We found the checkout session, but this browser is not signed in. Use the same email you used during checkout, then we can finish the access handoff.",
				progressSteps: [
					{
						label: "Checkout found",
						state: "complete" as const,
						detail: "We located the Stripe session from this success URL.",
					},
					{
						label: "Sign in",
						state: "active" as const,
						detail: "Use the same email used during checkout.",
					},
					{
						label: "Unlock access",
						state: "pending" as const,
						detail: "Entitlement attaches after account auth.",
					},
				],
			};
		case "wrong_account":
			return {
				shellTitle: "Wrong account for this checkout",
				shellSubtitle:
					"This browser is signed into a different account than the one used at checkout.",
				statusLabel: "Account mismatch",
				heading: "Use the checkout account",
				body: "The checkout session belongs to a different Clerk account. Sign in with the same email you used during payment, then retry this page or open access check.",
				progressSteps: [
					{
						label: "Checkout found",
						state: "complete" as const,
						detail: "The payment session exists and looks valid.",
					},
					{
						label: "Account match",
						state: "active" as const,
						detail: "Switch to the email used at checkout.",
					},
					{
						label: "Unlock access",
						state: "pending" as const,
						detail: "Access can only attach after the account matches.",
					},
				],
			};
		case "payment_pending":
			return {
				shellTitle: "Payment still processing",
				shellSubtitle:
					"We found the checkout session, but Stripe has not marked payment complete yet.",
				statusLabel: `Payment status: ${checkoutSessionState.paymentStatus}`,
				heading: "Payment pending",
				body: "Stripe has not finalized this payment yet. Wait for payment confirmation, then return here to finish the access handoff.",
				progressSteps: [
					{
						label: "Checkout found",
						state: "complete" as const,
						detail: "The Stripe session was located successfully.",
					},
					{
						label: "Payment confirm",
						state: "active" as const,
						detail: "Stripe has not finalized this payment yet.",
					},
					{
						label: "Unlock access",
						state: "pending" as const,
						detail: "Entitlement waits for Stripe confirmation.",
					},
				],
			};
		case "invalid_session":
			return {
				shellTitle: "Checkout session not found",
				shellSubtitle:
					"We could not verify the Stripe checkout session attached to this URL.",
				statusLabel: "Session invalid",
				heading: "Unable to confirm payment",
				body: "This page needs a valid Stripe success URL to confirm payment. If you already bought access, open access check from the same account used at checkout.",
				progressSteps: [
					{
						label: "Checkout found",
						state: "active" as const,
						detail: "This URL did not resolve to a valid Stripe session.",
					},
					{
						label: "Access handoff",
						state: "pending" as const,
						detail: "We need a verified checkout session first.",
					},
					{
						label: "Open mission",
						state: "pending" as const,
						detail: "Mission stays locked until purchase is confirmed.",
					},
				],
			};
		default:
			return {
				shellTitle: "Complete your access check",
				shellSubtitle:
					"This page works best when you arrive from Stripe with a checkout session attached.",
				statusLabel: "Missing checkout session",
				heading: "Verify access",
				body: "If you already bought access, use access check from the same signed-in account. Otherwise, return home and start checkout again.",
				progressSteps: [
					{
						label: "Checkout found",
						state: "pending" as const,
						detail: "No Stripe session is attached to this URL.",
					},
					{
						label: "Access handoff",
						state: "pending" as const,
						detail: "Use access check if you already paid.",
					},
					{
						label: "Open mission",
						state: "pending" as const,
						detail: "Start checkout first if access has not been purchased.",
					},
				],
			};
	}
}

export function CheckoutSuccessView({
	checkoutSessionState,
}: {
	checkoutSessionState: CheckoutSessionState;
}) {
	const router = useRouter();
	const { isAuthenticated } = useConvexAuth();
	const [statusIndex, setStatusIndex] = useState(0);
	const access = useQuery(
		api.course.viewerAccess,
		isAuthenticated ? {} : "skip",
	) as
		| {
				hasAccess: boolean;
				status: string;
		  }
		| undefined;
	const isAccessReady = Boolean(access?.hasAccess);
	const statusCopy = [
		"Confirming your entitlement.",
		"Unlocking your Ship by Sunday workspace.",
		"Preparing your first mission step.",
	];
	const canAutoRedirect =
		checkoutSessionState.kind === "validated" && isAccessReady;
	const sessionCopy = getCheckoutSessionCopy(
		checkoutSessionState,
		isAccessReady,
		statusCopy,
		statusIndex,
	);
	const signInHref =
		checkoutSessionState.kind === "sign_in_required"
			? getSignInRedirectHref(
					getCheckoutSuccessHref(checkoutSessionState.sessionId),
				)
			: getSignInRedirectHref(routeConfig.checkoutSuccess);
	const helpContent = getCheckoutHelpContent(
		checkoutSessionState,
		isAccessReady,
	);
	const primaryActionLabel =
		checkoutSessionState.kind === "sign_in_required"
			? "Sign in"
			: "Open mission";
	const primaryActionHref =
		checkoutSessionState.kind === "sign_in_required"
			? signInHref
			: routeConfig.mission;
	const primaryActionBody =
		checkoutSessionState.kind === "sign_in_required"
			? "Use the exact email from checkout so we can attach the purchase to the right account."
			: canAutoRedirect
				? "Your access is ready. Open the workspace now if you do not want to wait for the redirect."
				: "If the handoff already finished in the background, this will take you into Ship by Sunday. Otherwise you will land on the access check surface.";
	const secondaryActionBody =
		checkoutSessionState.kind === "wrong_account"
			? "Use this after switching accounts to retry the entitlement lookup."
			: "Use this if the handoff feels stalled, or if you need to re-check access manually.";
	const primaryButtonClassName =
		"sbs-hover-lift sbs-press-feedback inline-flex min-w-[12rem] justify-center rounded-none border border-product-accent bg-product-accent/10 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-product-accent transition-colors hover:bg-product-accent hover:text-product-bg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-product-accent";
	const secondaryButtonClassName =
		"sbs-hover-lift sbs-press-feedback inline-flex min-w-[11rem] justify-center rounded-none border border-product-border bg-product-surface px-4 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-product-text transition-colors hover:bg-product-surface-alt focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-product-accent";

	useEffect(() => {
		if (!canAutoRedirect) {
			return;
		}

		const timeout = window.setTimeout(() => {
			router.replace(routeConfig.mission);
		}, timingConfig.checkoutAutoRedirectMs);

		return () => window.clearTimeout(timeout);
	}, [canAutoRedirect, router]);

	useEffect(() => {
		if (checkoutSessionState.kind !== "validated" || isAccessReady) {
			return;
		}

		const interval = window.setInterval(() => {
			setStatusIndex((current) => (current + 1) % statusCopy.length);
		}, timingConfig.checkoutStatusRotateMs);

		return () => window.clearInterval(interval);
	}, [checkoutSessionState.kind, isAccessReady, statusCopy.length]);

	return (
		<ProductShell
			title={sessionCopy.shellTitle}
			subtitle={sessionCopy.shellSubtitle}
		>
			<section className="relative mx-auto w-full max-w-6xl overflow-hidden border border-product-border/70 bg-product-surface/80 p-5 shadow-panel backdrop-blur-xl sm:p-7">
				<div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-product-accent/10 to-transparent" />
				<div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_17rem]">
					<div>
						<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
							Checkout status
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
										canAutoRedirect
											? "bg-product-text"
											: "bg-product-accent/80 motion-safe:animate-pulse"
									}`}
									aria-hidden="true"
								/>
								{sessionCopy.statusLabel}
							</div>
							<span className="border border-product-border/45 bg-product-surface px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-product-muted">
								{canAutoRedirect ? "Redirect armed" : "Polling access"}
							</span>
							<span className="border border-product-border/45 bg-product-surface px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-product-muted">
								Manual recovery available
							</span>
						</div>
						<h1 className="mt-4 max-w-3xl text-balance font-display text-3xl uppercase leading-none tracking-[0.08em] text-product-text sm:text-4xl">
							{sessionCopy.heading}
						</h1>
						<p className="mt-4 max-w-2xl text-sm leading-relaxed text-product-muted">
							{sessionCopy.body}
						</p>
						<CheckoutProgress steps={sessionCopy.progressSteps} />
						<div className="mt-7 border border-product-border/55 bg-product-surface-strong/72 p-4">
							<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted">
								Next step
							</p>
							<p className="mt-3 max-w-2xl text-sm leading-relaxed text-product-text">
								{primaryActionBody}
							</p>
							<div className="mt-4 flex flex-wrap gap-2.5">
								<Link
									href={primaryActionHref}
									className={primaryButtonClassName}
								>
									{primaryActionLabel}
								</Link>
								<Link
									href={routeConfig.accessRequired}
									className={secondaryButtonClassName}
								>
									Check access
								</Link>
								<Link
									href={routeConfig.home}
									className={secondaryButtonClassName}
								>
									Go home
								</Link>
							</div>
							<p className="mt-3 text-[11px] leading-relaxed text-product-muted">
								{secondaryActionBody}
							</p>
						</div>
					</div>
					<aside className="h-fit border border-product-border/55 bg-product-surface-strong/72 p-4">
						<p className="font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted">
							{helpContent.title}
						</p>
						<p className="mt-3 text-sm leading-relaxed text-product-text">
							{helpContent.leadCopy}
						</p>
						<ul className="mt-4 space-y-2.5">
							{helpContent.items.map((item) => (
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
				</div>
			</section>
		</ProductShell>
	);
}
