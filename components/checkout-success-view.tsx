"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useConvexAuth, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { ProductShell } from "@/components/product-shell";
import type { ProductTheme } from "@/lib/product-theme";

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

type SuccessStepState = "complete" | "active" | "pending";

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
					},
					{
						label: "Access handoff",
						state: isAccessReady ? ("complete" as const) : ("active" as const),
					},
					{
						label: "Open mission",
						state: isAccessReady ? ("active" as const) : ("pending" as const),
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
					},
					{
						label: "Sign in",
						state: "active" as const,
					},
					{
						label: "Unlock access",
						state: "pending" as const,
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
					},
					{
						label: "Account match",
						state: "active" as const,
					},
					{
						label: "Unlock access",
						state: "pending" as const,
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
					},
					{
						label: "Payment confirm",
						state: "active" as const,
					},
					{
						label: "Unlock access",
						state: "pending" as const,
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
					},
					{
						label: "Access handoff",
						state: "pending" as const,
					},
					{
						label: "Open mission",
						state: "pending" as const,
					},
				],
			};
		case "missing_session_id":
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
					},
					{
						label: "Access handoff",
						state: "pending" as const,
					},
					{
						label: "Open mission",
						state: "pending" as const,
					},
				],
			};
	}
}

export function CheckoutSuccessView({
	initialTheme,
	checkoutSessionState,
}: {
	initialTheme: ProductTheme;
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
			? `/sign-in?redirect_url=${encodeURIComponent(
					`/checkout/success?session_id=${checkoutSessionState.sessionId}`,
				)}`
			: "/sign-in?redirect_url=%2Fcheckout%2Fsuccess";

	useEffect(() => {
		if (!canAutoRedirect) {
			return;
		}

		const timeout = window.setTimeout(() => {
			router.replace("/mission");
		}, 700);

		return () => window.clearTimeout(timeout);
	}, [canAutoRedirect, router]);

	useEffect(() => {
		if (checkoutSessionState.kind !== "validated" || isAccessReady) {
			return;
		}

		const interval = window.setInterval(() => {
			setStatusIndex((current) => (current + 1) % statusCopy.length);
		}, 1600);

		return () => window.clearInterval(interval);
	}, [checkoutSessionState.kind, isAccessReady, statusCopy.length]);

	return (
		<ProductShell
			initialTheme={initialTheme}
			title={sessionCopy.shellTitle}
			subtitle={sessionCopy.shellSubtitle}
		>
			<section className="border border-line bg-white p-6 shadow-card">
				<p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/60">
					Checkout status
				</p>
				<div
					className="mt-4 inline-flex items-center gap-2 border border-line bg-paper/80 px-3 py-2 font-sans text-xs font-semibold uppercase tracking-[0.16em] text-ink/70"
					role="status"
					aria-live="polite"
					aria-atomic="true"
				>
					<span
						className={`inline-flex size-2.5 rounded-full ${
							canAutoRedirect ? "bg-ink" : "bg-ink/55 motion-safe:animate-pulse"
						}`}
						aria-hidden="true"
					/>
					{sessionCopy.statusLabel}
				</div>
				<p className="mt-4 font-display text-4xl uppercase leading-none tracking-[0.04em]">
					{sessionCopy.heading}
				</p>
				<p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-ink/75">
					{sessionCopy.body}
				</p>
				<div className="mt-6 grid gap-[1px] border border-line bg-line sm:grid-cols-3">
					{sessionCopy.progressSteps.map((step) => (
						<div
							key={step.label}
							className="bg-white px-4 py-3 transition-colors duration-200 ease-out motion-reduce:transition-none"
						>
							<div className="flex items-center gap-2">
								<span
									className={`inline-flex size-2.5 rounded-full transition-colors duration-200 ease-out motion-reduce:transition-none ${
										step.state === "complete"
											? "bg-ink"
											: step.state === "active"
												? "bg-ink/55 motion-safe:animate-pulse"
												: "bg-ink/15"
									}`}
									aria-hidden="true"
								/>
								<p className="text-xs font-bold uppercase tracking-[0.14em] text-ink/80">
									{step.label}
								</p>
							</div>
						</div>
					))}
				</div>
				<div className="mt-6 flex flex-wrap gap-3">
					{checkoutSessionState.kind === "sign_in_required" ? (
						<Link
							href={signInHref}
							className="sbs-hover-lift sbs-press-feedback inline-flex border border-line bg-ink px-4 py-3 font-display text-2xl uppercase tracking-[0.04em] text-paper"
						>
							Sign in
						</Link>
					) : null}
					<Link
						href="/mission"
						className="sbs-hover-lift sbs-press-feedback inline-flex border border-line bg-ink px-4 py-3 font-display text-2xl uppercase tracking-[0.04em] text-paper"
					>
						Open mission
					</Link>
					<Link
						href="/access-required"
						className="sbs-hover-lift sbs-press-feedback inline-flex border border-line bg-white px-4 py-3 font-display text-2xl uppercase tracking-[0.04em] text-ink"
					>
						Check access
					</Link>
					<Link
						href="/"
						className="sbs-hover-lift sbs-press-feedback inline-flex border border-line bg-white px-4 py-3 font-display text-2xl uppercase tracking-[0.04em] text-ink"
					>
						Go home
					</Link>
				</div>
			</section>
		</ProductShell>
	);
}
