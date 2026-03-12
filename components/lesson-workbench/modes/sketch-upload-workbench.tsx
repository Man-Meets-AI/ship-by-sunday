"use client";

import { useRef, useState } from "react";
import { useMutation } from "convex/react";

import { api } from "@/convex/_generated/api";
import type { UploadFieldValue, WorkbenchField } from "@/lib/course/manifest";

import { uploadFilesToLessonStorage } from "../fields/upload-storage";
import { getUploadMetadataList } from "../fields/value-codecs";
import { ArtifactContext } from "../shared/artifact-context";
import { StatusRail } from "../shared/status-rail";
import { TemplateDownloadCard } from "../shared/template-download-card";
import { WorkbenchCard } from "../shared/workbench-card";
import { WorkbenchContainer } from "../shared/workbench-container";
import { WorkbenchHeader } from "../shared/workbench-header";
import type { WorkbenchModeProps } from "../types";

const primaryButtonClass =
	"inline-flex items-center justify-center rounded-none border border-product-accent bg-product-chip px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-product-accent transition-colors hover:bg-product-accent hover:text-product-bg disabled:cursor-not-allowed disabled:border-product-border disabled:bg-product-surface disabled:text-product-muted";

const secondaryButtonClass =
	"inline-flex items-center justify-center rounded-none border border-product-border bg-product-surface px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-product-text transition-colors hover:bg-product-surface-alt disabled:cursor-not-allowed disabled:opacity-60";

export function appendSketchUploads(
	currentUploads: UploadFieldValue[],
	nextUploads: UploadFieldValue[],
) {
	return [...currentUploads, ...nextUploads];
}

export function replaceSketchUploads(
	_currentUploads: UploadFieldValue[],
	nextUploads: UploadFieldValue[],
) {
	return [...nextUploads];
}

export function removeSketchUploadAt(
	currentUploads: UploadFieldValue[],
	index: number,
) {
	return currentUploads.filter((_, currentIndex) => currentIndex !== index);
}

function getSketchUploadField(fields: WorkbenchField[]) {
	return (
		fields.find((field) => field.kind === "image_uploads") ??
		fields.find((field) => field.kind === "image_upload") ??
		null
	);
}

function InlineLessonVideo({
	title,
	video,
}: {
	title: string;
	video: WorkbenchModeProps["lessonContent"]["coach"]["video"];
}) {
	return (
		<WorkbenchCard label="Watch first">
			{video?.status === "ready" && video.url ? (
				<div className="space-y-2">
					<video
						controls
						poster={video.posterUrl}
						className="w-full rounded-none border border-product-border bg-product-surface"
						src={video.url}
					/>
					<div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-medium text-product-muted">
						<p className="text-product-text">{video.title ?? title}</p>
						{video.durationLabel ? <p>{video.durationLabel}</p> : null}
					</div>
				</div>
			) : (
				<div className="rounded-none border border-dashed border-product-border bg-product-surface px-3 py-4 text-sm font-medium leading-relaxed text-product-muted">
					Video not wired yet.
				</div>
			)}
		</WorkbenchCard>
	);
}

export function SketchUploadWorkbench({
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
	const generateUploadUrl = useMutation(api.uploads.generateUploadUrl);
	const uploadField = getSketchUploadField(fields);
	const uploadFieldId = uploadField?.id ?? "sketch_upload";
	const uploads = getUploadMetadataList(fieldValues[uploadFieldId]);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const appendInputRef = useRef<HTMLInputElement | null>(null);
	const replaceInputRef = useRef<HTMLInputElement | null>(null);
	const isInvalid = invalidFieldIds.has(uploadFieldId);

	async function handleFileSelection(
		fileList: FileList | null,
		mode: "append" | "replace",
	) {
		const files = Array.from(fileList ?? []);
		if (!uploadField || files.length === 0) {
			return;
		}

		setUploadError(null);
		setIsUploading(true);

		try {
			const nextUploads = await uploadFilesToLessonStorage({
				files,
				generateUploadUrl,
			});
			const nextValue =
				mode === "replace"
					? replaceSketchUploads(uploads, nextUploads)
					: appendSketchUploads(uploads, nextUploads);
			onFieldChange(uploadField.id, nextValue);
		} catch {
			setUploadError("Upload failed. Try again.");
		} finally {
			setIsUploading(false);
		}
	}

	return (
		<WorkbenchContainer>
			<WorkbenchHeader lesson={lesson} lessonContent={lessonContent} />
			<InlineLessonVideo
				title={lesson.title}
				video={lessonContent.coach.video}
			/>
			<StatusRail
				lessonContent={lessonContent}
				completedTaskCount={completedTaskCount}
				totalTaskCount={Math.max(objectiveTasks.length, 1)}
			/>
			<WorkbenchCard label="Sketch rules">
				<div className="space-y-2">
					<p className="text-sm leading-relaxed text-product-text">
						Sketch 3-5 rough screens on paper or your tablet. Ugly is fine.
						Clarity is the point.
					</p>
					<ul className="space-y-1 text-sm leading-relaxed text-product-muted">
						{(lessonContent.workbench.teachingPoints ?? []).map((point) => (
							<li key={point}>- {point}</li>
						))}
					</ul>
				</div>
			</WorkbenchCard>
			<WorkbenchCard label={uploadField?.label ?? "Upload sketch set"}>
				<div className="space-y-4">
					<div
						className={`rounded-none border-2 border-dashed px-4 py-8 text-center ${
							isInvalid
								? "border-[#a83232] bg-[rgba(168,50,50,0.06)]"
								: "border-product-border bg-product-surface"
						}`}
					>
						<p className="font-mono text-[11px] uppercase tracking-[0.2em] text-product-muted">
							{uploads.length > 0
								? "Keep it moving"
								: "Upload proof and move on"}
						</p>
						<p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-product-text">
							{uploads.length > 0
								? `${uploads.length} sketch image${
										uploads.length === 1 ? "" : "s"
									} saved. Add more if you want, or continue.`
								: "Take clear photos of the sketches and drop them here. One good set is enough to continue."}
						</p>
						<div className="mt-5 flex flex-wrap items-center justify-center gap-2">
							<button
								type="button"
								onClick={() => appendInputRef.current?.click()}
								disabled={isUploading || !uploadField}
								className={primaryButtonClass}
							>
								{uploads.length > 0 ? "Add more sketches" : "Upload sketches"}
							</button>
							{uploads.length > 0 ? (
								<button
									type="button"
									onClick={() => replaceInputRef.current?.click()}
									disabled={isUploading || !uploadField}
									className={secondaryButtonClass}
								>
									Replace all
								</button>
							) : null}
						</div>
						<input
							ref={appendInputRef}
							type="file"
							accept="image/*"
							multiple
							className="hidden"
							onChange={async (event) => {
								await handleFileSelection(event.target.files, "append");
								event.target.value = "";
							}}
						/>
						<input
							ref={replaceInputRef}
							type="file"
							accept="image/*"
							multiple
							className="hidden"
							onChange={async (event) => {
								await handleFileSelection(event.target.files, "replace");
								event.target.value = "";
							}}
						/>
						<p className="mt-3 text-[11px] leading-relaxed text-product-muted">
							Use your phone camera if needed. The goal is speed, not polish.
						</p>
						{isUploading ? (
							<p className="mt-2 text-[11px] font-medium text-product-muted">
								Uploading images to lesson storage...
							</p>
						) : null}
						{uploadField?.helpText ? (
							<p className="mt-2 text-[11px] leading-relaxed text-product-muted">
								{uploadField.helpText}
							</p>
						) : null}
						{uploadError ? (
							<p className="mt-2 text-[11px] font-medium text-[#a83232]">
								{uploadError}
							</p>
						) : null}
						{isInvalid ? (
							<p className="mt-2 text-[11px] font-medium text-[#a83232]">
								Upload at least one sketch image before continuing.
							</p>
						) : null}
					</div>
					{uploads.length > 0 ? (
						<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
							{uploads.map((upload, index) => {
								const previewUrl = upload.previewUrl ?? upload.url;
								if (!previewUrl) {
									return null;
								}

								return (
									<div
										key={`${upload.storageId ?? upload.fileName ?? "sketch"}-${index}`}
										className="overflow-hidden border border-product-border bg-product-surface"
									>
										<div className="aspect-[4/3] overflow-hidden border-b border-product-border">
											<img
												src={previewUrl}
												alt={upload.fileName ?? `Sketch ${index + 1}`}
												className="h-full w-full object-cover"
											/>
										</div>
										<div className="flex items-center justify-between gap-3 px-3 py-2">
											<p className="min-w-0 truncate text-xs font-medium text-product-text">
												{upload.fileName ?? `Sketch ${index + 1}`}
											</p>
											<button
												type="button"
												onClick={() =>
													onFieldChange(
														uploadFieldId,
														removeSketchUploadAt(uploads, index),
													)
												}
												className="font-mono text-[10px] uppercase tracking-[0.16em] text-product-muted transition-colors hover:text-product-text"
											>
												Remove
											</button>
										</div>
									</div>
								);
							})}
						</div>
					) : null}
				</div>
			</WorkbenchCard>
			<TemplateDownloadCard lessonContent={lessonContent} />
			{pinnedArtifacts.length > 0 ? (
				<details className="rounded-none border border-product-border/70 bg-product-surface-strong/70">
					<summary className="cursor-pointer px-3 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-product-muted">
						Need context?
					</summary>
					<div className="border-t border-product-border/60 px-3 py-3">
						<ArtifactContext pinnedArtifacts={pinnedArtifacts} />
					</div>
				</details>
			) : null}
		</WorkbenchContainer>
	);
}
