"use client";

import {
	type LessonConfig,
	type UploadFieldValue,
	type WorkbenchField,
} from "@/app/lessonRegistry";
import type { PinnedArtifact } from "@/components/lesson-shells";

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

	return Array.isArray(value) ? JSON.stringify(value) : String(value);
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
		<div className="rounded-[22px] border border-product-border bg-product-surface-strong/80 p-4">
			{eyebrow ? (
				<p className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
					{eyebrow}
				</p>
			) : null}
			<p className="mt-2 font-display text-2xl uppercase tracking-[0.05em] text-product-text">
				{title}
			</p>
			<div className="mt-4">{children}</div>
		</div>
	);
}

function ArtifactContext({ pinnedArtifacts }: { pinnedArtifacts: PinnedArtifact[] }) {
	if (pinnedArtifacts.length === 0) {
		return null;
	}

	return (
		<div className="grid gap-3 md:grid-cols-2">
			{pinnedArtifacts.map((artifact) => (
				<WorkbenchCard
					key={artifact.artifactKey}
					title={artifact.artifactLabel}
					eyebrow={artifact.lessonTitle}
				>
					<div className="space-y-2 text-sm font-medium text-product-muted">
						{artifact.fields.length === 0 ? (
							<p>No saved preview yet.</p>
						) : (
							artifact.fields.slice(0, 3).map(([key, value]) => (
								<div key={key}>
									<p className="font-mono text-[10px] uppercase tracking-[0.22em] text-product-muted">
										{key.replaceAll("_", " ")}
									</p>
									<p className="mt-1 text-product-text">{formatArtifactValue(value)}</p>
								</div>
							))
						)}
					</div>
				</WorkbenchCard>
			))}
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
		? pinnedArtifacts.find((artifact) => artifact.artifactKey === field.linkedArtifactKey)
		: null;

	if (field.kind === "readonly") {
		return (
			<label className="block">
				<span className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
					{field.label}
				</span>
				<div className="mt-2 rounded-[18px] border border-product-border bg-product-surface px-4 py-4 text-sm font-medium text-product-text">
					{linkedArtifact ? (
						<div className="space-y-3">
							<p className="font-display text-xl uppercase tracking-[0.05em]">
								{linkedArtifact.artifactLabel}
							</p>
							{linkedArtifact.fields.length === 0 ? (
								<p className="text-product-muted">No artifact preview saved yet.</p>
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
				<span className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
					{field.label}
				</span>
				<input
					type={field.kind === "url" ? "url" : "text"}
					value={typeof value === "string" ? value : ""}
					onChange={(event) => onChange(event.target.value)}
					placeholder={field.placeholder}
					className="mt-2 w-full rounded-[18px] border border-product-border bg-product-surface px-4 py-3 text-base font-medium text-product-text outline-none focus:border-product-accent"
				/>
			</label>
		);
	}

	if (field.kind === "number") {
		return (
			<label className="block">
				<span className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
					{field.label}
				</span>
				<input
					type="number"
					value={typeof value === "number" ? value : ""}
					onChange={(event) => onChange(Number(event.target.value) || 0)}
					className="mt-2 w-full rounded-[18px] border border-product-border bg-product-surface px-4 py-3 text-base font-medium text-product-text outline-none focus:border-product-accent"
				/>
			</label>
		);
	}

	if (field.kind === "toggle") {
		return (
			<label className="flex items-center justify-between rounded-[18px] border border-product-border bg-product-surface px-4 py-3">
				<span className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-text">
					{field.label}
				</span>
				<input
					type="checkbox"
					checked={Boolean(value)}
					onChange={(event) => onChange(event.target.checked)}
					className="size-5 accent-[rgb(var(--product-accent))]"
				/>
			</label>
		);
	}

	if (field.kind === "select") {
		return (
			<label className="block">
				<span className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
					{field.label}
				</span>
				<select
					value={typeof value === "string" ? value : ""}
					onChange={(event) => onChange(event.target.value)}
					className="mt-2 w-full rounded-[18px] border border-product-border bg-product-surface px-4 py-3 text-base font-medium text-product-text outline-none focus:border-product-accent"
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
		return (
			<label className="block">
				<span className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
					{field.label}
				</span>
				<textarea
					value={toLineList(value)}
					onChange={(event) => onChange(parseLines(event.target.value))}
					rows={field.rows ?? 6}
					placeholder="One item per line"
					className="mt-2 w-full rounded-[18px] border border-product-border bg-product-surface px-4 py-3 text-base font-medium text-product-text outline-none focus:border-product-accent"
				/>
			</label>
		);
	}

	if (field.kind === "table") {
		return (
			<label className="block">
				<span className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
					{field.label}
				</span>
				<textarea
					value={toTableText(value)}
					onChange={(event) => onChange(parseTable(event.target.value))}
					rows={6}
					placeholder="One row per line. Separate columns with |"
					className="mt-2 w-full rounded-[18px] border border-product-border bg-product-surface px-4 py-3 font-mono text-sm text-product-text outline-none focus:border-product-accent"
				/>
			</label>
		);
	}

	if (field.kind === "textarea") {
		return (
			<label className="block">
				<span className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
					{field.label}
				</span>
				<textarea
					value={typeof value === "string" ? value : ""}
					onChange={(event) => onChange(event.target.value)}
					rows={field.rows ?? 5}
					placeholder={field.placeholder}
					className="mt-2 w-full rounded-[18px] border border-product-border bg-product-surface px-4 py-3 text-base font-medium text-product-text outline-none focus:border-product-accent"
				/>
			</label>
		);
	}

	if (field.kind === "image_upload" || field.kind === "video_upload") {
		const upload = getUploadMetadata(value);
		return (
			<label className="block">
				<span className="font-mono text-[11px] uppercase tracking-[0.24em] text-product-muted">
					{field.label}
				</span>
				<div className="mt-2 rounded-[18px] border border-dashed border-product-border bg-product-surface px-4 py-4">
					<input
						type="file"
						accept={field.kind === "image_upload" ? "image/*" : "video/*"}
						onChange={(event) => {
							const file = event.target.files?.[0];
							if (!file) {
								onChange({
									kind: "upload",
									status: "empty",
								} satisfies UploadFieldValue);
								return;
							}

							onChange({
								kind: "upload",
								status: "selected",
								fileName: file.name,
								mimeType: file.type,
								size: file.size,
							} satisfies UploadFieldValue);
						}}
						className="w-full text-sm font-medium text-product-text file:mr-4 file:rounded-full file:border file:border-product-border file:bg-product-chip file:px-4 file:py-2 file:font-mono file:text-[11px] file:uppercase file:tracking-[0.22em] file:text-product-accent"
					/>
					<div className="mt-4 space-y-2 text-sm font-medium text-product-muted">
						{upload?.fileName ? (
							<>
								<p className="text-product-text">{upload.fileName}</p>
								<p>
									File metadata is saved for now. Durable upload storage is the next
									step after the layout refactor.
								</p>
							</>
						) : (
							<p>
								Select a file to mark this artifact as attached. Persistent media
								storage is not wired yet.
							</p>
						)}
					</div>
				</div>
			</label>
		);
	}

	return null;
}

function renderFields(
	fields: WorkbenchField[],
	fieldValues: Record<string, unknown>,
	onFieldChange: (fieldId: string, value: unknown) => void,
	pinnedArtifacts: PinnedArtifact[],
) {
	return fields.map((field) => (
		<div key={field.id}>
			<FieldControl
				field={field}
				value={fieldValues[field.id]}
				onChange={(value) => onFieldChange(field.id, value)}
				pinnedArtifacts={pinnedArtifacts}
			/>
			{field.helpText ? (
				<p className="mt-2 text-xs font-medium leading-relaxed text-product-muted">
					{field.helpText}
				</p>
			) : null}
		</div>
	));
}

export function WorkbenchRenderer({
	lesson,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
}: {
	lesson: LessonConfig;
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	pinnedArtifacts: PinnedArtifact[];
}) {
	const fields = lesson.workbenchFields ?? [];
	const titleBlock = (
		<div>
			<h1 className="font-display text-4xl uppercase leading-none tracking-[0.06em] text-product-text sm:text-5xl">
				{lesson.title}
			</h1>
			<p className="mt-4 max-w-3xl text-sm font-medium leading-relaxed text-product-muted">
				{lesson.helperText ?? lesson.winCondition}
			</p>
		</div>
	);

	if (lesson.workbench === "guided_form") {
		return (
			<div className="space-y-6">
				{titleBlock}
				<ArtifactContext pinnedArtifacts={pinnedArtifacts} />
				<div className="space-y-5">
					{renderFields(fields, fieldValues, onFieldChange, pinnedArtifacts)}
				</div>
			</div>
		);
	}

	if (lesson.workbench === "score_table") {
		const [tableField, ...restFields] = fields;
		return (
			<div className="space-y-6">
				{titleBlock}
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
				<div className="grid gap-4 md:grid-cols-2">
					{renderFields(restFields, fieldValues, onFieldChange, pinnedArtifacts)}
				</div>
			</div>
		);
	}

	if (lesson.workbench === "collector_board") {
		const [boardField, ...restFields] = fields;
		return (
			<div className="space-y-6">
				{titleBlock}
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
				<div className="grid gap-4 md:grid-cols-2">
					{renderFields(restFields, fieldValues, onFieldChange, pinnedArtifacts)}
				</div>
			</div>
		);
	}

	if (lesson.workbench === "capture_upload") {
		return (
			<div className="space-y-6">
				{titleBlock}
				<WorkbenchCard title="Capture or upload" eyebrow="Artifact flow">
					<div className="space-y-2 text-sm font-medium leading-relaxed text-product-muted">
						{lesson.checklist.map((item) => (
							<p key={item}>[ ] {item}</p>
						))}
					</div>
				</WorkbenchCard>
				<ArtifactContext pinnedArtifacts={pinnedArtifacts} />
				<div className="grid gap-4 lg:grid-cols-2">
					{renderFields(fields, fieldValues, onFieldChange, pinnedArtifacts)}
				</div>
			</div>
		);
	}

	if (lesson.workbench === "scope_split") {
		const [leftField, rightField, ...restFields] = fields;
		return (
			<div className="space-y-6">
				{titleBlock}
				<div className="grid gap-4 lg:grid-cols-2">
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
				<div className="space-y-5">
					{renderFields(restFields, fieldValues, onFieldChange, pinnedArtifacts)}
				</div>
			</div>
		);
	}

	if (lesson.workbench === "brief_assembler") {
		return (
			<div className="space-y-6">
				{titleBlock}
				<ArtifactContext pinnedArtifacts={pinnedArtifacts} />
				<div className="space-y-5">
					{renderFields(fields, fieldValues, onFieldChange, pinnedArtifacts)}
				</div>
			</div>
		);
	}

	if (lesson.workbench === "console_checklist") {
		return (
			<div className="space-y-6">
				{titleBlock}
				<div className="grid gap-4 md:grid-cols-2">
					{renderFields(fields, fieldValues, onFieldChange, pinnedArtifacts)}
				</div>
			</div>
		);
	}

	if (lesson.workbench === "tracker_log") {
		const [tableField, ...restFields] = fields;
		return (
			<div className="space-y-6">
				{titleBlock}
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
				<div className="grid gap-4 md:grid-cols-2">
					{renderFields(restFields, fieldValues, onFieldChange, pinnedArtifacts)}
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
			<div className="space-y-6">
				{titleBlock}
				<WorkbenchCard title="External workspace" eyebrow="Focus mode">
					<p className="text-sm font-medium leading-relaxed text-product-muted">
						{actionLabel}
					</p>
				</WorkbenchCard>
				<ArtifactContext pinnedArtifacts={pinnedArtifacts} />
				<div className="grid gap-4 md:grid-cols-2">
					{renderFields(fields, fieldValues, onFieldChange, pinnedArtifacts)}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{titleBlock}
			<div className="rounded-[22px] border border-dashed border-product-border bg-product-surface-strong/70 p-5 text-sm font-medium leading-relaxed text-product-muted">
				This workbench type has not been wired yet.
			</div>
		</div>
	);
}
