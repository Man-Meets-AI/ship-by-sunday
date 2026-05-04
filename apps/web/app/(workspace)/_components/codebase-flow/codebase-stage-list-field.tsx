"use client";

import { PlusIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { CanonicalProjectFactKey } from "@shipbysunday/codebase-compiler";
import { Button } from "@/components/ui/button";
import {
	CodebaseStageListFieldRow,
	type CodebaseStageListFieldRowMotion,
} from "@/app/(workspace)/_components/codebase-flow/codebase-stage-list-field-row";
import { useCodebasePageReducedMotion } from "@/app/(workspace)/_components/codebase-flow/codebase-page-motion";
import { useCodebaseStageListField } from "@/app/(workspace)/_hooks/codebase-flow/use-codebase-stage-list-field";
import { codebaseListFieldItemPlaceholders } from "@/lib/codebase-flow/codebase-field-helpers";

type CodebaseStageListFieldProps = {
	fieldKey: CanonicalProjectFactKey;
	inputIdPrefix: string;
	value: string;
	onChange: (fieldKey: CanonicalProjectFactKey, nextValue: string) => void;
	errorId?: string;
	errorMessage?: string;
};

function buildRowMotionConfig(
	prefersReducedMotion: boolean,
): CodebaseStageListFieldRowMotion {
	if (prefersReducedMotion) {
		return {
			prefersReducedMotion: true,
			transition: { duration: 0 },
			initial: { opacity: 1, height: "auto" },
			animate: { opacity: 1, height: "auto" },
			exit: { opacity: 0 },
		};
	}
	return {
		prefersReducedMotion: false,
		transition: { duration: 0.18, ease: "easeOut" },
		initial: { opacity: 0, height: 0 },
		animate: { opacity: 1, height: "auto" },
		exit: { opacity: 0, height: 0 },
	};
}

export function CodebaseStageListField({
	fieldKey,
	inputIdPrefix,
	value,
	onChange,
	errorId,
	errorMessage,
}: CodebaseStageListFieldProps) {
	const prefersReducedMotion = useCodebasePageReducedMotion();
	const placeholders = codebaseListFieldItemPlaceholders(fieldKey);
	const {
		canReorder,
		handleAdd,
		handleItemChange,
		handleKeyDown,
		handleMoveDown,
		handleMoveUp,
		handleRemove,
		items,
	} = useCodebaseStageListField({
		fieldKey,
		inputIdPrefix,
		onChange,
		value,
	});
	const motionConfig = buildRowMotionConfig(prefersReducedMotion);

	return (
		<div className="space-y-2">
			<AnimatePresence initial={false}>
				{items.map((item, index) => (
					<CodebaseStageListFieldRow
						key={`${inputIdPrefix}-row-${index}`}
						canReorder={canReorder}
						errorId={errorId}
						errorMessage={errorMessage}
						index={index}
						inputId={`${inputIdPrefix}-${index}`}
						isFirst={index === 0}
						isLast={index === items.length - 1}
						itemCount={items.length}
						motionConfig={motionConfig}
						onChange={(nextValue) => handleItemChange(index, nextValue)}
						onKeyDown={(event) => handleKeyDown(index, event)}
						onMoveDown={() => handleMoveDown(index)}
						onMoveUp={() => handleMoveUp(index)}
						onRemove={() => handleRemove(index)}
						placeholder={placeholders[index] ?? undefined}
						value={item}
					/>
				))}
			</AnimatePresence>
			<motion.div
				whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
				className="inline-flex"
			>
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="ml-8 text-muted-foreground"
					onClick={handleAdd}
				>
					<PlusIcon data-icon="inline-start" className="size-3.5" />
					Add step
				</Button>
			</motion.div>
		</div>
	);
}
