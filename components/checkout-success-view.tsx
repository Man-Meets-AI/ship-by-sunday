"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useConvexAuth, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { ProductShell } from "@/components/product-shell";

export function CheckoutSuccessView() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { isAuthenticated } = useConvexAuth();
	const access = useQuery(
		api.course.viewerAccess,
		isAuthenticated ? {} : "skip",
	) as
		| {
				hasAccess: boolean;
				status: string;
		  }
		| undefined;
	const sessionId = searchParams.get("session_id");

	useEffect(() => {
		if (access?.hasAccess) {
			router.replace("/mission");
		}
	}, [access, router]);

	return (
		<ProductShell
			title="Payment received"
			subtitle="Stripe sent the buyer back. We’re finalizing access now."
		>
			<section className="border border-line bg-white p-6 shadow-card">
				<p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/60">
					Checkout status
				</p>
				<p className="mt-3 font-display text-4xl uppercase leading-none tracking-[0.04em]">
					{access?.hasAccess ? "Access ready" : "Finalizing access"}
				</p>
				<p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-ink/75">
					If the Stripe webhook has already granted your entitlement, this page
					will send you into the course automatically. If it takes longer than a
					few seconds, use the mission button below.
				</p>
				{sessionId ? (
					<div className="mt-5 border border-line bg-paper p-4">
						<p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/55">
							Checkout session
						</p>
						<p className="mt-2 break-all font-mono text-sm text-ink">
							{sessionId}
						</p>
					</div>
				) : null}
				<div className="mt-6 flex flex-wrap gap-3">
					<Link
						href="/mission"
						className="inline-flex border border-line bg-ink px-4 py-3 font-display text-2xl uppercase tracking-[0.04em] text-paper"
					>
						Open mission
					</Link>
					<Link
						href="/access-required"
						className="inline-flex border border-line bg-white px-4 py-3 font-display text-2xl uppercase tracking-[0.04em] text-ink"
					>
						Account status
					</Link>
				</div>
			</section>
		</ProductShell>
	);
}
