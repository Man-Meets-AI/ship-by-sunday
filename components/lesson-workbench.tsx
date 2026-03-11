"use client";

import { useState } from "react";
import { useMutation } from "convex/react";

import {
	type BlockId,
	type ChecklistItemValue,
	type LessonConfig,
	type UploadFieldValue,
	type WorkbenchField,
} from "@/lib/course/manifest";
import type { LessonContent } from "@/content/lessons/types";
import { api } from "@/convex/_generated/api";
import type { PinnedArtifact } from "@/components/lesson-shells";
import {
	getOrderedBlocks,
	getStudentFacingLessons,
	isChecklistItemArray,
} from "@/lib/course/registry";

function toLineList(value: unknown) {
	if (!Array.isArray(value)) {
		return "";
	}

	return value.map((item) => String(item)).join("\n");
}

function toTableText(value: unknown) {
	if (!Array.isArray(value)) {
		return "";
	}

	return value
		.map((row) => (Array.isArray(row) ? row.join(" | ") : String(row)))
		.join("\n");
}

function parseLines(value: string) {
	return value
		.split("\n")
		.map((item) => item.trim())
		.filter(Boolean);
}

function parseTable(value: string) {
	return value
		.split("\n")
		.map((row) =>
			row
				.split("|")
				.map((column) => column.trim())
				.filter(Boolean),
		)
		.filter((row) => row.length > 0);
}

function getUploadMetadata(value: unknown): UploadFieldValue | null {
	if (!value || typeof value !== "object" || Array.isArray(value)) {
		return null;
	}

	if ("kind" in value && (value as { kind?: string }).kind === "upload") {
		return value as UploadFieldValue;
	}

	return null;
}

function formatArtifactValue(value: unknown) {
	const upload = getUploadMetadata(value);
	if (upload) {
		return upload.fileName ?? "Uploaded file";
	}

	if (isChecklistItemArray(value)) {
		return value
			.filter((item) => item.checked)
			.map((item) => item.label)
			.join(", ");
	}

	return Array.isArray(value) ? JSON.stringify(value) : String(value);
}

function CheckboxRow({
	label,
	checked,
	onChange,
}: {
	label: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}) {
	return (
		<label className="flex items-center gap-2 rounded-none border border-product-border bg-product-surface px-2.5 py-1.5">
			<input
				type="checkbox"
				checked={checked}
				onChange={(event) => onChange(event.target.checked)}
				className="size-3.5 rounded-none border-product-border accent-[rgb(var(--product-accent))]"
			/>
			<span className="text-xs font-medium text-product-text">{label}</span>
		</label>
	);
}

function normalizeChecklistValue(
	value: unknown,
	options: string[],
): ChecklistItemValue[] {
	if (isChecklistItemArray(value)) {
		return options.map((option) => {
			const existing = value.find((item) => item.label === option);
			return {
				label: option,
				checked: existing?.checked ?? false,
			};
		});
	}

	if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
		const selected = new Set(value as string[]);
		return options.map((option) => ({
			label: option,
			checked: selected.has(option),
		}));
	}

	return options.map((option) => ({
		label: option,
		checked: false,
	}));
}

function UploadFieldControl({
	field,
	value,
	onChange,
}: {
	field: WorkbenchField;
	value: unknown;
	onChange: (value: unknown) => void;
}) {
	const generateUploadUrl = useMutation(api.uploads.generateUploadUrl);
	const upload = getUploadMetadata(value);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const previewUrl = upload?.previewUrl ?? upload?.url;

	return (
		<label className="block">
			<span className={fieldLabelClass}>
				{field.label}
			</span>
			<div className="mt-1 rounded-none border border-dashed border-product-border bg-product-surface px-2.5 py-2">
				<input
					type="file"
					accept={field.kind === "image_upload" ? "image/*" : "video/*"}
					disabled={isUploading}
					onChange={async (event) => {
						const file = event.target.files?.[0];
						if (!file) {
							onChange({
								kind: "upload",
								status: "empty",
							} satisfies UploadFieldValue);
							return;
						}

						setUploadError(null);
						setIsUploading(true);

						try {
							const uploadUrl = await generateUploadUrl();
							const response = await fetch(uploadUrl, {
								method: "POST",
								headers: {
									"Content-Type": file.type || "application/octet-stream",
								},
								body: file,
							});

							if (!response.ok) {
								throw new Error("Upload failed");
							}

							const result = (await response.json()) as { storageId?: string };
							if (!result.storageId) {
								throw new Error("Missing storage id");
							}

							onChange({
								kind: "upload",
								status: "stored",
								fileName: file.name,
								mimeType: file.type,
								size: file.size,
								storageId: result.storageId,
								previewUrl: URL.createObjectURL(file),
							} satisfies UploadFieldValue);
						} catch {
							setUploadError("Upload failed. Try again.");
						} finally {
							setIsUploading(false);
							event.target.value = "";
						}
					}}
					className="w-full text-sm font-medium text-product-text file:mr-4 file:rounded-none file:border file:border-product-border file:bg-product-chip file:px-4 file:py-2 file:font-mono file:text-[11px] file:uppercase file:tracking-[0.22em] file:text-product-accent disabled:cursor-not-allowed disabled:opacity-70"
				/>
				<div className="mt-2 space-y-1 text-xs font-medium text-product-muted">
					{isUploading ? (
						<p>Uploading file to lesson storage...</p>
					) : upload?.fileName ? (
						<>
							<p className="text-product-text">{upload.fileName}</p>
							<p>
								Saved to lesson storage. It will persist with this lesson state.
							</p>
						</>
					) : (
						<p>
							Choose a file and it will upload to lesson storage before the
							lesson draft is saved.
						</p>
					)}
					{uploadError ? <p className="text-[#a83232]">{uploadError}</p> : null}
				</div>
				{previewUrl ? (
					field.kind === "image_upload" ? (
						<img
							src={previewUrl}
							alt={upload?.fileName ?? "Uploaded preview"}
							className="mt-4 max-h-64 w-full rounded-none border border-product-border object-contain"
						/>
					) : (
						<video
							controls
							src={previewUrl}
							className="mt-4 max-h-64 w-full rounded-none border border-product-border"
						/>
					)
				) : null}
			</div>
		</label>
	);
}

function WorkbenchCard({
	title,
	children,
	eyebrow,
}: {
	title: string;
	children: React.ReactNode;
	eyebrow?: string;
}) {
	return (
		<div className="rounded-none border border-product-border bg-product-surface-strong/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
			<div className="flex items-baseline gap-2 border-b border-product-border/80 px-3 py-1.5">
				{eyebrow ? (
					<span className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
						{eyebrow}
					</span>
				) : null}
				<span className="font-display text-sm uppercase tracking-[0.05em] text-product-text">
					{title}
				</span>
			</div>
			<div className="px-3 py-2">{children}</div>
		</div>
	);
}

const fieldLabelClass =
	"font-mono text-[10px] uppercase tracking-[0.18em] text-product-text/72";

function ArtifactContext({
	pinnedArtifacts,
}: {
	pinnedArtifacts: PinnedArtifact[];
}) {
	if (pinnedArtifacts.length === 0) {
		return null;
	}

	return (
		<div className="grid gap-2 md:grid-cols-2">
			{pinnedArtifacts.map((artifact) => (
				<WorkbenchCard
					key={artifact.artifactKey}
					title={artifact.artifactLabel}
					eyebrow={artifact.lessonTitle}
				>
					<div className="space-y-1 text-xs font-medium text-product-muted">
						{artifact.fields.length === 0 ? (
							<p>No saved preview yet.</p>
						) : (
							artifact.fields.slice(0, 3).map(([key, value]) => (
								<div key={key}>
									<p className="font-mono text-[10px] uppercase tracking-[0.22em] text-product-muted">
										{key.replaceAll("_", " ")}
									</p>
									<p className="mt-1 text-product-text">
										{formatArtifactValue(value)}
									</p>
								</div>
							))
						)}
					</div>
				</WorkbenchCard>
			))}
		</div>
	);
}

const roadmapBlockDescriptionsById: Record<BlockId, string> = {
	CEO: "Choose the problem, user, outcome, flow, and scope before you build.",
	DESIGN: "Turn the brief into screens and decisions so the build is translation, not guessing.",
	BUILD: "Use AI and your tools to implement the core flow without spiraling.",
	SHIP: "Deploy, demo, share, and capture the first feedback loop.",
};

function normalizeRoadmapBlockDescription(
	blockLabel: string,
	description: string,
) {
	return description.replace(
		new RegExp(`^${blockLabel}\\s+Block\\s*=\\s*`, "i"),
		"",
	);
}

function SprintRoadmapOverview({
	lessonContent,
}: {
	lessonContent: LessonContent;
}) {
	const orderedBlocks = getOrderedBlocks().map((block, index) => ({
		...block,
		description: normalizeRoadmapBlockDescription(
			block.label,
			lessonContent.workbench.teachingPoints?.[index] ??
				roadmapBlockDescriptionsById[block.id],
		),
		lessons: getStudentFacingLessons().filter((lesson) => lesson.block === block.id),
	}));

	return (
		<div className="space-y-2">
			<div className="border border-product-border bg-product-surface-strong/70 px-3 py-2">
				<p className="font-mono text-[9px] uppercase tracking-[0.2em] text-product-muted">
					Sprint roadmap
				</p>
				<p className="mt-1 text-[11px] leading-relaxed text-product-muted">
					Each block solves a different problem. Move through them in order so
					each rep makes the next one easier.
				</p>
			</div>
			<div className="grid gap-2 xl:grid-cols-4">
				{orderedBlocks.map((block) => (
					<section
						key={block.id}
						className="rounded-none border border-product-border bg-product-surface-strong/80"
					>
						<div className="border-b border-product-border px-3 py-2">
							<div className="flex items-center justify-between gap-2">
								<p className="font-display text-sm uppercase tracking-[0.06em] text-product-text">
									{block.label}
								</p>
								<span className="font-mono text-[8px] uppercase tracking-[0.15em] text-product-muted">
									{block.lessons.length} lessons
								</span>
							</div>
							<p className="mt-1 text-[11px] leading-snug text-product-muted">
								{block.description}
							</p>
						</div>
						<div className="space-y-0.5 px-3 py-2">
							{block.lessons.map((lesson) => (
								<div
									key={lesson.id}
									className="flex items-baseline gap-2 border-b border-product-border/30 py-1 last:border-b-0"
								>
									<span className="font-mono text-[8px] uppercase tracking-[0.15em] text-product-muted">
										{lesson.id}
									</span>
									<span className="text-[11px] leading-tight text-product-text">
										{lesson.shortTitle}
									</span>
								</div>
							))}
						</div>
					</section>
				))}
			</div>
		</div>
	);
}

function FieldControl({
	field,
	value,
	onChange,
	pinnedArtifacts,
}: {
	field: WorkbenchField;
	value: unknown;
	onChange: (value: unknown) => void;
	pinnedArtifacts: PinnedArtifact[];
}) {
	const linkedArtifact = field.linkedArtifactKey
		? pinnedArtifacts.find(
				(artifact) => artifact.artifactKey === field.linkedArtifactKey,
			)
		: null;

	if (field.kind === "readonly") {
		return (
			<label className="block">
				<span className={fieldLabelClass}>
					{field.label}
				</span>
				<div className="mt-1 rounded-none border border-product-border bg-product-surface px-2.5 py-2 text-xs font-medium text-product-text">
					{linkedArtifact ? (
						<div className="space-y-1.5">
							<p className="font-display text-sm uppercase tracking-[0.05em]">
								{linkedArtifact.artifactLabel}
							</p>
							{linkedArtifact.fields.length === 0 ? (
								<p className="text-product-muted">
									No artifact preview saved yet.
								</p>
							) : (
								linkedArtifact.fields.slice(0, 3).map(([key, entryValue]) => (
									<div key={key}>
										<p className="font-mono text-[10px] uppercase tracking-[0.22em] text-product-muted">
											{key.replaceAll("_", " ")}
										</p>
										<p className="mt-1">{formatArtifactValue(entryValue)}</p>
									</div>
								))
							)}
						</div>
					) : (
						<p className="text-product-muted">
							This field will populate from an earlier saved artifact.
						</p>
					)}
				</div>
			</label>
		);
	}

	if (field.kind === "text" || field.kind === "url") {
		return (
			<label className="block">
				<span className={fieldLabelClass}>
					{field.label}
				</span>
				<input
					type={field.kind === "url" ? "url" : "text"}
					value={typeof value === "string" ? value : ""}
					onChange={(event) => onChange(event.target.value)}
					placeholder={field.placeholder}
					className="mt-1 w-full rounded-none border border-product-border bg-product-surface px-2.5 py-1.5 text-sm text-product-text outline-none focus:border-product-accent"
				/>
			</label>
		);
	}

	if (field.kind === "number") {
		return (
			<label className="block">
				<span className={fieldLabelClass}>
					{field.label}
				</span>
				<input
					type="number"
					value={typeof value === "number" ? value : ""}
					onChange={(event) => onChange(Number(event.target.value) || 0)}
					className="mt-1 w-full rounded-none border border-product-border bg-product-surface px-2.5 py-1.5 text-sm text-product-text outline-none focus:border-product-accent"
				/>
			</label>
		);
	}

	if (field.kind === "toggle") {
		return (
			<CheckboxRow
				label={field.label}
				checked={Boolean(value)}
				onChange={onChange}
			/>
		);
	}

	if (field.kind === "select") {
		return (
			<label className="block">
				<span className={fieldLabelClass}>
					{field.label}
				</span>
				<select
					value={typeof value === "string" ? value : ""}
					onChange={(event) => onChange(event.target.value)}
					className="mt-1 w-full rounded-none border border-product-border bg-product-surface px-2.5 py-1.5 text-sm text-product-text outline-none focus:border-product-accent"
				>
					<option value="">Select one</option>
					{field.options?.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
			</label>
		);
	}

	if (field.kind === "checklist" || field.kind === "board") {
		if (field.kind === "checklist") {
			const options = field.options ?? [];
			const checklistItems = normalizeChecklistValue(value, options);

			return (
				<div className="block">
					<span className={fieldLabelClass}>
						{field.label}
					</span>
					<div className="mt-2 space-y-2">
						{checklistItems.map((item, index) => (
							<CheckboxRow
								key={item.label}
								label={item.label}
								checked={item.checked}
								onChange={(checked) => {
									const nextItems = checklistItems.map(
										(current, currentIndex) =>
											currentIndex === index
												? { ...current, checked }
												: current,
									);
									onChange(nextItems);
								}}
							/>
						))}
					</div>
				</div>
			);
		}

		return (
			<label className="block">
				<span className={fieldLabelClass}>
					{field.label}
				</span>
				<textarea
					value={toLineList(value)}
					onChange={(event) => onChange(parseLines(event.target.value))}
					rows={field.rows ?? 6}
					placeholder="One item per line"
					className="mt-1 w-full rounded-none border border-product-border bg-product-surface px-2.5 py-1.5 text-sm text-product-text outline-none focus:border-product-accent"
				/>
			</label>
		);
	}

	if (field.kind === "table") {
		return (
			<label className="block">
				<span className={fieldLabelClass}>
					{field.label}
				</span>
				<textarea
					value={toTableText(value)}
					onChange={(event) => onChange(parseTable(event.target.value))}
					rows={6}
					placeholder="One row per line. Separate columns with |"
					className="mt-1 w-full rounded-none border border-product-border bg-product-surface px-2.5 py-1.5 font-mono text-sm text-product-text outline-none focus:border-product-accent"
				/>
			</label>
		);
	}

	if (field.kind === "textarea") {
		return (
			<label className="block">
				<span className={fieldLabelClass}>
					{field.label}
				</span>
				<textarea
					value={typeof value === "string" ? value : ""}
					onChange={(event) => onChange(event.target.value)}
					rows={field.rows ?? 5}
					placeholder={field.placeholder}
					className="mt-1 w-full rounded-none border border-product-border bg-product-surface px-2.5 py-1.5 text-sm text-product-text outline-none focus:border-product-accent"
				/>
			</label>
		);
	}

	if (field.kind === "image_upload" || field.kind === "video_upload") {
		return (
			<UploadFieldControl field={field} value={value} onChange={onChange} />
		);
	}

	return null;
}

function renderFields(
	fields: WorkbenchField[],
	fieldValues: Record<string, unknown>,
	onFieldChange: (fieldId: string, value: unknown) => void,
	pinnedArtifacts: PinnedArtifact[],
	invalidFieldIds: Set<string>,
) {
	return fields.map((field) => (
		<div
			key={field.id}
			className={
				invalidFieldIds.has(field.id)
					? "rounded-none border border-[#a83232] bg-[rgba(168,50,50,0.06)] p-2"
					: ""
			}
		>
			<FieldControl
				field={field}
				value={fieldValues[field.id]}
				onChange={(value) => onFieldChange(field.id, value)}
				pinnedArtifacts={pinnedArtifacts}
			/>
			{field.helpText ? (
				<p className="mt-0.5 text-[10px] font-medium leading-snug text-product-muted">
					{field.helpText}
				</p>
			) : null}
			{invalidFieldIds.has(field.id) ? (
				<p className="mt-1 text-[10px] font-medium leading-snug text-[#a83232]">
					Finish this before continuing.
				</p>
			) : null}
		</div>
	));
}

export function WorkbenchRenderer({
	lesson,
	lessonContent,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds = new Set<string>(),
}: {
	lesson: LessonConfig;
	lessonContent: LessonContent;
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	pinnedArtifacts: PinnedArtifact[];
	invalidFieldIds?: Set<string>;
}) {
	const fields = lesson.workbenchFields ?? [];
	const titleBlock = (
		<div className="space-y-2 border-b border-product-border/60 pb-3">
			<div className="flex flex-wrap items-center gap-1.5 text-product-muted">
				<span className="border border-product-border bg-product-surface-strong/70 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.18em]">
					{lesson.id}
				</span>
				<span className="border border-product-border bg-product-surface px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.18em]">
					{lesson.artifact.label}
				</span>
				{lessonContent.lessonMeta.runtimeLabel ? (
					<span className="font-mono text-[8px] uppercase tracking-[0.18em] text-product-muted">
						{lessonContent.lessonMeta.runtimeLabel}
					</span>
				) : null}
			</div>
			<h1 className="font-display text-lg uppercase leading-tight tracking-[0.05em] text-product-text sm:text-xl">
				{lesson.title}
			</h1>
			<p className="max-w-3xl text-[12px] leading-relaxed text-product-muted">
				{lessonContent.intro}
			</p>
		</div>
	);
	const templateCard =
		lessonContent.workbench.templateDownloadLabel &&
		lessonContent.workbench.templateDownloadHref ? (
			<WorkbenchCard title="Template" eyebrow="Reference">
				<a
					href={lessonContent.workbench.templateDownloadHref}
					className="inline-flex rounded-none border border-product-border bg-product-surface px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-product-text transition-colors hover:bg-product-surface-alt"
				>
					{lessonContent.workbench.templateDownloadLabel}
				</a>
			</WorkbenchCard>
		) : null;
	const actionCard = (
		<WorkbenchCard title="Next step" eyebrow="Do this now">
			<div className="space-y-2">
				<p className="text-[12px] leading-snug text-product-text">
					{lessonContent.actionCard.jobNow}
				</p>
				<div className="grid gap-2 sm:grid-cols-2">
					<div className="border border-product-border bg-product-surface px-2.5 py-2">
						<p className="font-mono text-[8px] uppercase tracking-[0.15em] text-product-muted">
							Timebox
						</p>
						<p className="mt-1 text-[11px] leading-snug text-product-text">
							{lessonContent.actionCard.timebox}
						</p>
					</div>
					<div className="border border-product-border bg-product-surface px-2.5 py-2">
						<p className="font-mono text-[8px] uppercase tracking-[0.15em] text-product-muted">
							Finish with
						</p>
						<p className="mt-1 text-[11px] leading-snug text-product-text">
							{lessonContent.actionCard.comeBackWith}
						</p>
					</div>
				</div>
			</div>
		</WorkbenchCard>
	);

	if (lesson.workbench === "guided_form") {
		return (
			<div className="space-y-3">
				{titleBlock}
				{actionCard}
				<ArtifactContext pinnedArtifacts={pinnedArtifacts} />
				<div className="space-y-2">
					{renderFields(
						fields,
						fieldValues,
						onFieldChange,
						pinnedArtifacts,
						invalidFieldIds,
					)}
				</div>
			</div>
		);
	}

	if (lesson.workbench === "score_table") {
		const [tableField, ...restFields] = fields;
		return (
			<div className="space-y-3">
				{titleBlock}
				{actionCard}
				{tableField ? (
					<WorkbenchCard title={tableField.label} eyebrow="Research table">
						<FieldControl
							field={tableField}
							value={fieldValues[tableField.id]}
							onChange={(value) => onFieldChange(tableField.id, value)}
							pinnedArtifacts={pinnedArtifacts}
						/>
					</WorkbenchCard>
				) : null}
				<div className="grid gap-2 md:grid-cols-2">
					{renderFields(
						restFields,
						fieldValues,
						onFieldChange,
						pinnedArtifacts,
						invalidFieldIds,
					)}
				</div>
			</div>
		);
	}

	if (lesson.workbench === "collector_board") {
		const [boardField, ...restFields] = fields;
		return (
			<div className="space-y-3">
				{titleBlock}
				{actionCard}
				{boardField ? (
					<WorkbenchCard title={boardField.label} eyebrow="Reference board">
						<FieldControl
							field={boardField}
							value={fieldValues[boardField.id]}
							onChange={(value) => onFieldChange(boardField.id, value)}
							pinnedArtifacts={pinnedArtifacts}
						/>
					</WorkbenchCard>
				) : null}
				<div className="grid gap-2 md:grid-cols-2">
					{renderFields(
						restFields,
						fieldValues,
						onFieldChange,
						pinnedArtifacts,
						invalidFieldIds,
					)}
				</div>
			</div>
		);
	}

	if (lesson.workbench === "capture_upload") {
		return (
			<div className="space-y-3">
				{titleBlock}
				{templateCard}
				{actionCard}
				<ArtifactContext pinnedArtifacts={pinnedArtifacts} />
				<div className="grid gap-2 lg:grid-cols-2">
					{renderFields(
						fields,
						fieldValues,
						onFieldChange,
						pinnedArtifacts,
						invalidFieldIds,
					)}
				</div>
			</div>
		);
	}

	if (lesson.workbench === "scope_split") {
		const [leftField, rightField, ...restFields] = fields;
		return (
			<div className="space-y-3">
				{titleBlock}
				{actionCard}
				<div className="grid gap-2 lg:grid-cols-2">
					{leftField ? (
						<WorkbenchCard title={leftField.label} eyebrow="In scope">
							<FieldControl
								field={leftField}
								value={fieldValues[leftField.id]}
								onChange={(value) => onFieldChange(leftField.id, value)}
								pinnedArtifacts={pinnedArtifacts}
							/>
						</WorkbenchCard>
					) : null}
					{rightField ? (
						<WorkbenchCard title={rightField.label} eyebrow="Out of scope">
							<FieldControl
								field={rightField}
								value={fieldValues[rightField.id]}
								onChange={(value) => onFieldChange(rightField.id, value)}
								pinnedArtifacts={pinnedArtifacts}
							/>
						</WorkbenchCard>
					) : null}
				</div>
				<div className="space-y-2">
					{renderFields(
						restFields,
						fieldValues,
						onFieldChange,
						pinnedArtifacts,
						invalidFieldIds,
					)}
				</div>
			</div>
		);
	}

	if (lesson.workbench === "brief_assembler") {
		return (
			<div className="space-y-3">
				{titleBlock}
				{actionCard}
				<ArtifactContext pinnedArtifacts={pinnedArtifacts} />
				<div className="space-y-2">
					{renderFields(
						fields,
						fieldValues,
						onFieldChange,
						pinnedArtifacts,
						invalidFieldIds,
					)}
				</div>
			</div>
		);
	}

	if (lesson.workbench === "console_checklist") {
		return (
			<div className="space-y-3">
				{titleBlock}
				{actionCard}
				<div className="grid gap-2 md:grid-cols-2">
					{renderFields(
						fields,
						fieldValues,
						onFieldChange,
						pinnedArtifacts,
						invalidFieldIds,
					)}
				</div>
			</div>
		);
	}

	if (lesson.workbench === "roadmap_overview") {
		return (
			<div className="space-y-3">
				{titleBlock}
				{actionCard}
				<SprintRoadmapOverview lessonContent={lessonContent} />
			</div>
		);
	}

	if (lesson.workbench === "tracker_log") {
		const [tableField, ...restFields] = fields;
		return (
			<div className="space-y-3">
				{titleBlock}
				{actionCard}
				{tableField ? (
					<WorkbenchCard title={tableField.label} eyebrow="Tracker">
						<FieldControl
							field={tableField}
							value={fieldValues[tableField.id]}
							onChange={(value) => onFieldChange(tableField.id, value)}
							pinnedArtifacts={pinnedArtifacts}
						/>
					</WorkbenchCard>
				) : null}
				<div className="grid gap-2 md:grid-cols-2">
					{renderFields(
						restFields,
						fieldValues,
						onFieldChange,
						pinnedArtifacts,
						invalidFieldIds,
					)}
				</div>
			</div>
		);
	}

	if (lesson.workbench === "external_workspace") {
		const actionLabel =
			lesson.externalTool === "figma"
				? "Open Figma and keep this brief beside it."
				: lesson.externalTool === "deploy"
					? "Open the deploy platform and use this checklist beside it."
					: lesson.externalTool === "recording"
						? "Open your recording setup and keep this panel as the checklist."
						: "Open the code workspace and keep this lesson brief beside it.";

		return (
			<div className="space-y-3">
				{titleBlock}
				{actionCard}
				<WorkbenchCard title="External workspace" eyebrow="Focus mode">
					<p className="text-xs font-medium leading-snug text-product-muted">
						{actionLabel}
					</p>
				</WorkbenchCard>
				<ArtifactContext pinnedArtifacts={pinnedArtifacts} />
				<div className="grid gap-2 md:grid-cols-2">
					{renderFields(
						fields,
						fieldValues,
						onFieldChange,
						pinnedArtifacts,
						invalidFieldIds,
					)}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{titleBlock}
			<div className="rounded-none border border-dashed border-product-border bg-product-surface-strong/70 p-5 text-sm font-medium leading-relaxed text-product-muted">
				This workbench type has not been wired yet.
			</div>
		</div>
	);
}
