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

			const keepCount = Array.isArray(
				nextFieldValues[promptImport.inScopeFieldId],
			)
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
	visual_direction_guide: {
		cardLabel: "Copy prompt -> paste visualguide.md",
		steps: [
			"Copy the prompt built from your saved references and direction note.",
			"Run it in your preferred coding agent to generate `visualguide.md`.",
			"Paste the returned markdown back here so this lesson can save and preview it.",
		],
		enabledNote:
			"Built from your saved references and the direction note you wrote above so the guide stays tied to the look you actually want.",
		pasteLabel: "Paste visualguide.md markdown",
		pastePlaceholder:
			"Paste the raw contents of visualguide.md or one fenced markdown block with only that file inside.",
		importButtonLabel: "Save visualguide.md",
		importHint:
			"The import stores the markdown in this lesson so `2.7` can preview the visual direction cleanly.",
		getSuccessMessage: (nextFieldValues, promptImport) => {
			if (promptImport.promptTemplateId !== "visual_direction_guide") {
				return "Imported suggestions. You can edit the fields below.";
			}

			const markdown = nextFieldValues[promptImport.markdownFieldId];
			const lineCount =
				typeof markdown === "string"
					? markdown.split(/\r?\n/u).filter((line) => line.trim().length > 0)
							.length
					: 0;

			return `Saved visualguide.md with ${lineCount} non-empty ${
				lineCount === 1 ? "line" : "lines"
			}. You can keep editing the saved markdown below.`;
		},
	},
	build_kickoff_prompt: {
		cardLabel: "Build kickoff prompts stay in the workbench",
		steps: [
			"Use the dedicated build kickoff workbench instead of this shared import flow.",
			"Choose a starting path, define the first slice, and copy the generated prompt there.",
			"Do not paste anything back into this card.",
		],
		enabledNote:
			"Build kickoff prompts are copy-only and do not support pasteback import.",
		pasteLabel: "Not used",
		pastePlaceholder:
			"Build kickoff prompts do not support pasteback import in this shared card.",
		importButtonLabel: "Not supported",
		importHint:
			"Use the build kickoff workbench instead of the shared prompt-import flow.",
		getSuccessMessage: () =>
			"Build kickoff prompts do not support pasteback import.",
	},
};

export function PromptImportCard({
	lesson,
	onFieldChange,
	pinnedArtifacts,
	fieldValues,
}: Pick<
	WorkbenchModeProps,
	"lesson" | "onFieldChange" | "pinnedArtifacts" | "fieldValues"
>) {
	const promptImport = lesson.promptImport;
	const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
		"idle",
	);
	const [pastedResponse, setPastedResponse] = useState("");
	const [importFeedback, setImportFeedback] = useState<{
		tone: "success" | "error";
		message: string;
	} | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const resetTimeoutRef = useRef<number | null>(null);
	const promptTemplateId =
		promptImport?.promptTemplateId ?? "competitor_research";
	const promptState = promptImport
		? getPromptTemplateState(
				promptImport.promptTemplateId,
				pinnedArtifacts,
				fieldValues as any,
			)
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

	const applyImportedResponse = (rawResponse: string, source: string) => {
		try {
			const nextFieldValues = buildPromptImportFieldValues(
				promptImport,
				rawResponse,
			);
			for (const [fieldId, value] of Object.entries(nextFieldValues)) {
				onFieldChange(fieldId, value);
			}

			setPastedResponse(rawResponse);
			setImportFeedback({
				tone: "success",
				message: `${source}: ${uiCopy.getSuccessMessage(nextFieldValues, promptImport)}`,
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

	const importResponse = () => {
		applyImportedResponse(pastedResponse, "Imported");
	};

	const generateWithCodex = async () => {
		if (!promptState.prompt || promptState.disabledReason) {
			return;
		}

		setIsGenerating(true);
		setImportFeedback(null);

		try {
			const response = await fetch("/api/codex/generate", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					templateId: promptImport.promptTemplateId,
					prompt: promptState.prompt,
					lessonId: lesson.id,
				}),
			});
			const data = (await response.json().catch(() => null)) as {
				output?: string;
				error?: string;
				code?: string;
			} | null;

			if (!response.ok || !data?.output) {
				const message =
					data?.code === "account_not_connected"
						? "Connect your Codex account in Settings before generating."
						: (data?.error ?? "Unable to generate with Codex right now.");
				setImportFeedback({
					tone: "error",
					message,
				});
				return;
			}

			applyImportedResponse(data.output, "Generated with Codex");
		} catch {
			setImportFeedback({
				tone: "error",
				message: "Unable to generate with Codex right now.",
			});
		} finally {
			setIsGenerating(false);
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
					<button
						type="button"
						onClick={() => void generateWithCodex()}
						disabled={Boolean(promptState.disabledReason) || isGenerating}
						className="rounded-none border border-product-border bg-product-surface px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-product-text transition-colors hover:border-product-accent hover:text-product-accent disabled:cursor-not-allowed disabled:border-product-border disabled:text-product-muted"
					>
						{isGenerating ? "Generating..." : "Generate with Codex"}
					</button>
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
							The prompt will appear here once the required lesson context is
							saved.
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
