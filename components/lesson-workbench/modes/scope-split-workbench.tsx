import { CORE_FLOW_IMAGE_FIELD_ID } from "@/lib/course/core-flow";

import type { WorkbenchModeProps } from "../types";
import { FieldControl } from "../fields/field-control";
import { FieldList } from "../fields/field-list";
import { PromptImportCard } from "../shared/prompt-import-card";
import { StatusRail } from "../shared/status-rail";
import { WorkbenchCard } from "../shared/workbench-card";
import { WorkbenchContainer } from "../shared/workbench-container";
import { WorkbenchHeader } from "../shared/workbench-header";

function getPinnedTextValue(
	pinnedArtifacts: WorkbenchModeProps["pinnedArtifacts"],
	artifactKey: string,
	fieldId: string,
) {
	const artifact = pinnedArtifacts.find(
		(candidate) => candidate.artifactKey === artifactKey,
	);
	const value = artifact?.fieldValues?.[fieldId];
	if (typeof value !== "string") {
		return null;
	}

	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

function getPinnedCoreFlowImageUrl(
	pinnedArtifacts: WorkbenchModeProps["pinnedArtifacts"],
) {
	const artifact = pinnedArtifacts.find(
		(candidate) => candidate.artifactKey === "core_flow_image",
	);
	const upload = artifact?.fieldValues?.[CORE_FLOW_IMAGE_FIELD_ID];
	if (!upload || typeof upload !== "object" || Array.isArray(upload)) {
		return null;
	}

	const candidate = upload as { url?: unknown };
	return typeof candidate.url === "string" && candidate.url.trim().length > 0
		? candidate.url
		: null;
}

function countFilledItems(value: unknown) {
	if (!Array.isArray(value)) {
		return 0;
	}

	return value.filter(
		(item): item is string =>
			typeof item === "string" && item.trim().length > 0,
	).length;
}

export function ScopeSplitWorkbench({
	lesson,
	lessonContent,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
	invalidFieldMessages,
	fields,
	objectiveTasks,
	completedTaskCount,
}: WorkbenchModeProps) {
	const [leftField, rightField, ...restFields] = fields;
	const chosenUser = getPinnedTextValue(
		pinnedArtifacts,
		"user_statement",
		"selected_problem_owner",
	);
	const chosenProblem = getPinnedTextValue(
		pinnedArtifacts,
		"user_statement",
		"selected_problem_statement",
	);
	const promisedOutcome = getPinnedTextValue(
		pinnedArtifacts,
		"outcome_statement",
		"outcome",
	);
	const coreFlowImageUrl = getPinnedCoreFlowImageUrl(pinnedArtifacts);
	const keepCount = countFilledItems(fieldValues[leftField?.id ?? ""]);
	const cutCount = countFilledItems(fieldValues[rightField?.id ?? ""]);
	const keepSupport =
		keepCount > 5
			? "Cut harder. More than five keep items usually means the v1 is still too big."
			: keepCount >= 3
				? "Good. Keep only the essentials that make the promise true."
				: "Aim for 3-5 essentials that directly move the user through the core flow.";
	const cutSupport =
		cutCount >= 3
			? "Good. You have named the tempting extras that do not belong in v1."
			: "Name at least three tempting extras you are deliberately cutting.";
	const scopeSignal =
		keepCount >= 3 && keepCount <= 5 && cutCount >= 3
			? "Brutally small enough to defend"
			: "Not tight enough yet";

	const renderFieldCard = (
		field: NonNullable<typeof leftField>,
		countLabel: string,
		isHealthy: boolean,
		supportText: string,
	) => {
		const isInvalid = invalidFieldIds.has(field.id);

		return (
			<WorkbenchCard label={field.label}>
				<div className="space-y-3">
					<div className="flex flex-wrap items-start justify-between gap-2">
						<p className="max-w-xl text-[11px] leading-relaxed text-product-muted">
							{field.helpText}
						</p>
						<span
							className={`inline-flex items-center border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${
								isHealthy
									? "border-product-accent/40 bg-product-accent/[0.08] text-product-accent"
									: "border-product-border bg-product-surface text-product-text"
							}`}
						>
							{countLabel}
						</span>
					</div>
					<div
						className={
							isInvalid
								? "rounded-none border border-[#a83232] bg-[rgba(168,50,50,0.06)] p-3"
								: ""
						}
					>
						<FieldControl
							field={field}
							value={fieldValues[field.id]}
							onChange={(value) => onFieldChange(field.id, value)}
							pinnedArtifacts={pinnedArtifacts}
						/>
						<p className="mt-2 text-[11px] leading-relaxed text-product-muted">
							{supportText}
						</p>
						{isInvalid ? (
							<p className="mt-2 text-[11px] font-medium leading-snug text-[#a83232]">
								{invalidFieldMessages.get(field.id) ??
									"Finish this before continuing."}
							</p>
						) : null}
					</div>
				</div>
			</WorkbenchCard>
		);
	};

	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<StatusRail
				lessonContent={lessonContent}
				completedTaskCount={completedTaskCount}
				totalTaskCount={Math.max(objectiveTasks.length, 1)}
			/>
			{chosenUser || promisedOutcome || coreFlowImageUrl ? (
				<WorkbenchCard label="Scope against this">
					<div className="space-y-3">
						<p className="text-sm leading-relaxed text-product-text">
							Keep only the shortest path that gets this user to the promised
							win. If a feature does not help this flow happen by Sunday, cut
							it.
						</p>
						<div className="grid gap-2 lg:grid-cols-2">
							<div className="rounded-none border border-product-border/80 bg-product-surface-strong/70 px-3 py-2">
								<p className="font-mono text-[9px] uppercase tracking-[0.18em] text-product-muted">
									User
								</p>
								<p className="mt-1 text-sm leading-snug text-product-text">
									{chosenUser ?? "Use your saved user from 1.2."}
								</p>
								{chosenProblem ? (
									<p className="mt-1 text-[11px] leading-relaxed text-product-muted">
										Problem: {chosenProblem}
									</p>
								) : null}
							</div>
							<div className="rounded-none border border-product-border/80 bg-product-surface-strong/70 px-3 py-2">
								<p className="font-mono text-[9px] uppercase tracking-[0.18em] text-product-muted">
									Promise
								</p>
								<p className="mt-1 text-sm leading-snug text-product-text">
									{promisedOutcome ?? "Use your saved outcome from 1.3."}
								</p>
							</div>
						</div>
						{coreFlowImageUrl ? (
							<div className="rounded-none border border-product-border/80 bg-product-surface-strong/70 p-2">
								<div className="mb-2 flex flex-wrap items-center justify-between gap-2">
									<div>
										<p className="font-mono text-[9px] uppercase tracking-[0.18em] text-product-muted">
											Saved core flow
										</p>
										<p className="mt-1 text-[11px] leading-relaxed text-product-muted">
											Keep only what this flow needs to reach the win.
										</p>
									</div>
									<span className="inline-flex items-center border border-product-border bg-product-surface px-2 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-product-text">
										Use 1.5 as the cut line
									</span>
								</div>
								<img
									src={coreFlowImageUrl}
									alt="Saved core flow from lesson 1.5"
									className="w-full border border-product-border/70 bg-product-bg object-contain shadow-[0_6px_18px_rgba(var(--product-shadow),0.18)]"
									loading="lazy"
								/>
							</div>
						) : null}
					</div>
				</WorkbenchCard>
			) : null}
			<WorkbenchCard label="Sunday test">
				<div className="space-y-3">
					<p className="text-sm leading-relaxed text-product-text">
						You are proving the promise, not shipping the full fantasy. Keep the
						version that can credibly work in one weekend without side systems.
					</p>
					<div className="grid gap-2 md:grid-cols-3">
						<div className="rounded-none border border-product-border/80 bg-product-surface-strong/70 px-3 py-2">
							<p className="font-mono text-[9px] uppercase tracking-[0.18em] text-product-muted">
								Keep in v1
							</p>
							<p className="mt-1 font-mono text-sm tabular-nums text-product-text">
								{keepCount}/5 target
							</p>
						</div>
						<div className="rounded-none border border-product-border/80 bg-product-surface-strong/70 px-3 py-2">
							<p className="font-mono text-[9px] uppercase tracking-[0.18em] text-product-muted">
								Cut from v1
							</p>
							<p className="mt-1 font-mono text-sm tabular-nums text-product-text">
								{cutCount} named
							</p>
						</div>
						<div className="rounded-none border border-product-border/80 bg-product-surface-strong/70 px-3 py-2">
							<p className="font-mono text-[9px] uppercase tracking-[0.18em] text-product-muted">
								Scope signal
							</p>
							<p className="mt-1 text-sm leading-snug text-product-text">
								{scopeSignal}
							</p>
						</div>
					</div>
					<ul className="grid gap-2 md:grid-cols-3">
						{[
							"Keep only what the user needs to reach the promised outcome.",
							"Cut at least three tempting extras you want to keep for later.",
							"Make the rationale defend why this smaller version is still enough.",
						].map((rule) => (
							<li
								key={rule}
								className="border border-product-border/70 bg-product-surface px-3 py-2 text-[11px] leading-relaxed text-product-text"
							>
								{rule}
							</li>
						))}
					</ul>
				</div>
			</WorkbenchCard>
			<div className="grid gap-2 lg:grid-cols-2">
				{leftField
					? renderFieldCard(
							leftField,
							`${keepCount}/5 target`,
							keepCount >= 3 && keepCount <= 5,
							keepSupport,
						)
					: null}
				{rightField
					? renderFieldCard(
							rightField,
							`${cutCount} named`,
							cutCount >= 3,
							cutSupport,
						)
					: null}
			</div>
			<FieldList
				fields={restFields}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				pinnedArtifacts={pinnedArtifacts}
				invalidFieldIds={invalidFieldIds}
				invalidFieldMessages={invalidFieldMessages}
				className="space-y-2"
			/>
			{lesson.promptImport ? (
				<PromptImportCard
					lesson={lesson}
					onFieldChange={onFieldChange}
					pinnedArtifacts={pinnedArtifacts}
					fieldValues={fieldValues}
				/>
			) : null}
		</WorkbenchContainer>
	);
}
