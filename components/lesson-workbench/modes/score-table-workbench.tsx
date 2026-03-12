import { useEffect, useRef, useState } from "react";

import {
	buildPromptImportFieldValues,
	getPromptTemplateState,
} from "@/lib/course/research-prompt";

import { FieldControl } from "../fields/field-control";
import { FieldList } from "../fields/field-list";
import { StatusRail } from "../shared/status-rail";
import { WorkbenchCard } from "../shared/workbench-card";
import { WorkbenchContainer } from "../shared/workbench-container";
import { WorkbenchHeader } from "../shared/workbench-header";
import type { WorkbenchModeProps } from "../types";

function PromptImportCard({
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

	const promptState = promptImport
		? getPromptTemplateState(promptImport.promptTemplateId, pinnedArtifacts)
		: { prompt: null, disabledReason: "This prompt import is not wired yet." };

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
		if (!promptImport) {
			return;
		}

		try {
			const nextFieldValues = buildPromptImportFieldValues(
				promptImport,
				pastedResponse,
			);
			for (const [fieldId, value] of Object.entries(nextFieldValues)) {
				onFieldChange(fieldId, value);
			}

			const importedRows = Array.isArray(
				nextFieldValues[promptImport.tableFieldId],
			)
				? (nextFieldValues[promptImport.tableFieldId] as string[][]).length
				: 0;
			setImportFeedback({
				tone: "success",
				message: `Imported ${importedRows} research ${importedRows === 1 ? "row" : "rows"}. You can edit the table and summary below.`,
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
		<WorkbenchCard
			title="Copy prompt -> paste result"
			eyebrow="Import research"
		>
			<div className="space-y-4">
				<ol className="space-y-1 text-sm leading-relaxed text-product-text">
					<li>1. Copy the prompt built from your chosen user and outcome.</li>
					<li>2. Run it in ChatGPT Deep Research or another frontier model.</li>
					<li>3. Paste the full response back here to fill the table below.</li>
				</ol>

				{promptState.disabledReason ? (
					<p className="text-xs font-medium leading-snug text-product-muted">
						{promptState.disabledReason}
					</p>
				) : (
					<p className="text-xs font-medium leading-snug text-product-muted">
						Built from your saved user and outcome so the research stays narrow
						and decision-useful.
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
							The prompt will appear here once your chosen user and outcome are
							saved.
						</p>
					)}
				</div>

				<label className="block">
					<span className="font-display text-sm uppercase tracking-[0.04em] text-product-text">
						Paste ChatGPT response
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
						placeholder="Paste the full response with both sections: Research Table and Key pattern I noticed."
						className="mt-1.5 w-full rounded-none border border-product-border bg-product-surface px-3 py-2 text-sm leading-relaxed text-product-text outline-none transition-colors placeholder:text-product-muted/55 focus-visible:border-product-accent"
						aria-label="Paste ChatGPT response"
					/>
				</label>

				<div className="flex flex-wrap items-center gap-2">
					<button
						type="button"
						onClick={importResponse}
						disabled={pastedResponse.trim().length === 0}
						className="rounded-none border border-product-border bg-product-surface px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-product-text transition-colors hover:border-product-accent hover:text-product-accent focus-visible:border-product-accent focus-visible:text-product-accent focus-visible:outline-none disabled:cursor-not-allowed disabled:border-product-border/70 disabled:text-product-muted"
					>
						Import into table
					</button>
					<p className="text-[11px] font-medium leading-snug text-product-muted">
						The import replaces the saved research rows and summary, then you
						can clean them up below.
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

export function ScoreTableWorkbench({
	lesson,
	lessonContent,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
	fields,
	objectiveTasks,
	completedTaskCount,
}: WorkbenchModeProps) {
	const promptImport = lesson.promptImport;
	const tableField = promptImport
		? (fields.find((field) => field.id === promptImport.tableFieldId) ??
			fields[0])
		: fields[0];
	const restFields = promptImport
		? fields.filter((field) => field.id !== promptImport.tableFieldId)
		: fields.slice(1);

	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<StatusRail
				lessonContent={lessonContent}
				completedTaskCount={completedTaskCount}
				totalTaskCount={Math.max(objectiveTasks.length, 1)}
			/>
			{promptImport ? (
				<PromptImportCard
					lesson={lesson}
					onFieldChange={onFieldChange}
					pinnedArtifacts={pinnedArtifacts}
				/>
			) : null}
			{tableField ? (
				<WorkbenchCard eyebrow="Research table">
					<FieldControl
						field={tableField}
						value={fieldValues[tableField.id]}
						onChange={(value) => onFieldChange(tableField.id, value)}
						pinnedArtifacts={pinnedArtifacts}
						showLabel={false}
					/>
				</WorkbenchCard>
			) : null}
			<FieldList
				fields={restFields}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				pinnedArtifacts={pinnedArtifacts}
				invalidFieldIds={invalidFieldIds}
				className={
					restFields.length > 1 ? "grid gap-2 md:grid-cols-2" : "space-y-2"
				}
			/>
		</WorkbenchContainer>
	);
}
