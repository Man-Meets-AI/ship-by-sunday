"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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

	useEffect(() => {
		return () => {
			if (resetTimeoutRef.current !== null) {
				window.clearTimeout(resetTimeoutRef.current);
			}
		};
	}, []);

	useEffect(() => {
		setShowPrompt(false);
		setCopyState("idle");
	}, [disabledReason, prompt, readyToGenerate, resetKey]);

	const copyPrompt = () => {
		if (!prompt || disabledReason || !showPrompt) {
			return;
		}

		if (!navigator.clipboard?.writeText) {
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
			<p className="text-xs leading-relaxed text-muted-foreground">
				We combine your path, slice, and done condition into a copy-ready brief
				for your coding agent.
			</p>
			<div className="mt-3 flex flex-wrap items-center gap-2">
				<Button
					type="button"
					onClick={() => setShowPrompt(true)}
					disabled={!readyToGenerate || !prompt || Boolean(disabledReason)}
					variant="secondary"
					size="sm"
				>
					Generate build prompt
				</Button>
				{showPrompt ? (
					<Button
						type="button"
						onClick={copyPrompt}
						disabled={!prompt || Boolean(disabledReason)}
						variant="outline"
						size="sm"
					>
						{copyState === "copied" ? "Copied" : "Copy prompt"}
					</Button>
				) : null}
				{copyState === "error" && prompt && !disabledReason && showPrompt ? (
					<p className="text-[11px] leading-relaxed text-muted-foreground">
						Clipboard unavailable. Copy from the prompt block below.
					</p>
				) : null}
			</div>
			{!readyToGenerate ? (
				<p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
					Complete Steps 1-3 to generate prompt.
				</p>
			) : null}
			{readyToGenerate && disabledReason ? (
				<p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
					{disabledReason}
				</p>
			) : null}
			<div className="mt-3 rounded-lg border border-border bg-background px-3 py-3">
				{showPrompt && prompt ? (
					<Textarea
						readOnly
						value={prompt}
						rows={18}
						className="w-full resize-y border-0 bg-transparent p-0 font-mono text-[11px] leading-relaxed text-foreground"
						aria-label="Build kickoff prompt"
					/>
				) : (
					<p className="text-[11px] leading-relaxed text-muted-foreground">
						Your prompt will appear here after generation.
					</p>
				)}
			</div>
		</WorkbenchCard>
	);
}
