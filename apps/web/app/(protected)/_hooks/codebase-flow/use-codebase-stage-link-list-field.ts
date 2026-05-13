"use client";

import type { ClipboardEvent, KeyboardEvent } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import type { CanonicalProjectFactKey } from "@shipbysunday/codebase-compiler";

function parseLinks(value: string): string[] {
	return value
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
}

function joinLinks(links: string[]): string {
	return links.join("\n");
}

export function useCodebaseStageLinkListField({
	fieldKey,
	value,
	onChange,
}: {
	fieldKey: CanonicalProjectFactKey;
	value: string;
	onChange: (fieldKey: CanonicalProjectFactKey, nextValue: string) => void;
}) {
	const links = useMemo(() => parseLinks(value), [value]);
	const [inputValue, setInputValue] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	const commitLink = useCallback(
		(raw: string) => {
			const trimmed = raw.trim();
			if (!trimmed) return;
			const next = [...links, trimmed];
			onChange(fieldKey, joinLinks(next));
			setInputValue("");
		},
		[fieldKey, links, onChange],
	);

	const handleRemove = useCallback(
		(index: number) => {
			const next = links.filter((_, i) => i !== index);
			onChange(fieldKey, joinLinks(next));
		},
		[fieldKey, links, onChange],
	);

	const handleKeyDown = useCallback(
		(event: KeyboardEvent<HTMLInputElement>) => {
			if (event.key === "Enter") {
				event.preventDefault();
				commitLink(inputValue);
			}
			if (event.key === "Backspace" && inputValue === "" && links.length > 0) {
				const next = links.slice(0, -1);
				onChange(fieldKey, joinLinks(next));
			}
		},
		[commitLink, fieldKey, inputValue, links, onChange],
	);

	const handlePaste = useCallback(
		(event: ClipboardEvent<HTMLInputElement>) => {
			const pasted = event.clipboardData.getData("text/plain");
			const pastedLines = pasted
				.split(/[\n\r]+/)
				.map((line) => line.trim())
				.filter(Boolean);
			if (pastedLines.length <= 1) return;

			event.preventDefault();
			const next = [...links, ...pastedLines];
			onChange(fieldKey, joinLinks(next));
			setInputValue("");
		},
		[fieldKey, links, onChange],
	);

	const handleInputBlur = useCallback(() => {
		commitLink(inputValue);
	}, [commitLink, inputValue]);

	return {
		handleInputBlur,
		handleKeyDown,
		handlePaste,
		handleRemove,
		inputRef,
		inputValue,
		links,
		setInputValue,
	};
}
