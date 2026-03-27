"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { motion } from "motion/react";

import { routeConfig } from "@/config/product";
import { Button } from "@/components/ui/button";
import { reportClientError } from "@/features/observability/lib/client-error-report";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

export function ErrorBoundaryScreen({
	error,
	reset,
	title,
	description,
	code,
}: {
	error: Error & { digest?: string };
	reset: () => void;
	title: string;
	description: string;
	code: string;
}) {
	const pathname = usePathname();

	useEffect(() => {
		reportClientError({
			error,
			code,
			pathname,
			severity: code === "global_error_boundary" ? "critical" : "high",
			details: {
				digest: error.digest ?? null,
			},
		});
	}, [code, error, pathname]);

	return (
		<main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
			<div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-20 text-center">
				<div className="space-y-12">
					<div className="space-y-4">
						<motion.p
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, ease }}
							className="text-[0.7rem] font-bold uppercase tracking-[0.3em] text-red-500/80"
						>
							{title} / {code.replace(/_/g, " ")}
						</motion.p>
						<motion.h1
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.7, ease }}
							className="font-marketing-display text-[clamp(4rem,14vw,10rem)] leading-[0.85] tracking-tighter uppercase"
						>
							Logic <span className="text-white/20">Error</span>
						</motion.h1>
					</div>

					<div className="space-y-4 max-w-xl mx-auto">
						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.2, duration: 0.6 }}
							className="text-lg text-white/60 leading-relaxed"
						>
							{description}
						</motion.p>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.3, duration: 0.6 }}
							className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs font-mono text-white/40 space-y-2 text-left"
						>
							<p>Path: {pathname ?? "unknown"}</p>
							<p>Digest: {error.digest ?? "none"}</p>
							<p className="line-clamp-2">Trace: {error.message}</p>
						</motion.div>
					</div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4, duration: 0.5, ease }}
						className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
					>
						<Button
							onClick={reset}
							size="lg"
							className="h-14 px-8 text-lg rounded-full bg-white text-black hover:bg-white/90"
						>
							Try to recompile
						</Button>
						<Button
							asChild
							variant="outline"
							size="lg"
							className="h-14 px-8 text-lg rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white"
						>
							<Link href={routeConfig.home}>Safe exit</Link>
						</Button>
					</motion.div>
				</div>

				{/* Subtle background delight - red tint scanlines */}
				<div className="pointer-events-none fixed inset-0 z-50 overflow-hidden opacity-[0.04]">
					<div className="h-full w-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(17,17,17,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.1),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
				</div>
			</div>
		</main>
	);
}
