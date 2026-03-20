"use client";

import type {
	LessonStorageId,
	UploadFieldValue,
} from "@/features/course/lesson/model/manifest";

export async function uploadFilesToLessonStorage({
	files,
	generateUploadUrl,
}: {
	files: File[];
	generateUploadUrl: () => Promise<string>;
}): Promise<UploadFieldValue[]> {
	return Promise.all(
		files.map(async (file) => {
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
			const storageId = result.storageId as LessonStorageId;

			return {
				kind: "upload",
				status: "stored",
				fileName: file.name,
				mimeType: file.type,
				size: file.size,
				storageId,
				previewUrl: URL.createObjectURL(file),
			} satisfies UploadFieldValue;
		}),
	);
}
