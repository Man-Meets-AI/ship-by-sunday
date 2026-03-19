"use client";

import { useMutation } from "convex/react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { LessonVideoPlayer } from "@/features/course/lesson/components/lesson-video-player";
import { assert } from "@/features/course/lesson/lib/assert";
import type {
	UploadFieldValue,
	WorkbenchField,
} from "@/features/course/lesson/model/manifest";
import { isLessonVideoReady } from "@/features/course/lesson/model/video";

import { uploadFilesToLessonStorage } from "../fields/upload-storage";
import { getUploadMetadataList } from "../fields/value-codecs";
import { ArtifactContext } from "../shared/artifact-context";
import { StatusRail } from "../shared/status-rail";
import { TemplateDownloadCard } from "../shared/template-download-card";
import { WorkbenchCard } from "../shared/workbench-card";
import { WorkbenchContainer } from "../shared/workbench-container";
import { WorkbenchHeader } from "../shared/workbench-header";
import type { WorkbenchModeProps } from "../types";

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

type UploadState =
	| { status: "idle" }
	| { status: "uploading" }
	| { status: "error"; message: string };

const chromeLabelClass =
	"text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground";

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
			{video && isLessonVideoReady(video) ? (
				<div className="space-y-2">
					<Card className="gap-0 overflow-hidden p-0 py-0">
						<LessonVideoPlayer
							video={video}
							title={video.title ?? title}
							className="aspect-video w-full rounded-none border-0 bg-black object-cover"
						/>
					</Card>
					<div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-medium text-muted-foreground">
						<p className="text-foreground">{video.title ?? title}</p>
						{video.durationLabel ? <p>{video.durationLabel}</p> : null}
					</div>
				</div>
			) : (
				<Card className="gap-0 border border-dashed border-border bg-muted/30 py-0 ring-0">
					<CardContent className="px-3 py-4 text-sm font-medium leading-relaxed text-muted-foreground">
						Video not wired yet.
					</CardContent>
				</Card>
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
	const sketchUploadField = getSketchUploadField(fields);
	assert(
		sketchUploadField,
		"Sketch upload workbench requires an upload field.",
	);
	const uploadField = sketchUploadField;
	const uploadFieldId = uploadField.id;
	const uploads = getUploadMetadataList(fieldValues[uploadFieldId]);
	const [uploadState, setUploadState] = useState<UploadState>({
		status: "idle",
	});
	const appendInputRef = useRef<HTMLInputElement | null>(null);
	const replaceInputRef = useRef<HTMLInputElement | null>(null);
	const isInvalid = invalidFieldIds.has(uploadFieldId);
	const isUploading = uploadState.status === "uploading";

	async function handleFileSelection(
		fileList: FileList | null,
		mode: "append" | "replace",
	) {
		if (!fileList) {
			return;
		}

		const files = Array.from(fileList);
		if (files.length === 0) {
			return;
		}

		setUploadState({ status: "uploading" });

		try {
			const nextUploads = await uploadFilesToLessonStorage({
				files,
				generateUploadUrl,
			});
			const nextValue =
				mode === "replace"
					? replaceSketchUploads(uploads, nextUploads)
					: appendSketchUploads(uploads, nextUploads);
			onFieldChange(uploadFieldId, nextValue);
			setUploadState({ status: "idle" });
		} catch {
			setUploadState({
				status: "error",
				message: "Upload failed. Try again.",
			});
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
					<p className="text-sm leading-relaxed text-foreground">
						Sketch 3-5 rough screens on paper or your tablet. Ugly is fine.
						Clarity is the point.
					</p>
					<ul className="space-y-1 text-sm leading-relaxed text-muted-foreground">
						{(lessonContent.workbench.teachingPoints ?? []).map((point) => (
							<li key={point}>- {point}</li>
						))}
					</ul>
				</div>
			</WorkbenchCard>
			<WorkbenchCard label={uploadField.label}>
				<div className="space-y-4">
					<div
						className={`rounded-none border-2 border-dashed px-4 py-8 text-center ${
							isInvalid
								? "border-destructive/30 bg-destructive/5"
								: "border-border bg-card"
						}`}
					>
						<p className={chromeLabelClass}>
							{uploads.length > 0
								? "Keep it moving"
								: "Upload proof and move on"}
						</p>
						<p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-foreground">
							{uploads.length > 0
								? `${uploads.length} sketch image${
										uploads.length === 1 ? "" : "s"
									} saved. Add more if you want, or continue.`
								: "Take clear photos of the sketches and drop them here. One good set is enough to continue."}
						</p>
						<div className="mt-5 flex flex-wrap items-center justify-center gap-2">
							<Button
								type="button"
								onClick={() => appendInputRef.current?.click()}
								disabled={isUploading}
								variant="secondary"
								size="sm"
							>
								{uploads.length > 0 ? "Add more sketches" : "Upload sketches"}
							</Button>
							{uploads.length > 0 ? (
								<Button
									type="button"
									onClick={() => replaceInputRef.current?.click()}
									disabled={isUploading}
									variant="outline"
									size="sm"
								>
									Replace all
								</Button>
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
						<p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
							Use your phone camera if needed. The goal is speed, not polish.
						</p>
						{isUploading ? (
							<p className="mt-2 text-[11px] font-medium text-muted-foreground">
								Uploading images to lesson storage...
							</p>
						) : null}
						{uploadField.helpText ? (
							<p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
								{uploadField.helpText}
							</p>
						) : null}
						{uploadState.status === "error" ? (
							<p className="mt-2 text-[11px] font-medium text-destructive">
								{uploadState.message}
							</p>
						) : null}
						{isInvalid ? (
							<p className="mt-2 text-[11px] font-medium text-destructive">
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
								const keyBase =
									upload.storageId ?? upload.fileName ?? previewUrl;

								return (
									<Card
										key={keyBase}
										className="gap-0 overflow-hidden p-0 py-0"
									>
										<div className="aspect-[4/3] overflow-hidden border-b border-border">
											<img
												src={previewUrl}
												alt={upload.fileName ?? `Sketch ${index + 1}`}
												className="h-full w-full object-cover"
											/>
										</div>
										<div className="flex items-center justify-between gap-3 px-3 py-2">
											<p className="min-w-0 truncate text-xs font-medium text-foreground">
												{upload.fileName ?? `Sketch ${index + 1}`}
											</p>
											<Button
												type="button"
												onClick={() =>
													onFieldChange(
														uploadFieldId,
														removeSketchUploadAt(uploads, index),
													)
												}
												variant="ghost"
												size="sm"
											>
												Remove
											</Button>
										</div>
									</Card>
								);
							})}
						</div>
					) : null}
				</div>
			</WorkbenchCard>
			<TemplateDownloadCard lessonContent={lessonContent} />
			{pinnedArtifacts.length > 0 ? (
				<Card className="gap-0 overflow-hidden p-0 py-0">
					<details className="w-full">
						<summary
							className={`${chromeLabelClass} cursor-pointer px-3 py-2 transition-colors hover:text-foreground`}
						>
							Need context?
						</summary>
						<div className="border-t border-border px-3 py-3">
							<ArtifactContext pinnedArtifacts={pinnedArtifacts} />
						</div>
					</details>
				</Card>
			) : null}
		</WorkbenchContainer>
	);
}
