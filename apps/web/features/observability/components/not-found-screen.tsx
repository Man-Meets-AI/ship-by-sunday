"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { routeConfig } from "@/config/product";
import { Button } from "@/components/ui/button";
import { workspaceDisplayConfig } from "@/features/starter/lib/starter-selectors";

const ease = [0.25, 0.46, 0.45, 0.94] as const;

export function NotFoundScreen() {
	return (
		<main className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
			<div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-20 text-center">
				<div className="space-y-8">
					<div className="space-y-4">
						<motion.p
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, ease }}
							className="text-[0.7rem] font-bold uppercase tracking-[0.3em] text-white/40"
						>
							Error 404 / Missing Path
						</motion.p>
						<motion.h1
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.7, ease }}
							className="font-marketing-display text-[clamp(4rem,15vw,12rem)] leading-[0.85] tracking-tighter uppercase"
						>
							Path Not <span className="text-white/20">Found</span>
						</motion.h1>
					</div>

					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2, duration: 0.6 }}
						className="max-w-md mx-auto text-lg text-white/60 leading-relaxed"
					>
						The coordinates you requested do not exist in this workspace. The
						blueprint may have been moved or the logic was never compiled.
					</motion.p>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3, duration: 0.5, ease }}
						className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
					>
						<Button
							asChild
							size="lg"
							className="h-14 px-8 text-lg rounded-full bg-white text-black hover:bg-white/90"
						>
							<Link href={routeConfig.blueprint}>
								{workspaceDisplayConfig.openHomeActionLabel}
							</Link>
						</Button>
						<Button
							asChild
							size="lg"
							className="h-14 rounded-full border-white/20 bg-white px-8 text-lg text-black hover:bg-white/90 hover:text-black"
						>
							<Link href={routeConfig.home}>Exit to safety</Link>
						</Button>
					</motion.div>
				</div>

				{/* Subtle background delight - scanlines */}
				<div className="pointer-events-none fixed inset-0 z-50 overflow-hidden opacity-[0.03]">
					<div className="h-full w-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(17,17,17,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
				</div>
			</div>
		</main>
	);
}
