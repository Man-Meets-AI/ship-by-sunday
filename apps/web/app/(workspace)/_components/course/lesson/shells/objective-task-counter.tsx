"use client";

import { useEffect, useRef } from "react";
import { useAnimate, useReducedMotion } from "motion/react";

export function ObjectiveTaskCounter({
	completedCount,
	totalCount,
}: {
	completedCount: number;
	totalCount: number;
}) {
	const reducedMotion = useReducedMotion() ?? false;
	const [scope, animate] = useAnimate<HTMLParagraphElement>();
	const hadFullyCompleted = useRef(false);
	const isFullyCompleted = totalCount > 0 && completedCount === totalCount;

	useEffect(() => {
		if (isFullyCompleted && !hadFullyCompleted.current) {
			hadFullyCompleted.current = true;
			if (!reducedMotion && scope.current) {
				void animate(
					scope.current,
					{ scale: [1, 1.04, 1] },
					{ duration: 0.5, ease: "easeOut" },
				);
			}
			return;
		}
		if (!isFullyCompleted) {
			hadFullyCompleted.current = false;
		}
	}, [isFullyCompleted, reducedMotion, animate, scope]);

	return (
		<p
			ref={scope}
			className="font-mono text-[10px] tabular-nums tracking-widest text-muted-foreground"
			data-testid="lesson-objective-counter"
			data-complete={isFullyCompleted ? "true" : "false"}
		>
			{completedCount}/{totalCount}
		</p>
	);
}
