"use client";

import { useEffect, useRef } from "react";
import { useAnimate, useReducedMotion } from "motion/react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { ObjectiveTask } from "@/lib/course/lesson/model/registry";
import { cn } from "@/lib/utils";

export function ObjectiveTaskRow({
	task,
	onToggle,
}: {
	task: ObjectiveTask;
	onToggle: (taskId: string, checked: boolean) => void;
}) {
	const complete = task.status === "complete";
	const id = task.interactive
		? `objective-task-${task.id}`
		: `objective-task-readonly-${task.id}`;

	const reducedMotion = useReducedMotion() ?? false;
	const [scope, animate] = useAnimate<HTMLSpanElement>();
	const previousComplete = useRef(complete);

	useEffect(() => {
		if (previousComplete.current === complete) {
			return;
		}
		previousComplete.current = complete;
		if (reducedMotion || !scope.current) {
			return;
		}
		void animate(
			scope.current,
			{ opacity: [0.4, 1] },
			{ duration: 0.18, ease: "easeOut" },
		);
	}, [complete, reducedMotion, animate, scope]);

	return (
		<div
			className={cn(
				"flex gap-3 rounded-md px-1 py-1 transition-colors duration-150 motion-reduce:transition-none hover:bg-muted/30 focus-within:bg-muted/30",
				task.interactive ? "items-center" : "items-start",
			)}
		>
			<Checkbox
				id={id}
				checked={complete}
				className={
					task.interactive ? "size-3.5 shrink-0" : "mt-0.5 size-3.5 shrink-0"
				}
				disabled={!task.interactive}
				onCheckedChange={
					task.interactive
						? (value) => onToggle(task.id, Boolean(value))
						: undefined
				}
			/>
			<Label
				htmlFor={id}
				className={cn(
					"text-[13px] font-normal leading-normal",
					complete ? "text-muted-foreground line-through" : "text-foreground",
				)}
			>
				<span ref={scope}>{task.label}</span>
			</Label>
		</div>
	);
}
