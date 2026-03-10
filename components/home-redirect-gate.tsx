"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "convex/react";

import { api } from "@/convex/_generated/api";

export function HomeRedirectGate({
	children,
	allowMarketing,
}: {
	children: React.ReactNode;
	allowMarketing: boolean;
}) {
	const { isLoaded, userId } = useAuth();
	const router = useRouter();
	const access = useQuery(api.course.viewerAccess);
	const resume = useQuery(
		api.course.getResumeDestination,
		isLoaded && userId && access?.hasAccess && !allowMarketing ? {} : "skip",
	) as
		| {
				destination: string;
				lessonId: string | null;
		  }
		| undefined;

	useEffect(() => {
		if (!isLoaded || !userId || allowMarketing || !access?.hasAccess || !resume?.destination) {
			return;
		}

		router.replace(resume.destination);
	}, [access?.hasAccess, allowMarketing, isLoaded, resume?.destination, router, userId]);

	if (!isLoaded) {
		return (
			<main className="bg-paper text-ink">
				<div className="mx-auto flex min-h-screen max-w-[1280px] items-center justify-center px-3 py-3 sm:px-5 sm:py-5">
					<section className="border border-line bg-white px-6 py-10 text-center shadow-card">
						<p className="font-display text-4xl uppercase tracking-[0.04em]">Loading</p>
						<p className="mt-3 text-sm font-medium text-ink/70">
							Checking whether you should resume the product.
						</p>
					</section>
				</div>
			</main>
		);
	}

	if (userId && !allowMarketing) {
		if (access === undefined || (access.hasAccess && resume === undefined)) {
			return (
				<main className="bg-paper text-ink">
					<div className="mx-auto flex min-h-screen max-w-[1280px] items-center justify-center px-3 py-3 sm:px-5 sm:py-5">
						<section className="border border-line bg-white px-6 py-10 text-center shadow-card">
							<p className="font-display text-4xl uppercase tracking-[0.04em]">
								Resuming
							</p>
							<p className="mt-3 text-sm font-medium text-ink/70">
								Taking you back into Ship by Sunday.
							</p>
						</section>
					</div>
				</main>
			);
		}

		if (access?.hasAccess && resume?.destination) {
			return (
				<main className="bg-paper text-ink">
					<div className="mx-auto flex min-h-screen max-w-[1280px] items-center justify-center px-3 py-3 sm:px-5 sm:py-5">
						<section className="border border-line bg-white px-6 py-10 text-center shadow-card">
							<p className="font-display text-4xl uppercase tracking-[0.04em]">
								Redirecting
							</p>
							<p className="mt-3 text-sm font-medium text-ink/70">
								Opening your last lesson.
							</p>
						</section>
					</div>
				</main>
			);
		}
	}

	return <>{children}</>;
}
