import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRouteConfig, timingConfig } from "@/config/product";
import { assertNever } from "@/features/course/lesson/lib/assert";
import type {
	LessonPromptImport,
	LessonPromptTemplateId,
} from "@/features/course/lesson/model/contracts";
import {
	buildPromptImportFieldValues,
	getPromptTemplateState,
} from "@/features/course/lesson/model/research-prompt";

import type { WorkbenchModeProps } from "../types";
import { WorkbenchCard } from "./workbench-card";
import { workbenchChromeLabelClass } from "./workbench-readability";

type PromptImportUiCopy = {
	cardLabel: string;
	summary: string;
	workflowHint: string;
	enabledNote: string;
	launcherLabel?: string;
	collapsedByDefault?: boolean;
	pasteLabel: string;
	pastePlaceholder: string;
	pasteToggleLabel: string;
	importButtonLabel: string;
	importHint: string;
};

export type PromptImportAppliedContext = {
	promptTemplateId: LessonPromptImport["promptTemplateId"];
	source: "pasted" | "generated";
	rawResponse: string;
	nextFieldValues: Record<string, unknown>;
};

const PROMPT_IMPORT_COPY: Record<
	LessonPromptImport["promptTemplateId"],
	PromptImportUiCopy
> = {
	competitor_research: {
		cardLabel: "Need a fast AI starter?",
		summary:
			"Start with 2-3 quick manual scans. Use AI only if you want a starter draft after you know what you are looking for.",
		workflowHint:
			"Scan real solutions first, then use AI to speed up row drafting or sharpen the final decision.",
		enabledNote:
			"Built from your saved user and outcome so the research stays narrow and decision-useful.",
		launcherLabel: "Use AI starter",
		collapsedByDefault: true,
		pasteLabel: "Paste ChatGPT response",
		pastePlaceholder:
			"Paste the full response with both sections: Research Table and What this means for my v1.",
		pasteToggleLabel: "Paste result",
		importButtonLabel: "Import into table",
		importHint:
			"The import replaces the saved research rows and v1 decision, then you can tighten the evidence and judgment below.",
	},
	scope_boundary: {
		cardLabel: "Need a backup cut?",
		summary:
			"Start manually. Use backup assist only if you need a first-pass scope cut to react to.",
		workflowHint:
			"It uses your saved user, outcome, research, and core flow. Generated or pasted results replace the saved draft below until you tighten them.",
		enabledNote:
			"Built from your earlier CEO work so you start from a tight recommendation instead of another blank scope form.",
		launcherLabel: "Open backup assist",
		collapsedByDefault: true,
		pasteLabel: "Paste ChatGPT scope cut",
		pastePlaceholder:
			"Paste the full response with these sections: Keep in v1, Cut from v1, and Why this version is enough.",
		pasteToggleLabel: "Paste scope cut",
		importButtonLabel: "Import scope cut",
		importHint:
			"The import replaces your saved keep/cut lists and rationale, then you can tighten them below.",
	},
	visual_direction_guide: {
		cardLabel: "AI assist",
		summary:
			"Copy or generate a first-pass `visualguide.md`, then paste it back here and edit the saved markdown below.",
		workflowHint:
			"Copy or generate the guide, paste the markdown, then clean it up below.",
		enabledNote:
			"Built from your rough screens and the direction note you wrote above so the guide stays tied to the product you actually plan to build.",
		pasteLabel: "Paste visualguide.md markdown",
		pastePlaceholder:
			"Paste the raw contents of visualguide.md or one fenced markdown block with only that file inside.",
		pasteToggleLabel: "Paste visualguide.md",
		importButtonLabel: "Save visualguide.md",
		importHint:
			"The import stores the markdown in this lesson so Build can start from the saved visual direction instead of guesswork.",
	},
};

type PromptImportFeedback =
	| { tone: "success"; message: string }
	| { tone: "error"; message: string };

type ActivePanel = "prompt" | "paste" | null;

function getImportSuccessMessage(
	nextFieldValues: Record<string, unknown>,
	promptImport: LessonPromptImport,
) {
	switch (promptImport.promptTemplateId) {
		case "competitor_research": {
			const importedRows = Array.isArray(
				nextFieldValues[promptImport.tableFieldId],
			)
				? (nextFieldValues[promptImport.tableFieldId] as string[][]).length
				: 0;

			return `Imported ${importedRows} research ${importedRows === 1 ? "row" : "rows"}. Tighten the evidence and v1 decision below.`;
		}
		case "scope_boundary": {
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
		}
		case "visual_direction_guide": {
			const markdown = nextFieldValues[promptImport.markdownFieldId];
			const lineCount =
				typeof markdown === "string"
					? markdown.split(/\r?\n/u).filter((line) => line.trim().length > 0)
							.length
					: 0;

			return `Saved visualguide.md with ${lineCount} non-empty ${
				lineCount === 1 ? "line" : "lines"
			}. You can keep editing the saved markdown below.`;
		}
	}

	return assertNever(
		promptImport,
		"Unhandled prompt import template",
	);
}

export function PromptImportCard({
	lesson,
	onFieldChange,
	pinnedArtifacts,
	fieldValues,
	onImportApplied,
}: Pick<
	WorkbenchModeProps,
	"lesson" | "onFieldChange" | "pinnedArtifacts" | "fieldValues"
> & {
	onImportApplied?: (context: PromptImportAppliedContext) => void;
}) {
	if (!lesson.promptImport) {
		return null;
	}

	return (
		<PromptImportCardBody
			lesson={lesson}
			promptImport={lesson.promptImport}
			onFieldChange={onFieldChange}
			pinnedArtifacts={pinnedArtifacts}
			fieldValues={fieldValues}
			onImportApplied={onImportApplied}
		/>
	);
}

function PromptImportCardBody({
	lesson,
	promptImport,
	onFieldChange,
	pinnedArtifacts,
	fieldValues,
	onImportApplied,
}: Pick<
	WorkbenchModeProps,
	"lesson" | "onFieldChange" | "pinnedArtifacts" | "fieldValues"
> & {
	promptImport: LessonPromptImport;
	onImportApplied?: (context: PromptImportAppliedContext) => void;
}) {
	const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
		"idle",
	);
	const [pastedResponse, setPastedResponse] = useState("");
	const [importFeedback, setImportFeedback] =
		useState<PromptImportFeedback | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [isAssistToolsOpen, setIsAssistToolsOpen] = useState(
		!PROMPT_IMPORT_COPY[promptImport.promptTemplateId].collapsedByDefault,
	);
	const [activePanel, setActivePanel] = useState<ActivePanel>(null);
	const resetTimeoutRef = useRef<number | null>(null);
	const promptState = getPromptTemplateState(
		promptImport.promptTemplateId,
		pinnedArtifacts,
		fieldValues,
	);
	const uiCopy = PROMPT_IMPORT_COPY[promptImport.promptTemplateId];

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
	}, [promptState.disabledReason, promptState.prompt]);

	const copyPrompt = () => {
		if (!promptState.prompt || promptState.disabledReason) {
			return;
		}

		if (!navigator.clipboard?.writeText) {
			setCopyState("error");
			setIsAssistToolsOpen(true);
			setActivePanel("prompt");
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
				}, timingConfig.promptCopyResetMs);
			},
			() => {
				setCopyState("error");
				setIsAssistToolsOpen(true);
				setActivePanel("prompt");
			},
		);
	};

	const toggleAssistTools = () => {
		setIsAssistToolsOpen((current) => {
			if (current) {
				setActivePanel(null);
			}

			return !current;
		});
	};

	const togglePanel = (panel: Exclude<ActivePanel, null>) => {
		setIsAssistToolsOpen(true);
		setActivePanel((current) => (current === panel ? null : panel));
	};

	const applyImportedResponse = (
		rawResponse: string,
		sourceLabel: string,
		source: PromptImportAppliedContext["source"],
	) => {
		try {
			const nextFieldValues = buildPromptImportFieldValues(
				promptImport,
				rawResponse,
			);
			for (const [fieldId, value] of Object.entries(nextFieldValues)) {
				onFieldChange(fieldId, value);
			}

			setPastedResponse(rawResponse);
			setActivePanel(null);
			setIsAssistToolsOpen(true);
			onImportApplied?.({
				promptTemplateId: promptImport.promptTemplateId,
				source,
				rawResponse,
				nextFieldValues,
			});
			setImportFeedback({
				tone: "success",
				message: `${sourceLabel}: ${getImportSuccessMessage(nextFieldValues, promptImport)}`,
			});
		} catch (error) {
			setImportFeedback({
				tone: "error",
				message:
					error instanceof Error
						? error.message
						: "We could not parse that response. Paste the full ChatGPT output and try again.",
			});
			setIsAssistToolsOpen(true);
			setActivePanel("paste");
		}
	};

	const importResponse = () => {
		applyImportedResponse(pastedResponse, "Imported", "pasted");
	};

	const generateWithCodex = async () => {
		if (!promptState.prompt || promptState.disabledReason) {
			return;
		}

		setIsGenerating(true);
		setImportFeedback(null);

		try {
			const response = await fetch(apiRouteConfig.codexGenerate, {
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

			applyImportedResponse(data.output, "Generated with Codex", "generated");
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
			<div className="space-y-3">
				<div className="space-y-1.5">
					<p className="text-[14px] leading-[1.7] text-product-text">
						{uiCopy.summary}
					</p>
					<p className="text-[13px] leading-[1.7] text-product-muted">
						{uiCopy.workflowHint}
					</p>
				</div>

				{promptState.disabledReason ? (
					<p className="text-[13px] leading-[1.7] text-product-muted">
						{promptState.disabledReason}
					</p>
				) : (
					<p className="text-[13px] leading-[1.7] text-product-muted">
						{uiCopy.enabledNote}
					</p>
				)}

				<div className="flex flex-wrap items-center gap-2">
					{uiCopy.collapsedByDefault ? (
						<Button
							type="button"
							onClick={toggleAssistTools}
							variant="outline"
							size="xs"
						>
							{isAssistToolsOpen
								? "Hide AI starter"
								: (uiCopy.launcherLabel ?? "Open AI assist")}
						</Button>
					) : null}
					{isAssistToolsOpen ? (
						<>
							<Button
								type="button"
								onClick={copyPrompt}
								disabled={Boolean(promptState.disabledReason)}
								variant="secondary"
								size="xs"
							>
								{copyState === "copied" ? "Copied" : "Copy prompt"}
							</Button>
							<Button
								type="button"
								onClick={() => void generateWithCodex()}
								disabled={Boolean(promptState.disabledReason) || isGenerating}
								variant="outline"
								size="xs"
							>
								{isGenerating ? "Generating..." : "Generate with Codex"}
							</Button>
							<Button
								type="button"
								onClick={() => togglePanel("paste")}
								variant="outline"
								size="xs"
							>
								{activePanel === "paste"
									? "Hide paste box"
									: uiCopy.pasteToggleLabel}
							</Button>
							<Button
								type="button"
								onClick={() => togglePanel("prompt")}
								variant="outline"
								size="xs"
							>
								{activePanel === "prompt" ? "Hide prompt" : "View prompt"}
							</Button>
						</>
					) : null}
					{copyState === "error" && !promptState.disabledReason ? (
						<p className="text-[12px] leading-[1.6] text-product-muted">
							Clipboard unavailable. Copy from the prompt block below.
						</p>
					) : null}
				</div>

				{isAssistToolsOpen && activePanel === "prompt" ? (
					<div className="rounded-none border border-product-border/65 bg-product-surface px-3 py-3">
						{promptState.prompt ? (
							<Textarea
								readOnly
								value={promptState.prompt}
								rows={12}
								className="w-full resize-y border-0 bg-transparent p-0 font-mono text-[12px] leading-[1.68] text-product-text"
								aria-label={`${lesson.title} prompt`}
							/>
						) : (
							<p className="text-[12px] leading-[1.6] text-product-muted">
								The prompt will appear here once the required lesson context is
								saved.
							</p>
						)}
					</div>
				) : null}

				{isAssistToolsOpen && activePanel === "paste" ? (
					<div className="space-y-3 rounded-none border border-product-border/65 bg-product-surface px-4 py-4">
						<label className="block">
							<span className={workbenchChromeLabelClass}>
								{uiCopy.pasteLabel}
							</span>
							<Textarea
								value={pastedResponse}
								onChange={(event) => {
									setPastedResponse(event.target.value);
									if (importFeedback) {
										setImportFeedback(null);
									}
								}}
								rows={8}
								placeholder={uiCopy.pastePlaceholder}
								className="mt-2"
								aria-label={uiCopy.pasteLabel}
							/>
						</label>

						<div className="flex flex-wrap items-center gap-2">
							<Button
								type="button"
								onClick={importResponse}
								disabled={pastedResponse.trim().length === 0}
								variant="outline"
								size="sm"
							>
								{uiCopy.importButtonLabel}
							</Button>
							<p className="text-[12px] leading-[1.6] text-product-muted">
								{uiCopy.importHint}
							</p>
						</div>
					</div>
				) : null}

				<div aria-live="polite" className="min-h-[1.25rem]">
					{importFeedback ? (
						<p
							className={`text-[12px] leading-[1.6] ${
								importFeedback.tone === "success"
									? "text-product-accent"
									: "text-danger"
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
