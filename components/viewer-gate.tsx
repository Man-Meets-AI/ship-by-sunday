"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useConvexAuth, useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

export function ViewerGate({
	children,
}: {
	children: React.ReactNode;
}) {
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

	if (isLoading || !isAuthenticated || access === undefined || !access.hasAccess) {
		return (
			<section className="border border-line bg-white px-5 py-10 text-center shadow-card">
				<p className="font-display text-4xl uppercase tracking-[0.04em]">
					Checking access
				</p>
				<p className="mt-3 text-sm font-medium text-ink/70">
					Loading your course access and mission state.
				</p>
			</section>
		);
	}

	return <>{children}</>;
}
