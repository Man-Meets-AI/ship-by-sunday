"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useConvexAuth, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { ProductShell } from "@/components/product-shell";
import type { ProductTheme } from "@/lib/product-theme";

export function CheckoutSuccessView({
	initialTheme,
}: {
	initialTheme: ProductTheme;
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
	const progressSteps = [
		{
			label: "Payment confirmed",
			state: "complete",
		},
		{
			label: "Access handoff",
			state: isAccessReady ? "complete" : "active",
		},
		{
			label: "Open mission",
			state: isAccessReady ? "active" : "pending",
		},
	] as const;

	useEffect(() => {
		if (!isAccessReady) {
			return;
		}

		const timeout = window.setTimeout(() => {
			router.replace("/mission");
		}, 700);

		return () => window.clearTimeout(timeout);
	}, [isAccessReady, router]);

	useEffect(() => {
		if (isAccessReady) {
			return;
		}

		const interval = window.setInterval(() => {
			setStatusIndex((current) => (current + 1) % statusCopy.length);
		}, 1600);

		return () => window.clearInterval(interval);
	}, [isAccessReady, statusCopy.length]);

	return (
		<ProductShell
			initialTheme={initialTheme}
			title="Payment received"
			subtitle="We’re unlocking your Ship by Sunday access now."
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
							isAccessReady ? "bg-ink" : "bg-ink/55 motion-safe:animate-pulse"
						}`}
						aria-hidden="true"
					/>
					{isAccessReady ? "Access ready" : statusCopy[statusIndex]}
				</div>
				<p className="mt-4 font-display text-4xl uppercase leading-none tracking-[0.04em]">
					{isAccessReady ? "Opening mission" : "Finalizing access"}
				</p>
				<p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-ink/75">
					{isAccessReady
						? "Your access is live. Sending you into Ship by Sunday now."
						: "This page will send you into Ship by Sunday automatically as soon as access is ready. If it takes longer than a few seconds, use one of the buttons below."}
				</p>
				<div className="mt-6 grid gap-[1px] border border-line bg-line sm:grid-cols-3">
					{progressSteps.map((step) => (
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
				</div>
			</section>
		</ProductShell>
	);
}
