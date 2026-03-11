"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { CheckoutButton } from "@/components/checkout-button";
import { ProductShell } from "@/components/product-shell";
import type { ProductTheme } from "@/lib/product-theme";

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
		},
		{
			label: "Check purchase",
			state: isCheckingAccess ? "active" : "complete",
		},
		{
			label: isCheckingAccess ? "Waiting on access" : "Choose next step",
			state: isCheckingAccess ? "pending" : "active",
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
		>
			<section className="rounded-none border border-product-border bg-product-surface/78 p-6 shadow-panel backdrop-blur-xl">
				<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
					Account access
				</p>
				<div
					className="mt-4 inline-flex items-center gap-2 border border-product-border bg-product-surface-strong/80 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted"
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
				<p className="mt-3 font-display text-4xl uppercase leading-none tracking-[0.08em] text-product-text">
					{title}
				</p>
				<p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-product-muted">
					{helperCopy}
				</p>
				<div className="mt-6 grid gap-[1px] border border-product-border/60 bg-product-border/60 sm:grid-cols-3">
					{progressSteps.map((step) => (
						<div
							key={step.label}
							className="bg-product-surface px-3 py-3 transition-colors duration-200 ease-out motion-reduce:transition-none"
						>
							<div className="flex items-center gap-2">
								<span
									className={`inline-flex size-2 rounded-full transition-colors duration-200 ease-out motion-reduce:transition-none ${
										step.state === "complete"
											? "bg-product-text"
											: step.state === "active"
												? "bg-product-accent/70 motion-safe:animate-pulse"
												: "bg-product-border/25"
									}`}
									aria-hidden="true"
								/>
								<p className="font-mono text-[9px] uppercase tracking-[0.16em] text-product-text">
									{step.label}
								</p>
							</div>
						</div>
					))}
				</div>

				<div
					className={`mt-6 flex flex-wrap gap-3 transition-all duration-200 ease-out motion-reduce:transition-none ${
						isCheckingAccess
							? "translate-y-[4px] opacity-70"
							: "translate-y-0 opacity-100"
					}`}
				>
					{!isCheckingAccess ? (
						<CheckoutButton
							label="Get instant access"
							className="sbs-hover-lift inline-flex rounded-none border border-product-accent bg-product-chip px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-product-accent hover:bg-product-accent hover:text-product-bg"
						/>
					) : null}
					<Link
						href="/mission"
						className="sbs-hover-lift sbs-press-feedback inline-flex rounded-none border border-product-border bg-product-surface px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-product-text hover:bg-product-surface-alt"
					>
						Open mission
					</Link>
					<Link
						href="/"
						className="sbs-hover-lift sbs-press-feedback inline-flex rounded-none border border-product-border bg-product-surface px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-product-text hover:bg-product-surface-alt"
					>
						Back home
					</Link>
				</div>
			</section>
		</ProductShell>
	);
}
