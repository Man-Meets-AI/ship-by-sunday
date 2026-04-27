"use client";

import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";

export function HeroAtmosphere() {
	return (
		<>
			<DottedGlowBackground
				className="pointer-events-none"
				gap={20}
				radius={1.5}
				opacity={0.25}
				speedScale={0.5}
				speedMin={0.3}
				speedMax={0.8}
			/>
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
