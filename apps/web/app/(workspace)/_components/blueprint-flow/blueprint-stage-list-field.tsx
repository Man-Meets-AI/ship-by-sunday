"use client";

import { useCallback, useMemo } from "react";
import { ChevronDownIcon, ChevronUpIcon, PlusIcon, XIcon } from "lucide-react";
import type { CanonicalProjectFactKey } from "@shipbysunday/blueprint-compiler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { blueprintListFieldItemPlaceholders } from "@/lib/blueprint-flow/blueprint-field-helpers";

type BlueprintStageListFieldProps = {
	fieldKey: CanonicalProjectFactKey;
	inputIdPrefix: string;
	value: string;
	onChange: (fieldKey: CanonicalProjectFactKey, nextValue: string) => void;
	errorId?: string;
	errorMessage?: string;
};

function parseItems(value: string): string[] {
	const lines = value.split("\n");
	return lines.length > 0 ? lines : [""];
}

function joinItems(items: string[]): string {
	return items.join("\n");
}

export function BlueprintStageListField({
	fieldKey,
	inputIdPrefix,
	value,
	onChange,
	errorId,
	errorMessage,
}: BlueprintStageListFieldProps) {
	const items = useMemo(() => parseItems(value), [value]);
	const placeholders = blueprintListFieldItemPlaceholders(fieldKey);

	const updateItems = useCallback(
		(nextItems: string[]) => {
			onChange(fieldKey, joinItems(nextItems));
		},
		[fieldKey, onChange],
	);

	const handleItemChange = useCallback(
		(index: number, nextValue: string) => {
			const next = [...items];
			next[index] = nextValue;
			updateItems(next);
		},
		[items, updateItems],
	);

	const handleAdd = useCallback(() => {
		updateItems([...items, ""]);
	}, [items, updateItems]);

	const handleRemove = useCallback(
		(index: number) => {
			if (items.length <= 1) return;
			updateItems(items.filter((_, i) => i !== index));
		},
		[items, updateItems],
	);

	const handleMoveUp = useCallback(
		(index: number) => {
			if (index <= 0) return;
			const next = [...items];
			const previousItem = next[index - 1];
			next[index - 1] = next[index];
			next[index] = previousItem;
			updateItems(next);
			requestAnimationFrame(() => {
				document.getElementById(`${inputIdPrefix}-${index - 1}`)?.focus();
			});
		},
		[items, updateItems, inputIdPrefix],
	);

	const handleMoveDown = useCallback(
		(index: number) => {
			if (index >= items.length - 1) return;
			const next = [...items];
			const nextItem = next[index + 1];
			next[index + 1] = next[index];
			next[index] = nextItem;
			updateItems(next);
			requestAnimationFrame(() => {
				document.getElementById(`${inputIdPrefix}-${index + 1}`)?.focus();
			});
		},
		[items, updateItems, inputIdPrefix],
	);

	const handleKeyDown = useCallback(
		(index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
			if (event.key === "Enter") {
				event.preventDefault();
				const next = [...items];
				next.splice(index + 1, 0, "");
				updateItems(next);
				requestAnimationFrame(() => {
					document.getElementById(`${inputIdPrefix}-${index + 1}`)?.focus();
				});
			}
			if (
				event.key === "Backspace" &&
				items[index] === "" &&
				items.length > 1
			) {
				event.preventDefault();
				const next = items.filter((_, i) => i !== index);
				updateItems(next);
				requestAnimationFrame(() => {
					const prevIndex = Math.max(0, index - 1);
					document.getElementById(`${inputIdPrefix}-${prevIndex}`)?.focus();
				});
			}
		},
		[items, updateItems, inputIdPrefix],
	);

	const canReorder = items.length > 1;

	return (
		<div className="space-y-2">
			{items.map((item, index) => (
				<div key={index} className="group/row flex items-center gap-2">
					<span className="w-6 shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground">
						{index + 1}.
					</span>
					{canReorder ? (
						<div className="flex w-5 shrink-0 flex-col items-center opacity-0 transition-opacity duration-150 ease-in-out group-hover/row:opacity-100">
							<Button
								type="button"
								variant="ghost"
								size="icon-xs"
								className="size-4 rounded-sm"
								onClick={() => handleMoveUp(index)}
								disabled={index === 0}
								aria-label={`Move step ${index + 1} up`}
							>
								<ChevronUpIcon className="size-3" />
							</Button>
							<Button
								type="button"
								variant="ghost"
								size="icon-xs"
								className="size-4 rounded-sm"
								onClick={() => handleMoveDown(index)}
								disabled={index === items.length - 1}
								aria-label={`Move step ${index + 1} down`}
							>
								<ChevronDownIcon className="size-3" />
							</Button>
						</div>
					) : null}
					<Input
						id={`${inputIdPrefix}-${index}`}
						className="h-9 flex-1"
						value={item}
						placeholder={placeholders[index] ?? undefined}
						onChange={(e) => handleItemChange(index, e.target.value)}
						onKeyDown={(e) => handleKeyDown(index, e)}
						aria-describedby={errorId}
						aria-invalid={errorMessage ? true : undefined}
					/>
					<Button
						type="button"
						variant="ghost"
						size="icon-xs"
						onClick={() => handleRemove(index)}
						disabled={items.length <= 1}
						aria-label={`Remove step ${index + 1}`}
					>
						<XIcon className="size-3.5" />
					</Button>
				</div>
			))}
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
		</div>
	);
}
