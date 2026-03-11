"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useConvexAuth, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

export function ViewerGate({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const { isAuthenticated, isLoading } = useConvexAuth();
	const access = useQuery(api.course.viewerAccess) as
		| { hasAccess: boolean }
		| undefined;

	useEffect(() => {
		if (!isLoading && access && !access.hasAccess) {
			router.replace("/access-required");
		}
	}, [access, isLoading, router]);

	if (
		isLoading ||
		!isAuthenticated ||
		access === undefined ||
		!access.hasAccess
	) {
		return (
			<section className="rounded-none border border-product-border bg-product-surface/78 px-5 py-10 text-center shadow-panel backdrop-blur-xl">
				<p className="font-display text-4xl uppercase tracking-[0.08em] text-product-text">
					Checking access
				</p>
				<p className="mt-3 text-sm font-medium text-product-muted">
					Loading your course access and mission state.
				</p>
			</section>
		);
	}

	return <>{children}</>;
}
