"use client";

import { useMutation } from "convex/react";
import { useState } from "react";

import { api } from "@/convex/_generated/api";
import type {
	UploadFieldValue,
	WorkbenchField,
} from "@/features/course/lesson/model/manifest";
import { fieldLabelClass } from "./field-styles";
import { uploadFilesToLessonStorage } from "./upload-storage";
import { getUploadMetadata, getUploadMetadataList } from "./value-codecs";

export function UploadFieldControl({
	field,
	value,
	onChange,
}: {
	field: WorkbenchField;
	value: unknown;
	onChange: (value: unknown) => void;
}) {
	const generateUploadUrl = useMutation(api.uploads.generateUploadUrl);
	const uploads = getUploadMetadataList(value);
	const upload = getUploadMetadata(value);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const isMultiImageField = field.kind === "image_uploads";
	const previewUrl = upload?.previewUrl ?? upload?.url;
	const accept = field.kind === "video_upload" ? "video/*" : "image/*";
	const uploadPreviewKeyCounts = new Map<string, number>();

	return (
		<label className="block">
			<span className={fieldLabelClass}>{field.label}</span>
			<div className="mt-1 rounded-none border border-dashed border-product-border bg-product-surface px-2.5 py-2">
				<input
					type="file"
					accept={accept}
					multiple={isMultiImageField}
					disabled={isUploading}
					onChange={async (event) => {
						const files = Array.from(event.target.files ?? []);
						if (files.length === 0) {
							if (!isMultiImageField) {
								onChange({
									kind: "upload",
									status: "empty",
								} satisfies UploadFieldValue);
							}
							return;
						}

						setUploadError(null);
						setIsUploading(true);

						try {
							const nextUploads = await uploadFilesToLessonStorage({
								files,
								generateUploadUrl,
							});
							if (isMultiImageField) {
								onChange([...uploads, ...nextUploads]);
							} else {
								onChange(nextUploads[0] ?? { kind: "upload", status: "empty" });
							}
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
						<p>
							Uploading file{isMultiImageField ? "s" : ""} to lesson storage...
						</p>
					) : isMultiImageField && uploads.length > 0 ? (
						<>
							<p className="text-product-text">
								{uploads.length} image{uploads.length === 1 ? "" : "s"} saved
							</p>
							<p>Each image is stored before the lesson draft is saved.</p>
						</>
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
					{uploadError ? <p className="text-danger">{uploadError}</p> : null}
				</div>
				{isMultiImageField && uploads.length > 0 ? (
					<div className="mt-4 grid gap-2 sm:grid-cols-2">
						{uploads.map((item, index) => {
							const itemPreviewUrl = item.previewUrl ?? item.url;
							if (!itemPreviewUrl) {
								return null;
							}
							const keyBase = item.storageId ?? item.fileName ?? itemPreviewUrl;
							const keyOccurrence = uploadPreviewKeyCounts.get(keyBase) ?? 0;
							uploadPreviewKeyCounts.set(keyBase, keyOccurrence + 1);

							return (
								<img
									key={`${keyBase}-${keyOccurrence}`}
									src={itemPreviewUrl}
									alt={item.fileName ?? `Uploaded preview ${index + 1}`}
									className="max-h-48 w-full rounded-none border border-product-border object-cover"
								/>
							);
						})}
					</div>
				) : previewUrl ? (
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
