"use client";

import { useReducedMotion } from "motion/react";

export function useCodebasePageReducedMotion(): boolean {
	return useReducedMotion() ?? false;
}
