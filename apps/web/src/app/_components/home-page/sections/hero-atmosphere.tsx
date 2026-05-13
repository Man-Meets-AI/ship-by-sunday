"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

const DESKTOP_QUERY = "(min-width: 1024px)";

export function HeroAtmosphere() {
	// `DottedGlowBackground` runs a continuous requestAnimationFrame loop on a
	// canvas. Honor `prefers-reduced-motion` by skipping the canvas entirely,
	// and avoid paying the rAF cost on cold mobile loads by lazy-mounting only
	// when the viewport is at the `lg` breakpoint or wider. The radial vignette
	// below still grounds the hero composition for both fallback paths.
	const prefersReducedMotion = useReducedMotion();
	const [isDesktopViewport, setIsDesktopViewport] = useState(false);

	useEffect(() => {
		const mediaQuery = window.matchMedia(DESKTOP_QUERY);
		const sync = () => setIsDesktopViewport(mediaQuery.matches);
		sync();
		mediaQuery.addEventListener("change", sync);
		return () => mediaQuery.removeEventListener("change", sync);
	}, []);

	const shouldRenderCanvas = isDesktopViewport && !prefersReducedMotion;

	return (
		<>
			{shouldRenderCanvas ? (
				<DottedGlowBackground
					className="pointer-events-none"
					gap={20}
					radius={1.5}
					opacity={0.25}
					speedScale={0.5}
					speedMin={0.3}
					speedMax={0.8}
				/>
			) : null}
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
