"use client";

import { useEffect, useRef, useState } from "react";

import { timingConfig } from "@/config/product";
import { WorkbenchCard } from "../../shared/workbench-card";

export function BuildPromptCard({
	prompt,
	disabledReason,
	readyToGenerate,
	resetKey,
}: {
	prompt: string | null;
	disabledReason: string | null;
	readyToGenerate: boolean;
	resetKey: string;
}) {
	const [showPrompt, setShowPrompt] = useState(false);
	const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
		"idle",
	);
	const resetTimeoutRef = useRef<number | null>(null);
	const promptResetKeyRef = useRef<string | null>(null);
	const promptResetKey = [
		resetKey,
		readyToGenerate ? "ready" : "blocked",
		prompt ?? "",
		disabledReason ?? "",
	].join("::");

	useEffect(() => {
		return () => {
			if (resetTimeoutRef.current !== null) {
				window.clearTimeout(resetTimeoutRef.current);
			}
		};
	}, []);

	useEffect(() => {
		if (promptResetKeyRef.current === promptResetKey) {
			return;
		}

		promptResetKeyRef.current = promptResetKey;
		setShowPrompt(false);
		setCopyState("idle");
	}, [promptResetKey]);

	const copyPrompt = () => {
		if (
			!prompt ||
			disabledReason ||
			!showPrompt ||
			!navigator.clipboard?.writeText
		) {
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
				}, timingConfig.promptCopyResetMs);
			},
			() => setCopyState("error"),
		);
	};

	return (
		<WorkbenchCard label="Generate your build prompt">
			<p className="text-xs leading-relaxed text-product-muted">
				We combine your path, slice, and done condition into a copy-ready brief
				for your coding agent.
			</p>
			<div className="mt-3 flex flex-wrap items-center gap-2">
				<button
					type="button"
					onClick={() => setShowPrompt(true)}
					disabled={!readyToGenerate || !prompt || Boolean(disabledReason)}
					className="inline-flex border border-product-accent bg-product-chip px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-product-accent transition-colors hover:bg-product-accent hover:text-product-bg disabled:cursor-not-allowed disabled:border-product-border disabled:bg-product-surface disabled:text-product-muted"
				>
					Generate build prompt
				</button>
				{showPrompt ? (
					<button
						type="button"
						onClick={copyPrompt}
						disabled={!prompt || Boolean(disabledReason)}
						className="inline-flex border border-product-border bg-product-surface px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-product-text transition-colors hover:bg-product-surface-alt disabled:cursor-not-allowed disabled:border-product-border disabled:bg-product-surface disabled:text-product-muted"
					>
						{copyState === "copied" ? "Copied" : "Copy prompt"}
					</button>
				) : null}
				{copyState === "error" && prompt && !disabledReason && showPrompt ? (
					<p className="text-[11px] leading-relaxed text-product-muted">
						Clipboard unavailable. Copy from the prompt block below.
					</p>
				) : null}
			</div>
			{!readyToGenerate ? (
				<p className="mt-2 text-[11px] leading-relaxed text-product-muted">
					Complete Steps 1-3 to generate prompt.
				</p>
			) : null}
			{readyToGenerate && disabledReason ? (
				<p className="mt-2 text-[11px] leading-relaxed text-product-muted">
					{disabledReason}
				</p>
			) : null}
			<div className="mt-3 border border-product-border/70 bg-product-surface px-3 py-3">
				{showPrompt && prompt ? (
					<textarea
						readOnly
						value={prompt}
						rows={18}
						className="w-full resize-y border-0 bg-transparent p-0 font-mono text-[11px] leading-relaxed text-product-text outline-hidden"
						aria-label="Build kickoff prompt"
					/>
				) : (
					<p className="text-[11px] leading-relaxed text-product-muted">
						Your prompt will appear here after generation.
					</p>
				)}
			</div>
		</WorkbenchCard>
	);
}
