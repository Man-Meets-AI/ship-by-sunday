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
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { assertNever } from "@/features/course/lesson/lib/assert";
import { AppShell } from "@/features/course/shared/components/app-shell";
import type { CheckoutSessionState } from "@/features/checkout/server/checkout-session";

type CheckoutProgressState = "complete" | "active" | "pending";

type CheckoutProgressStep = {
	label: string;
	state: CheckoutProgressState;
	detail: string;
};

type CheckoutViewModel = {
	shellTitle: string;
	shellSubtitle: string;
	statusLabel: string;
	heading: string;
	body: string;
	progressSteps: readonly CheckoutProgressStep[];
	helpTitle: string;
	helpLeadCopy: string;
	helpItems: readonly string[];
	primaryActionLabel: string;
	primaryActionHref: string;
	primaryActionBody: string;
	secondaryActionBody: string;
};

const validatedStatusCopy = [
	"Confirming your product access.",
	"Unlocking your Ship by Sunday workspace.",
	"Preparing your first mission step.",
] as const;

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
					? "border-primary/50 bg-primary/5"
					: isComplete
						? "border-border bg-card"
						: "border-border bg-muted/30";
				const dotClassName = isComplete
					? "bg-foreground"
					: isActive
						? "bg-primary motion-safe:animate-pulse"
						: "bg-muted-foreground/50";
				const detailClassName = isActive
					? "text-foreground"
					: "text-muted-foreground";

				return (
					<div
						key={step.label}
						className={`rounded-lg border px-3 py-3 shadow-sm transition-colors duration-200 ease-out motion-reduce:transition-none ${stepClassName}`}
					>
						<div className="flex items-center justify-between gap-2">
							<p className="text-xs font-medium uppercase tracking-wide text-foreground">
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

function getCheckoutViewModel(
	checkoutSessionState: CheckoutSessionState,
	isAccessReady: boolean,
	validatedStatusLabel: string,
): CheckoutViewModel {
	switch (checkoutSessionState.kind) {
		case "validated":
			return {
				shellTitle: "Payment received",
				shellSubtitle: "We’re unlocking your Ship by Sunday access now.",
				statusLabel: isAccessReady ? "Access ready" : validatedStatusLabel,
				heading: isAccessReady ? "Opening mission" : "Finalizing access",
				body: isAccessReady
					? "Your access is live. Sending you into Ship by Sunday now."
					: "This page will send you into Ship by Sunday automatically as soon as access is ready. If it takes longer than a few seconds, use one of the buttons below.",
				progressSteps: [
					{
						label: "Payment confirmed",
						state: "complete",
						detail: "Stripe marked the checkout as paid.",
					},
					{
						label: "Access handoff",
						state: isAccessReady ? "complete" : "active",
						detail: isAccessReady
							? "Product access is attached to this account."
							: "We are polling for the access grant now.",
					},
					{
						label: "Open mission",
						state: isAccessReady ? "active" : "pending",
						detail: isAccessReady
							? "Redirect is ready."
							: "Mission opens once access confirms.",
					},
				],
				helpTitle: isAccessReady ? "Access confirmed" : "What happens next",
				helpLeadCopy: isAccessReady
					? "Your purchase and product access are both confirmed. The next step is just getting you into the workspace."
					: "Stripe is done. This page is polling your account access and will forward you automatically once the product access is ready.",
				helpItems: isAccessReady
					? [
							"Use Open mission if the redirect has not fired yet.",
							"Use Check access only if you want to force one more lookup.",
							"Keep this tab if you want a clean post-purchase handoff.",
						]
					: [
							"Keep this tab open for a few seconds while the access grant catches up.",
							"If you signed in with a different email, fix that first before retrying.",
							"Use Check access if the handoff feels stalled.",
						],
				primaryActionLabel: "Open mission",
				primaryActionHref: routeConfig.mission,
				primaryActionBody: isAccessReady
					? "Your access is ready. Open the workspace now if you do not want to wait for the redirect."
					: "If the handoff already finished in the background, this will take you into Ship by Sunday. Otherwise you will land on the access check surface.",
				secondaryActionBody:
					"Use this if the handoff feels stalled, or if you need to re-check access manually.",
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
						state: "complete",
						detail: "We located the Stripe session from this success URL.",
					},
					{
						label: "Sign in",
						state: "active",
						detail: "Use the same email used during checkout.",
					},
					{
						label: "Unlock access",
						state: "pending",
						detail: "Product access attaches after account auth.",
					},
				],
				helpTitle: "Use the checkout account",
				helpLeadCopy:
					"This browser is not signed in, so we cannot attach the completed checkout to an account yet.",
				helpItems: [
					"Sign in with the same email you used during payment.",
					"Return to this tab after sign-in so the access handoff can finish.",
					"Do not start a second checkout unless payment actually failed.",
				],
				primaryActionLabel: "Sign in",
				primaryActionHref: getSignInRedirectHref(
					getCheckoutSuccessHref(checkoutSessionState.sessionId),
				),
				primaryActionBody:
					"Use the exact email from checkout so we can attach the purchase to the right account.",
				secondaryActionBody:
					"Use this if the handoff feels stalled, or if you need to re-check access manually.",
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
						state: "complete",
						detail: "The payment session exists and looks valid.",
					},
					{
						label: "Account match",
						state: "active",
						detail: "Switch to the email used at checkout.",
					},
					{
						label: "Unlock access",
						state: "pending",
						detail: "Access can only attach after the account matches.",
					},
				],
				helpTitle: "Account mismatch",
				helpLeadCopy:
					"The purchase exists, but it belongs to a different signed-in account than the one currently open here.",
				helpItems: [
					"Switch to the email used at checkout.",
					"Then use Check access to retry the product access check.",
					"Open mission only after the correct account is attached.",
				],
				primaryActionLabel: "Open mission",
				primaryActionHref: routeConfig.mission,
				primaryActionBody:
					"If the handoff already finished in the background, this will take you into Ship by Sunday. Otherwise you will land on the access check surface.",
				secondaryActionBody:
					"Use this after switching accounts to retry the product access check.",
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
						state: "complete",
						detail: "The Stripe session was located successfully.",
					},
					{
						label: "Payment confirm",
						state: "active",
						detail: "Stripe has not finalized this payment yet.",
					},
					{
						label: "Unlock access",
						state: "pending",
						detail: "Product access waits for Stripe confirmation.",
					},
				],
				helpTitle: "Waiting on Stripe",
				helpLeadCopy:
					"The success URL resolved, but Stripe still has the payment in a non-final state.",
				helpItems: [
					"Give Stripe another moment to settle the payment.",
					"Come back to this page from the same browser after payment confirms.",
					"Do not retry checkout unless Stripe shows the payment failed.",
				],
				primaryActionLabel: "Open mission",
				primaryActionHref: routeConfig.mission,
				primaryActionBody:
					"If the handoff already finished in the background, this will take you into Ship by Sunday. Otherwise you will land on the access check surface.",
				secondaryActionBody:
					"Use this if the handoff feels stalled, or if you need to re-check access manually.",
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
						state: "active",
						detail: "This URL did not resolve to a valid Stripe session.",
					},
					{
						label: "Access handoff",
						state: "pending",
						detail: "We need a verified checkout session first.",
					},
					{
						label: "Open mission",
						state: "pending",
						detail: "Mission stays locked until purchase is confirmed.",
					},
				],
				helpTitle: "Session could not be verified",
				helpLeadCopy:
					"This URL does not include a Stripe session we can trust for the access handoff.",
				helpItems: [
					"Return to checkout from the offer page if you still need to buy.",
					"Use Check access if you already paid in this account.",
					"Keep the success URL intact when testing the live handoff.",
				],
				primaryActionLabel: "Open mission",
				primaryActionHref: routeConfig.mission,
				primaryActionBody:
					"If the handoff already finished in the background, this will take you into Ship by Sunday. Otherwise you will land on the access check surface.",
				secondaryActionBody:
					"Use this if the handoff feels stalled, or if you need to re-check access manually.",
			};
		case "missing_session_id":
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
						state: "pending",
						detail: "No Stripe session is attached to this URL.",
					},
					{
						label: "Access handoff",
						state: "pending",
						detail: "Use access check if you already paid.",
					},
					{
						label: "Open mission",
						state: "pending",
						detail: "Start checkout first if access has not been purchased.",
					},
				],
				helpTitle: "No checkout session attached",
				helpLeadCopy:
					"This page works as a recovery surface, but it is strongest when it arrives directly from Stripe.",
				helpItems: [
					"Use Check access if you already completed purchase on this account.",
					"Return home if you still need to start checkout.",
					"Keep the same browser session for the cleanest handoff.",
				],
				primaryActionLabel: "Open mission",
				primaryActionHref: routeConfig.mission,
				primaryActionBody:
					"If the handoff already finished in the background, this will take you into Ship by Sunday. Otherwise you will land on the access check surface.",
				secondaryActionBody:
					"Use this if the handoff feels stalled, or if you need to re-check access manually.",
			};
	}

	return assertNever(checkoutSessionState, "Unhandled checkout session state");
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
		api.access.viewerProductAccess,
		isAuthenticated ? {} : "skip",
	) as
		| {
				hasAccess: boolean;
		  }
		| undefined;
	const isAccessReady = Boolean(access?.hasAccess);
	const canAutoRedirect =
		checkoutSessionState.kind === "validated" && isAccessReady;
	const viewModel = getCheckoutViewModel(
		checkoutSessionState,
		isAccessReady,
		validatedStatusCopy[statusIndex],
	);

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
			setStatusIndex((current) => (current + 1) % validatedStatusCopy.length);
		}, timingConfig.checkoutStatusRotateMs);

		return () => window.clearInterval(interval);
	}, [checkoutSessionState.kind, isAccessReady]);

	return (
		<AppShell title={viewModel.shellTitle} subtitle={viewModel.shellSubtitle}>
			<section className="mx-auto w-full max-w-6xl rounded-xl border bg-card p-6 shadow-sm sm:p-8">
				<div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_17rem]">
					<div>
						<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							Checkout status
						</p>
						<div className="mt-4 flex flex-wrap items-center gap-2">
							<div
								className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground"
								role="status"
								aria-live="polite"
								aria-atomic="true"
							>
								<span
									className={`inline-flex size-2.5 rounded-full ${
										canAutoRedirect
											? "bg-foreground"
											: "bg-primary motion-safe:animate-pulse"
									}`}
									aria-hidden="true"
								/>
								{viewModel.statusLabel}
							</div>
							<span className="rounded-full border bg-background px-2 py-1 text-xs text-muted-foreground">
								{canAutoRedirect ? "Redirect armed" : "Polling access"}
							</span>
							<span className="rounded-full border bg-background px-2 py-1 text-xs text-muted-foreground">
								Manual recovery available
							</span>
						</div>
						<h1 className="mt-4 max-w-3xl text-balance text-3xl font-semibold text-foreground sm:text-4xl">
							{viewModel.heading}
						</h1>
						<p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
							{viewModel.body}
						</p>
						<CheckoutProgress steps={viewModel.progressSteps} />
						<div className="mt-7 rounded-lg border bg-muted/30 p-4 shadow-sm">
							<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
								Next step
							</p>
							<p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground">
								{viewModel.primaryActionBody}
							</p>
							<div className="mt-4 flex flex-wrap gap-2.5">
								<Button asChild className="min-w-[12rem] justify-center">
									<Link href={viewModel.primaryActionHref}>
										{viewModel.primaryActionLabel}
									</Link>
								</Button>
								<Button
									asChild
									variant="outline"
									className="min-w-[11rem] justify-center"
								>
									<Link href={routeConfig.accessRequired}>Check access</Link>
								</Button>
								<Button
									asChild
									variant="outline"
									className="min-w-[11rem] justify-center"
								>
									<Link href={routeConfig.home}>Go home</Link>
								</Button>
							</div>
							<p className="mt-3 text-xs leading-relaxed text-muted-foreground">
								{viewModel.secondaryActionBody}
							</p>
						</div>
					</div>
					<aside className="h-fit rounded-lg border bg-muted/30 p-4 shadow-sm">
						<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
							{viewModel.helpTitle}
						</p>
						<p className="mt-3 text-sm leading-relaxed text-foreground">
							{viewModel.helpLeadCopy}
						</p>
						<ul className="mt-4 space-y-2.5">
							{viewModel.helpItems.map((item) => (
								<li key={item} className="flex items-start gap-2">
									<span
										className="mt-1 inline-flex size-1.5 shrink-0 rounded-full bg-primary"
										aria-hidden="true"
									/>
									<span className="text-xs leading-relaxed text-muted-foreground">
										{item}
									</span>
								</li>
							))}
						</ul>
					</aside>
				</div>
			</section>
		</AppShell>
	);
}
