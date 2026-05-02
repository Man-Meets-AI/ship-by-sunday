"use client";

import { useReducedMotion } from "motion/react";

import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

export function HeroAtmosphere() {
	// `DottedGlowBackground` runs a continuous requestAnimationFrame loop on a
	// canvas. There is no static-state prop, so the only honest way to honor
	// `prefers-reduced-motion` is to skip the animated layer entirely. The
	// radial vignette below still grounds the hero composition.
	const prefersReducedMotion = useReducedMotion();

	return (
		<>
			{prefersReducedMotion ? null : (
				<DottedGlowBackground
					className="pointer-events-none"
					gap={20}
					radius={1.5}
					opacity={0.25}
					speedScale={0.5}
					speedMin={0.3}
					speedMax={0.8}
				/>
			)}
			<div
				className="pointer-events-none absolute inset-0"
				style={{
					background:
						"radial-gradient(ellipse at center, transparent 40%, var(--background) 100%)",
				}}
			/>
		</>
	);
}
