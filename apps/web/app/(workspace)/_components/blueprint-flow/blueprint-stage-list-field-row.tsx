"use client";

import type { KeyboardEvent } from "react";
import { ChevronDownIcon, ChevronUpIcon, XIcon } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type BlueprintStageListFieldRowMotion = {
	prefersReducedMotion: boolean;
	transition: { duration: number; ease?: "easeOut" };
	initial: { opacity: number; height?: number | "auto" };
	animate: { opacity: number; height: "auto" };
	exit: { opacity: number; height?: number };
};

export function BlueprintStageListFieldRow({
	canReorder,
	errorId,
	errorMessage,
	index,
	inputId,
	isFirst,
	isLast,
	itemCount,
	motionConfig,
	onChange,
	onKeyDown,
	onMoveDown,
	onMoveUp,
	onRemove,
	placeholder,
	value,
}: {
	canReorder: boolean;
	errorId?: string;
	errorMessage?: string;
	index: number;
	inputId: string;
	isFirst: boolean;
	isLast: boolean;
	itemCount: number;
	motionConfig: BlueprintStageListFieldRowMotion;
	onChange: (nextValue: string) => void;
	onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
	onMoveDown: () => void;
	onMoveUp: () => void;
	onRemove: () => void;
	placeholder?: string;
	value: string;
}) {
	const { animate, exit, initial, prefersReducedMotion, transition } =
		motionConfig;

	return (
		<motion.div
			layout={!prefersReducedMotion}
			initial={initial}
			animate={animate}
			exit={exit}
			transition={transition}
			className="group/row flex items-center gap-2 overflow-hidden"
		>
			<span className="w-6 shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground">
				{index + 1}.
			</span>
			{canReorder ? (
				<div className="flex w-5 shrink-0 flex-col items-center opacity-0 transition-opacity duration-150 ease-in-out group-hover/row:opacity-100 motion-reduce:transition-none">
					<Button
						type="button"
						variant="ghost"
						size="icon-xs"
						className="size-4 rounded-sm"
						onClick={onMoveUp}
						disabled={isFirst}
						aria-label={`Move step ${index + 1} up`}
					>
						<ChevronUpIcon className="size-3" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon-xs"
						className="size-4 rounded-sm"
						onClick={onMoveDown}
						disabled={isLast}
						aria-label={`Move step ${index + 1} down`}
					>
						<ChevronDownIcon className="size-3" />
					</Button>
				</div>
			) : null}
			<Input
				id={inputId}
				className="h-9 flex-1"
				value={value}
				placeholder={placeholder}
				onChange={(event) => onChange(event.target.value)}
				onKeyDown={onKeyDown}
				aria-describedby={errorId}
				aria-invalid={errorMessage ? true : undefined}
			/>
			<motion.span
				whileTap={prefersReducedMotion ? undefined : { scale: 0.92 }}
				className="inline-flex"
			>
				<Button
					type="button"
					variant="ghost"
					size="icon-xs"
					onClick={onRemove}
					disabled={itemCount <= 1}
					aria-label={`Remove step ${index + 1}`}
				>
					<XIcon className="size-3.5" />
				</Button>
			</motion.span>
		</motion.div>
	);
}
