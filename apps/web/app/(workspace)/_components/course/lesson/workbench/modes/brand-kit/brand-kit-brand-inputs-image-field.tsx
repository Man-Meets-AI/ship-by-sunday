"use client";

import { useMutation } from "convex/react";
import { useState, type ReactNode } from "react";

import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import type {
	UploadFieldValue,
	WorkbenchField,
} from "@/lib/course/lesson/model/manifest";
import { uploadFilesToLessonStorage } from "../../fields/upload-storage";
import { getUploadMetadata } from "../../fields/value-codecs";

export function BrandKitBrandInputsImageField({
	field,
	value,
	onChange,
	help,
}: {
	field: WorkbenchField;
	value: unknown;
	onChange: (value: unknown) => void;
	help: ReactNode;
}) {
	const generateUploadUrl = useMutation(api.uploads.generateUploadUrl);
	const upload = getUploadMetadata(value);
	const [isUploading, setIsUploading] = useState(false);
	const [uploadError, setUploadError] = useState<string | null>(null);
	const previewUrl = upload?.previewUrl ?? upload?.url;

	return (
		<Field className="w-full">
			<FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
			{help}
			<FieldContent className="gap-2">
				<Input
					id={field.id}
					type="file"
					accept="image/*"
					disabled={isUploading}
					onChange={async (event) => {
						const files = Array.from(event.target.files ?? []);
						if (files.length === 0) {
							onChange({
								kind: "upload",
								status: "empty",
							} satisfies UploadFieldValue);
							return;
						}

						setUploadError(null);
						setIsUploading(true);

						try {
							const nextUploads = await uploadFilesToLessonStorage({
								files,
								generateUploadUrl,
							});
							onChange(nextUploads[0] ?? { kind: "upload", status: "empty" });
						} catch {
							setUploadError("Upload failed. Try again.");
						} finally {
							setIsUploading(false);
							event.target.value = "";
						}
					}}
				/>
				{isUploading ? (
					<FieldDescription>Uploading to lesson storage…</FieldDescription>
				) : upload?.fileName ? (
					<FieldDescription>
						{upload.fileName} — saved with this lesson.
					</FieldDescription>
				) : (
					<FieldDescription>
						Choose a file; it uploads to lesson storage before you save the
						draft.
					</FieldDescription>
				)}
				{uploadError ? <FieldError>{uploadError}</FieldError> : null}
				{previewUrl ? (
					<img
						src={previewUrl}
						alt={upload?.fileName ?? "Upload preview"}
						className="mt-2 max-h-64 w-full rounded-md border object-contain"
					/>
				) : null}
			</FieldContent>
		</Field>
	);
}
