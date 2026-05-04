"use client";

import { LinkIcon, XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { CanonicalProjectFactKey } from "@shipbysunday/codebase-compiler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCodebasePageReducedMotion } from "@/app/(workspace)/_components/codebase-flow/codebase-page-motion";
import { useCodebaseStageLinkListField } from "@/app/(workspace)/_hooks/codebase-flow/use-codebase-stage-link-list-field";
import { codebaseListFieldItemPlaceholders } from "@/lib/codebase-flow/codebase-field-helpers";

type CodebaseStageLinkListFieldProps = {
	fieldKey: CanonicalProjectFactKey;
	inputId: string;
	value: string;
	onChange: (fieldKey: CanonicalProjectFactKey, nextValue: string) => void;
	errorId?: string;
	errorMessage?: string;
};

function formatLinkLabel(url: string): string {
	try {
		const parsed = new URL(url);
		return parsed.hostname.replace(/^www\./, "");
	} catch {
		return url;
	}
}

export function CodebaseStageLinkListField({
	fieldKey,
	inputId,
	value,
	onChange,
	errorId,
	errorMessage,
}: CodebaseStageLinkListFieldProps) {
	const placeholders = codebaseListFieldItemPlaceholders(fieldKey);
	const prefersReducedMotion = useCodebasePageReducedMotion();
	const {
		handleInputBlur,
		handleKeyDown,
		handlePaste,
		handleRemove,
		inputRef,
		inputValue,
		links,
		setInputValue,
	} = useCodebaseStageLinkListField({ fieldKey, onChange, value });

	const placeholder =
		links.length === 0 ? (placeholders[0] ?? "Paste a link") : "Add another";
	const chipMotionTransition = prefersReducedMotion
		? { duration: 0 }
		: { duration: 0.16, ease: "easeOut" as const };
	const chipInitial = prefersReducedMotion
		? { opacity: 1, scale: 1 }
		: { opacity: 0, scale: 0.92 };
	const chipExit = prefersReducedMotion
		? { opacity: 0 }
		: { opacity: 0, scale: 0.92 };

	return (
		<div className="space-y-3">
			{links.length > 0 ? (
				<div
					className="flex flex-wrap gap-2"
					data-testid="codebase-page-link-list"
				>
					<AnimatePresence initial={false}>
						{links.map((link, index) => (
							<motion.span
								key={`${index}-${link}`}
								layout={!prefersReducedMotion}
								initial={chipInitial}
								animate={{ opacity: 1, scale: 1 }}
								exit={chipExit}
								transition={chipMotionTransition}
								className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-border/60 bg-muted/50 py-1 pr-1.5 pl-2.5 text-xs text-foreground transition-colors hover:bg-muted motion-reduce:transition-none"
							>
								<LinkIcon className="size-3 shrink-0 text-muted-foreground" />
								<span className="truncate" title={link}>
									{formatLinkLabel(link)}
								</span>
								<motion.span
									whileTap={prefersReducedMotion ? undefined : { scale: 0.9 }}
									className="inline-flex"
								>
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
								</motion.span>
							</motion.span>
						))}
					</AnimatePresence>
				</div>
			) : null}
			<Input
				ref={inputRef}
				id={inputId}
				className="h-9"
				type="url"
				value={inputValue}
				placeholder={placeholder}
				onChange={(event) => setInputValue(event.target.value)}
				onKeyDown={handleKeyDown}
				onBlur={handleInputBlur}
				onPaste={handlePaste}
				aria-describedby={errorId}
				aria-invalid={errorMessage ? true : undefined}
			/>
		</div>
	);
}
