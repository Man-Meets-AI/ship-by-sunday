"use client";

import { useReducedMotion } from "motion/react";

export function useCodebaseDemoReducedMotion(): boolean {
	return useReducedMotion() ?? false;
}

export function useCodebaseDemoStaggerDelays(
	count: number,
	step: number = 0.06,
): number[] {
	const isReduced = useCodebaseDemoReducedMotion();
	if (isReduced) {
		return Array.from({ length: count }, () => 0);
	}
	return Array.from({ length: count }, (_, index) => index * step);
}
