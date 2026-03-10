"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { CheckoutButton } from "@/components/checkout-button";
import { ProductShell } from "@/components/product-shell";

export function AccessRequiredPage() {
	const router = useRouter();
	const access = useQuery(api.course.viewerAccess) as
		| {
				clerkUserId: string | null;
				hasAccess: boolean;
				status: string;
		  }
		| undefined;

	useEffect(() => {
		if (access?.hasAccess) {
			router.replace("/mission");
		}
	}, [access, router]);

	return (
		<ProductShell
			title="Access Required"
			subtitle="You are signed in, but this account does not have an active Ship by Sunday entitlement yet."
		>
			<section className="rounded-none border border-product-border bg-product-surface/78 p-6 shadow-panel backdrop-blur-xl">
				<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
					Account state
				</p>
				<p className="mt-3 font-display text-4xl uppercase leading-none tracking-[0.08em] text-product-text">
					{access?.status ?? "Checking"}
				</p>
				<p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-product-muted">
					The auth flow is live, but paid access is still granted through the
					Convex entitlement layer. Until Stripe is wired, use an active
					entitlement record for your Clerk user to unlock the product shell.
				</p>
				{access?.clerkUserId ? (
					<div className="mt-5 rounded-none border border-product-border bg-product-surface-strong/80 p-4">
						<p className="font-mono text-[10px] uppercase tracking-[0.22em] text-product-muted">
							Clerk user id
						</p>
						<p className="mt-2 break-all font-mono text-sm text-product-text">
							{access.clerkUserId}
						</p>
					</div>
				) : null}

				<div className="mt-6 flex flex-wrap gap-3">
					<CheckoutButton
						label="Buy access"
						className="inline-flex rounded-none border border-product-accent bg-product-chip px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-product-accent transition-colors hover:bg-product-accent hover:text-product-bg"
					/>
					<Link
						href="/"
						className="inline-flex rounded-none border border-product-border bg-product-surface px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-product-text transition-colors hover:bg-product-surface-alt"
					>
						Back home
					</Link>
				</div>
			</section>
		</ProductShell>
	);
}
