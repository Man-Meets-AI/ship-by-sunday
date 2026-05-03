"use client";

import { useReducedMotion } from "motion/react";

export function useBlueprintDemoReducedMotion(): boolean {
	return useReducedMotion() ?? false;
}

export function useBlueprintDemoStaggerDelays(
	count: number,
	step: number = 0.06,
): number[] {
	const isReduced = useBlueprintDemoReducedMotion();
	if (isReduced) {
		return Array.from({ length: count }, () => 0);
	}
	return Array.from({ length: count }, (_, index) => index * step);
}
