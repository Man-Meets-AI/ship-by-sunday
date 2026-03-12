"use client";

import { useState } from "react";
import { useMutation } from "convex/react";

import { api } from "@/convex/_generated/api";
import type { UploadFieldValue, WorkbenchField } from "@/lib/course/manifest";

import { getUploadMetadata } from "./value-codecs";
import { fieldLabelClass } from "./field-styles";

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
	const upload = getUploadMetadata(value);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const previewUrl = upload?.previewUrl ?? upload?.url;

	return (
		<label className="block">
			<span className={fieldLabelClass}>{field.label}</span>
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
