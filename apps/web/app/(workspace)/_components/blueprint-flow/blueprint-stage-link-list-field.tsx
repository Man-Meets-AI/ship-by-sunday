"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { LinkIcon, XIcon } from "lucide-react";
import type { CanonicalProjectFactKey } from "@shipbysunday/blueprint-compiler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { blueprintListFieldItemPlaceholders } from "@/lib/blueprint-flow/blueprint-field-helpers";

type BlueprintStageLinkListFieldProps = {
	fieldKey: CanonicalProjectFactKey;
	inputId: string;
	value: string;
	onChange: (fieldKey: CanonicalProjectFactKey, nextValue: string) => void;
	errorId?: string;
	errorMessage?: string;
};

function parseLinks(value: string): string[] {
	return value
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
}

function joinLinks(links: string[]): string {
	return links.join("\n");
}

function formatLinkLabel(url: string): string {
	try {
		const parsed = new URL(url);
		return parsed.hostname.replace(/^www\./, "");
	} catch {
		return url;
	}
}

export function BlueprintStageLinkListField({
	fieldKey,
	inputId,
	value,
	onChange,
	errorId,
	errorMessage,
}: BlueprintStageLinkListFieldProps) {
	const links = useMemo(() => parseLinks(value), [value]);
	const placeholders = blueprintListFieldItemPlaceholders(fieldKey);
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
		(event: React.KeyboardEvent<HTMLInputElement>) => {
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
		(event: React.ClipboardEvent<HTMLInputElement>) => {
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

	const placeholder =
		links.length === 0 ? (placeholders[0] ?? "Paste a link") : "Add another";

	return (
		<div className="space-y-3">
			{links.length > 0 ? (
				<div className="flex flex-wrap gap-2">
					{links.map((link, index) => (
						<span
							key={index}
							className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 py-1 pr-1.5 pl-2.5 text-xs text-foreground transition-colors hover:bg-muted"
						>
							<LinkIcon className="size-3 shrink-0 text-muted-foreground" />
							<span className="truncate" title={link}>
								{formatLinkLabel(link)}
							</span>
							<Button
								type="button"
								variant="ghost"
								size="icon-xs"
								className="size-4 rounded-full"
								onClick={() => handleRemove(index)}
								aria-label={`Remove ${formatLinkLabel(link)}`}
							>
								<XIcon className="size-3" />
							</Button>
						</span>
					))}
				</div>
			) : null}
			<Input
				ref={inputRef}
				id={inputId}
				className="h-9"
				type="url"
				value={inputValue}
				placeholder={placeholder}
				onChange={(e) => setInputValue(e.target.value)}
				onKeyDown={handleKeyDown}
				onBlur={() => commitLink(inputValue)}
				onPaste={handlePaste}
				aria-describedby={errorId}
				aria-invalid={errorMessage ? true : undefined}
			/>
		</div>
	);
}
