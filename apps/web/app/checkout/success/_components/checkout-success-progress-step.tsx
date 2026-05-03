"use client";

import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

import type { CheckoutProgressStep } from "../_lib/checkout-success-view-model";

function StepIcon({ state }: { state: CheckoutProgressStep["state"] }) {
	if (state === "complete") {
		return (
			<CheckCircle2
				className="size-4 shrink-0 text-muted-foreground"
				aria-hidden
			/>
		);
	}
	if (state === "active") {
		return (
			<Loader2
				className="size-4 shrink-0 animate-spin text-foreground"
				aria-hidden
			/>
		);
	}
	return (
		<Circle className="size-4 shrink-0 text-muted-foreground" aria-hidden />
	);
}

export function CheckoutSuccessProgressStep({
	step,
}: {
	step: CheckoutProgressStep;
}) {
	const prefersReducedMotion = useReducedMotion() ?? false;
	const fadeDuration = prefersReducedMotion ? 0 : 0.18;

	return (
		<div
			data-testid="checkout-success-progress-step"
			data-state={step.state}
			className={cn(
				"flex gap-3 transition-colors duration-200",
				step.state === "active" && "rounded-lg border bg-card p-3",
				step.state === "complete" && "rounded-lg py-1.5",
				step.state === "pending" && "py-1.5",
			)}
		>
			<div className="pt-0.5">
				<AnimatePresence initial={false} mode="wait">
					<motion.span
						key={step.state}
						className="inline-flex"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: fadeDuration, ease: "easeOut" }}
					>
						<StepIcon state={step.state} />
					</motion.span>
				</AnimatePresence>
			</div>
			<div className="min-w-0 flex-1">
				<p className="font-medium leading-none">{step.label}</p>
				<p className="mt-1.5 text-sm text-muted-foreground">{step.detail}</p>
			</div>
		</div>
	);
}
