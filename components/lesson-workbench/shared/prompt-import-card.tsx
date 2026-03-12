import { useEffect, useRef, useState } from "react";

import type {
	LessonPromptImport,
	LessonPromptTemplateId,
} from "@/lib/course/contracts";
import {
	buildPromptImportFieldValues,
	getPromptTemplateState,
} from "@/lib/course/research-prompt";

import type { WorkbenchModeProps } from "../types";
import { WorkbenchCard } from "./workbench-card";

type PromptImportUiCopy = {
	cardLabel: string;
	steps: [string, string, string];
	enabledNote: string;
	pasteLabel: string;
	pastePlaceholder: string;
	importButtonLabel: string;
	importHint: string;
	getSuccessMessage: (
		nextFieldValues: Record<string, unknown>,
		promptImport: LessonPromptImport,
	) => string;
};

const PROMPT_IMPORT_COPY: Record<LessonPromptTemplateId, PromptImportUiCopy> = {
	competitor_research: {
		cardLabel: "Copy prompt -> paste result",
		steps: [
			"Copy the prompt built from your chosen user and outcome.",
			"Run it in ChatGPT Deep Research or another frontier model.",
			"Paste the full response back here to fill the table below.",
		],
		enabledNote:
			"Built from your saved user and outcome so the research stays narrow and decision-useful.",
		pasteLabel: "Paste ChatGPT response",
		pastePlaceholder:
			"Paste the full response with both sections: Research Table and Key pattern I noticed.",
		importButtonLabel: "Import into table",
		importHint:
			"The import replaces the saved research rows and summary, then you can clean them up below.",
		getSuccessMessage: (nextFieldValues, promptImport) => {
			if (promptImport.promptTemplateId !== "competitor_research") {
				return "Imported suggestions. You can edit the fields below.";
			}

			const importedRows = Array.isArray(
				nextFieldValues[promptImport.tableFieldId],
			)
				? (nextFieldValues[promptImport.tableFieldId] as string[][]).length
				: 0;

			return `Imported ${importedRows} research ${importedRows === 1 ? "row" : "rows"}. You can edit the table and summary below.`;
		},
	},
	scope_boundary: {
		cardLabel: "Copy prompt -> paste scope cut",
		steps: [
			"Copy the scope-cut prompt built from your saved problem, user, outcome, and research.",
			"Run it in ChatGPT or another strong model to get a first-pass MVP cut.",
			"Paste the full response back here to fill the keep, cut, and rationale fields below.",
		],
		enabledNote:
			"Built from your earlier CEO work so you start from a tight recommendation instead of another blank scope form.",
		pasteLabel: "Paste ChatGPT scope cut",
		pastePlaceholder:
			"Paste the full response with these sections: Keep in v1, Cut from v1, and Why this version is enough.",
		importButtonLabel: "Import scope cut",
		importHint:
			"The import replaces your saved keep/cut lists and rationale, then you can tighten them below.",
		getSuccessMessage: (nextFieldValues, promptImport) => {
			if (promptImport.promptTemplateId !== "scope_boundary") {
				return "Imported suggestions. You can edit the fields below.";
			}

			const keepCount = Array.isArray(nextFieldValues[promptImport.inScopeFieldId])
				? (nextFieldValues[promptImport.inScopeFieldId] as string[]).length
				: 0;
			const cutCount = Array.isArray(
				nextFieldValues[promptImport.outOfScopeFieldId],
			)
				? (nextFieldValues[promptImport.outOfScopeFieldId] as string[]).length
				: 0;

			return `Imported ${keepCount} keep ${keepCount === 1 ? "item" : "items"}, ${cutCount} cut ${
				cutCount === 1 ? "item" : "items"
			}, and a v1 rationale. You can tighten everything below.`;
		},
	},
};

export function PromptImportCard({
	lesson,
	onFieldChange,
	pinnedArtifacts,
}: Pick<WorkbenchModeProps, "lesson" | "onFieldChange" | "pinnedArtifacts">) {
	const promptImport = lesson.promptImport;
	const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
		"idle",
	);
	const [pastedResponse, setPastedResponse] = useState("");
	const [importFeedback, setImportFeedback] = useState<{
		tone: "success" | "error";
		message: string;
	} | null>(null);
	const resetTimeoutRef = useRef<number | null>(null);
	const promptTemplateId = promptImport?.promptTemplateId ?? "competitor_research";
	const promptState = promptImport
		? getPromptTemplateState(promptImport.promptTemplateId, pinnedArtifacts)
		: { prompt: null, disabledReason: "This prompt import is not wired yet." };
	const uiCopy = PROMPT_IMPORT_COPY[promptTemplateId];

	useEffect(() => {
		return () => {
			if (resetTimeoutRef.current !== null) {
				window.clearTimeout(resetTimeoutRef.current);
			}
		};
	}, []);

	useEffect(() => {
		setCopyState("idle");
		setImportFeedback(null);
	}, [promptState.prompt, promptState.disabledReason]);

	if (!promptImport) {
		return null;
	}

	const copyPrompt = () => {
		if (!promptState.prompt || promptState.disabledReason) {
			return;
		}

		if (!navigator.clipboard?.writeText) {
			setCopyState("error");
			return;
		}

		void navigator.clipboard.writeText(promptState.prompt).then(
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
			() => {
				setCopyState("error");
			},
		);
	};

	const importResponse = () => {
		try {
			const nextFieldValues = buildPromptImportFieldValues(
				promptImport,
				pastedResponse,
			);
			for (const [fieldId, value] of Object.entries(nextFieldValues)) {
				onFieldChange(fieldId, value);
			}

			setImportFeedback({
				tone: "success",
				message: uiCopy.getSuccessMessage(nextFieldValues, promptImport),
			});
		} catch (error) {
			setImportFeedback({
				tone: "error",
				message:
					error instanceof Error
						? error.message
						: "We could not parse that response. Paste the full ChatGPT output and try again.",
			});
		}
	};

	return (
		<WorkbenchCard label={uiCopy.cardLabel}>
			<div className="space-y-4">
				<ol className="space-y-1 text-sm leading-relaxed text-product-text">
					{uiCopy.steps.map((step, index) => (
						<li key={step}>
							{index + 1}. {step}
						</li>
					))}
				</ol>

				{promptState.disabledReason ? (
					<p className="text-xs font-medium leading-snug text-product-muted">
						{promptState.disabledReason}
					</p>
				) : (
					<p className="text-xs font-medium leading-snug text-product-muted">
						{uiCopy.enabledNote}
					</p>
				)}

				<div className="flex flex-wrap items-center gap-2">
					<button
						type="button"
						onClick={copyPrompt}
						disabled={Boolean(promptState.disabledReason)}
						className="rounded-none border border-product-accent bg-product-chip px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-product-accent transition-colors hover:bg-product-accent hover:text-product-bg disabled:cursor-not-allowed disabled:border-product-border disabled:bg-product-surface disabled:text-product-muted"
					>
						{copyState === "copied" ? "Copied" : "Copy prompt"}
					</button>
					{copyState === "error" && !promptState.disabledReason ? (
						<p className="text-[11px] font-medium leading-snug text-product-muted">
							Clipboard unavailable. Copy from the prompt block below.
						</p>
					) : null}
				</div>

				<div className="rounded-none border border-product-border/80 bg-product-surface px-2 py-2">
					{promptState.prompt ? (
						<textarea
							readOnly
							value={promptState.prompt}
							rows={14}
							className="w-full resize-y border-0 bg-transparent p-0 font-mono text-[11px] leading-relaxed text-product-text outline-none"
							aria-label={`${lesson.title} prompt`}
						/>
					) : (
						<p className="text-[11px] font-medium leading-snug text-product-muted">
							The prompt will appear here once the earlier CEO context is saved.
						</p>
					)}
				</div>

				<label className="block">
					<span className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
						{uiCopy.pasteLabel}
					</span>
					<textarea
						value={pastedResponse}
						onChange={(event) => {
							setPastedResponse(event.target.value);
							if (importFeedback) {
								setImportFeedback(null);
							}
						}}
						rows={10}
						placeholder={uiCopy.pastePlaceholder}
						className="mt-1.5 w-full rounded-none border border-product-border bg-product-surface px-3 py-2 text-sm leading-relaxed text-product-text outline-none transition-colors placeholder:text-product-muted/55 focus-visible:border-product-accent"
						aria-label={uiCopy.pasteLabel}
					/>
				</label>

				<div className="flex flex-wrap items-center gap-2">
					<button
						type="button"
						onClick={importResponse}
						disabled={pastedResponse.trim().length === 0}
						className="rounded-none border border-product-border bg-product-surface px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-product-text transition-colors hover:border-product-accent hover:text-product-accent focus-visible:border-product-accent focus-visible:text-product-accent focus-visible:outline-none disabled:cursor-not-allowed disabled:border-product-border/70 disabled:text-product-muted"
					>
						{uiCopy.importButtonLabel}
					</button>
					<p className="text-[11px] font-medium leading-snug text-product-muted">
						{uiCopy.importHint}
					</p>
				</div>

				<div aria-live="polite" className="min-h-[1.25rem]">
					{importFeedback ? (
						<p
							className={`text-[11px] font-medium leading-snug ${
								importFeedback.tone === "success"
									? "text-product-accent"
									: "text-[#a83232]"
							}`}
						>
							{importFeedback.message}
						</p>
					) : null}
				</div>
			</div>
		</WorkbenchCard>
	);
}
