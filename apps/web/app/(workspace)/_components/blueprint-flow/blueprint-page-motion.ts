"use client";

import { useReducedMotion } from "motion/react";

export function useBlueprintPageReducedMotion(): boolean {
	return useReducedMotion() ?? false;
}
