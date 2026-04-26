"use client";

import { useMutation } from "convex/react";
import { useRef, useState, type RefObject } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";
import { LessonVideoPlayer } from "@/features/course/lesson/components/lesson-video-player";
import { assert } from "@/lib/assert";
import type {
	LessonConfig,
	LessonContent,
	UploadFieldValue,
	WorkbenchField,
} from "@/features/course/lesson/model/manifest";
import { isLessonVideoReady } from "@/features/course/lesson/model/video";

import { uploadFilesToLessonStorage } from "../fields/upload-storage";
import { getUploadMetadataList } from "../fields/value-codecs";
import { ArtifactContext } from "../shared/artifact-context";
import { renderLessonTitle } from "../shared/workbench-header";
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

function SketchLessonHeader({
	lesson,
	lessonContent,
}: {
	lesson: LessonConfig;
	lessonContent: LessonContent;
}) {
	return (
		<Card>
			<CardHeader>
				<div className="flex flex-wrap items-center gap-2 text-muted-foreground">
					<Badge variant="secondary" className="text-xs font-medium">
						{lesson.id}
					</Badge>
					<Badge variant="outline" className="text-xs font-medium">
						{lesson.artifact.label}
					</Badge>
					{lessonContent.lessonMeta.runtimeLabel ? (
						<span className="text-xs font-medium text-muted-foreground">
							{lessonContent.lessonMeta.runtimeLabel}
						</span>
					) : null}
				</div>
				<CardTitle className="text-balance text-3xl font-semibold sm:text-4xl">
					{renderLessonTitle(lesson.title)}
				</CardTitle>
				<CardDescription className="max-w-prose pt-0.5 text-base leading-relaxed">
					{lessonContent.intro}
				</CardDescription>
			</CardHeader>
		</Card>
	);
}

function SketchLessonStatusGrid({
	lessonContent,
	completedTaskCount,
	totalTaskCount,
}: {
	lessonContent: LessonContent;
	completedTaskCount: number;
	totalTaskCount: number;
}) {
	const progressValue =
		totalTaskCount > 0
			? Math.round((completedTaskCount / totalTaskCount) * 100)
			: 0;

	const rows: { label: string; body: string; lineClamp?: boolean }[] = [
		{
			label: "Do this now",
			body: lessonContent.actionCard.jobNow,
			lineClamp: true,
		},
		{ label: "Timebox", body: lessonContent.actionCard.timebox },
		{
			label: "Finish with",
			body: lessonContent.actionCard.comeBackWith,
			lineClamp: true,
		},
	];

	return (
		<div
			role="list"
			className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
		>
			{rows.map((row) => (
				<Card key={row.label} role="listitem" className="py-3">
					<CardHeader className="gap-1.5 px-4 py-0">
						<CardTitle className="text-xs font-semibold tracking-tight text-muted-foreground">
							{row.label}
						</CardTitle>
						<CardDescription
							className={
								row.lineClamp
									? "line-clamp-4 text-foreground"
									: "text-foreground"
							}
						>
							{row.body}
						</CardDescription>
					</CardHeader>
				</Card>
			))}
			<Card role="listitem" className="py-3">
				<CardHeader className="gap-1.5 px-4 py-0">
					<CardTitle className="text-xs font-semibold tracking-tight text-muted-foreground">
						Progress
					</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-2 pt-0">
					<p className="text-sm font-medium tabular-nums text-foreground">
						{completedTaskCount}/{totalTaskCount}
					</p>
					<Progress value={progressValue} className="h-1.5" />
				</CardContent>
			</Card>
		</div>
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
		<Card className="gap-0 py-0">
			<CardHeader className="border-b border-border/60 pb-4">
				<CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
					Watch first
				</CardTitle>
			</CardHeader>
			<CardContent className="py-4">
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
			</CardContent>
		</Card>
	);
}

function SketchTemplateDownload({
	lessonContent,
}: {
	lessonContent: LessonContent;
}) {
	if (
		!lessonContent.workbench.templateDownloadLabel ||
		!lessonContent.workbench.templateDownloadHref
	) {
		return null;
	}

	const isExternalLink = /^https?:\/\//i.test(
		lessonContent.workbench.templateDownloadHref,
	);

	return (
		<Card className="gap-0 py-0">
			<CardHeader className="border-b border-border/60 pb-4">
				<CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
					Template
				</CardTitle>
			</CardHeader>
			<CardContent className="py-4">
				<Button asChild variant="outline" size="sm">
					<a
						href={lessonContent.workbench.templateDownloadHref}
						target={isExternalLink ? "_blank" : undefined}
						rel={isExternalLink ? "noreferrer" : undefined}
					>
						{lessonContent.workbench.templateDownloadLabel}
					</a>
				</Button>
			</CardContent>
		</Card>
	);
}

function SketchUploadDropzone({
	uploads,
	uploadField,
	isInvalid,
	isUploading,
	uploadState,
	appendInputRef,
	replaceInputRef,
	onAppendFiles,
	onReplaceFiles,
}: {
	uploads: UploadFieldValue[];
	uploadField: WorkbenchField;
	isInvalid: boolean;
	isUploading: boolean;
	uploadState: UploadState;
	appendInputRef: RefObject<HTMLInputElement | null>;
	replaceInputRef: RefObject<HTMLInputElement | null>;
	onAppendFiles: (files: FileList | null) => Promise<void>;
	onReplaceFiles: (files: FileList | null) => Promise<void>;
}) {
	return (
		<div
			className={`rounded-none border-2 border-dashed px-4 py-8 text-center ${
				isInvalid
					? "border-destructive/30 bg-destructive/5"
					: "border-border bg-card"
			}`}
		>
			<p className={chromeLabelClass}>
				{uploads.length > 0 ? "Keep it moving" : "Upload proof and move on"}
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
					await onAppendFiles(event.target.files);
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
					await onReplaceFiles(event.target.files);
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
	);
}

function SketchUploadPreviewGrid({
	uploads,
	uploadFieldId,
	onFieldChange,
}: {
	uploads: UploadFieldValue[];
	uploadFieldId: string;
	onFieldChange: WorkbenchModeProps["onFieldChange"];
}) {
	if (uploads.length === 0) {
		return null;
	}

	return (
		<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
			{uploads.map((upload, index) => {
				const previewUrl = upload.previewUrl ?? upload.url;
				if (!previewUrl) {
					return null;
				}
				const keyBase = upload.storageId ?? upload.fileName ?? previewUrl;

				return (
					<Card key={keyBase} className="gap-0 overflow-hidden p-0 py-0">
						<div className="aspect-4/3 overflow-hidden border-b border-border">
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
		<div className="w-full space-y-4 pb-1">
			<SketchLessonHeader lesson={lesson} lessonContent={lessonContent} />
			<InlineLessonVideo
				title={lesson.title}
				video={lessonContent.coach.video}
			/>
			<SketchLessonStatusGrid
				lessonContent={lessonContent}
				completedTaskCount={completedTaskCount}
				totalTaskCount={Math.max(objectiveTasks.length, 1)}
			/>
			<Card className="gap-0 py-0">
				<CardHeader className="border-b border-border/60 pb-4">
					<CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						Sketch rules
					</CardTitle>
				</CardHeader>
				<CardContent className="py-4">
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
				</CardContent>
			</Card>
			<Card className="gap-0 py-0">
				<CardHeader className="border-b border-border/60 pb-4">
					<CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
						{uploadField.label}
					</CardTitle>
				</CardHeader>
				<CardContent className="py-4">
					<div className="space-y-4">
						<SketchUploadDropzone
							uploads={uploads}
							uploadField={uploadField}
							isInvalid={isInvalid}
							isUploading={isUploading}
							uploadState={uploadState}
							appendInputRef={appendInputRef}
							replaceInputRef={replaceInputRef}
							onAppendFiles={(files) => handleFileSelection(files, "append")}
							onReplaceFiles={(files) => handleFileSelection(files, "replace")}
						/>
						<SketchUploadPreviewGrid
							uploads={uploads}
							uploadFieldId={uploadFieldId}
							onFieldChange={onFieldChange}
						/>
					</div>
				</CardContent>
			</Card>
			<SketchTemplateDownload lessonContent={lessonContent} />
			{pinnedArtifacts.length > 0 ? (
				<Card className="gap-0 overflow-hidden py-0">
					<Collapsible>
						<CollapsibleTrigger asChild>
							<Button
								type="button"
								variant="ghost"
								className={`${chromeLabelClass} h-auto w-full justify-start rounded-none px-3 py-2 font-medium normal-case tracking-normal hover:text-foreground`}
							>
								Need context?
							</Button>
						</CollapsibleTrigger>
						<CollapsibleContent>
							<div className="border-t border-border px-3 py-3">
								<ArtifactContext pinnedArtifacts={pinnedArtifacts} />
							</div>
						</CollapsibleContent>
					</Collapsible>
				</Card>
			) : null}
		</div>
	);
}
