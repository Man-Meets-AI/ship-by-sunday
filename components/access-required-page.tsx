"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";
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
			<section className="border border-line bg-white p-6 shadow-card">
				<p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/60">
					Account state
				</p>
				<p className="mt-3 font-display text-4xl uppercase leading-none tracking-[0.04em]">
					{access?.status ?? "Checking"}
				</p>
				<p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-ink/75">
					The auth flow is live, but paid access is still granted through the
					Convex entitlement layer. Until Stripe is wired, use an active
					entitlement record for your Clerk user to unlock the product shell.
				</p>
				{access?.clerkUserId ? (
					<div className="mt-5 border border-line bg-paper p-4">
						<p className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink/55">
							Clerk user id
						</p>
						<p className="mt-2 break-all font-mono text-sm text-ink">
							{access.clerkUserId}
						</p>
					</div>
				) : null}

				<div className="mt-6 flex flex-wrap gap-3">
					<Link
						href="/"
						className="inline-flex border border-line bg-ink px-4 py-3 font-display text-2xl uppercase tracking-[0.04em] text-paper"
					>
						Back home
					</Link>
					<Link
						href="/settings"
						className="inline-flex border border-line bg-white px-4 py-3 font-display text-2xl uppercase tracking-[0.04em] text-ink"
					>
						Account
					</Link>
				</div>
			</section>
		</ProductShell>
	);
}
