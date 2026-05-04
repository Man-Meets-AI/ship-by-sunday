"use client";

import { useCallback, useMemo } from "react";
import type { KeyboardEvent } from "react";
import type { CanonicalProjectFactKey } from "@shipbysunday/codebase-compiler";

function parseItems(value: string): string[] {
	const lines = value.split("\n");
	return lines.length > 0 ? lines : [""];
}

function joinItems(items: string[]): string {
	return items.join("\n");
}

function focusRowAfterRender(inputId: string) {
	requestAnimationFrame(() => {
		document.getElementById(inputId)?.focus();
	});
}

export function useCodebaseStageListField({
	fieldKey,
	inputIdPrefix,
	value,
	onChange,
}: {
	fieldKey: CanonicalProjectFactKey;
	inputIdPrefix: string;
	value: string;
	onChange: (fieldKey: CanonicalProjectFactKey, nextValue: string) => void;
}) {
	const items = useMemo(() => parseItems(value), [value]);

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
			focusRowAfterRender(`${inputIdPrefix}-${index - 1}`);
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
			focusRowAfterRender(`${inputIdPrefix}-${index + 1}`);
		},
		[items, updateItems, inputIdPrefix],
	);

	const handleKeyDown = useCallback(
		(index: number, event: KeyboardEvent<HTMLInputElement>) => {
			if (event.key === "Enter") {
				event.preventDefault();
				const next = [...items];
				next.splice(index + 1, 0, "");
				updateItems(next);
				focusRowAfterRender(`${inputIdPrefix}-${index + 1}`);
			}
			if (
				event.key === "Backspace" &&
				items[index] === "" &&
				items.length > 1
			) {
				event.preventDefault();
				const next = items.filter((_, i) => i !== index);
				updateItems(next);
				const prevIndex = Math.max(0, index - 1);
				focusRowAfterRender(`${inputIdPrefix}-${prevIndex}`);
			}
		},
		[items, updateItems, inputIdPrefix],
	);

	return {
		canReorder: items.length > 1,
		handleAdd,
		handleItemChange,
		handleKeyDown,
		handleMoveDown,
		handleMoveUp,
		handleRemove,
		items,
	};
}
