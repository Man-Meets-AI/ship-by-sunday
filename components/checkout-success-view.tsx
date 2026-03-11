"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useConvexAuth, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
import { ProductShell } from "@/components/product-shell";

export function CheckoutSuccessView() {
	const router = useRouter();
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

	useEffect(() => {
		if (access?.hasAccess) {
			router.replace("/mission");
		}
	}, [access, router]);

	return (
		<ProductShell
			title="Payment received"
			subtitle="We’re unlocking your access now."
		>
			<section className="border border-line bg-white p-6 shadow-card">
				<p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/60">
					Checkout status
				</p>
				<p className="mt-3 font-display text-4xl uppercase leading-none tracking-[0.04em]">
					{access?.hasAccess ? "Access ready" : "Finalizing access"}
				</p>
				<p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-ink/75">
					This page will send you into the course automatically as soon as
					access is ready. If it takes longer than a few seconds, use one of the
					buttons below.
				</p>
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
						Check access
					</Link>
				</div>
			</section>
		</ProductShell>
	);
}
