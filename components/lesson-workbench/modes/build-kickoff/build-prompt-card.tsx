"use client";

import { useEffect, useRef, useState } from "react";

import { WorkbenchCard } from "../../shared/workbench-card";

export function BuildPromptCard({
	prompt,
	disabledReason,
}: {
	prompt: string | null;
	disabledReason: string | null;
}) {
	const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
		"idle",
	);
	const resetTimeoutRef = useRef<number | null>(null);

	useEffect(() => {
		return () => {
			if (resetTimeoutRef.current !== null) {
				window.clearTimeout(resetTimeoutRef.current);
			}
		};
	}, []);

	useEffect(() => {
		setCopyState("idle");
	}, [prompt, disabledReason]);

	const copyPrompt = () => {
		if (!prompt || disabledReason || !navigator.clipboard?.writeText) {
			setCopyState("error");
			return;
		}

		void navigator.clipboard.writeText(prompt).then(
			() => {
				if (resetTimeoutRef.current !== null) {
					window.clearTimeout(resetTimeoutRef.current);
				}

				setCopyState("copied");
				resetTimeoutRef.current = window.setTimeout(() => {
					resetTimeoutRef.current = null;
					setCopyState("idle");
				}, 1600);
			},
			() => setCopyState("error"),
		);
	};

	return (
		<WorkbenchCard label="Build prompt">
			<p className="text-xs font-medium leading-relaxed text-product-muted">
				Copy this into your coding agent after you choose a path and lock the
				first slice.
			</p>
			{disabledReason ? (
				<p className="mt-2 text-[11px] leading-relaxed text-product-muted">
					{disabledReason}
				</p>
			) : null}
			<div className="mt-3 flex flex-wrap items-center gap-2">
				<button
					type="button"
					onClick={copyPrompt}
					disabled={!prompt || Boolean(disabledReason)}
					className="inline-flex border border-product-accent bg-product-chip px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-product-accent transition-colors hover:bg-product-accent hover:text-product-bg disabled:cursor-not-allowed disabled:border-product-border disabled:bg-product-surface disabled:text-product-muted"
				>
					{copyState === "copied" ? "Copied" : "Copy prompt"}
				</button>
				{copyState === "error" && prompt && !disabledReason ? (
					<p className="text-[11px] leading-relaxed text-product-muted">
						Clipboard unavailable. Copy from the prompt block below.
					</p>
				) : null}
			</div>
			<div className="mt-3 border border-product-border/70 bg-product-surface px-3 py-3">
				{prompt ? (
					<textarea
						readOnly
						value={prompt}
						rows={18}
						className="w-full resize-y border-0 bg-transparent p-0 font-mono text-[11px] leading-relaxed text-product-text outline-none"
						aria-label="Build kickoff prompt"
					/>
				) : (
					<p className="text-[11px] leading-relaxed text-product-muted">
						The build prompt will appear here once the path, first slice, and
						definition of done are saved.
					</p>
				)}
			</div>
		</WorkbenchCard>
	);
}
