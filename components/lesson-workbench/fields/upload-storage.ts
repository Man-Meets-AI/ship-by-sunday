"use client";

import type { UploadFieldValue } from "@/lib/course/manifest";

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

			return {
				kind: "upload",
				status: "stored",
				fileName: file.name,
				mimeType: file.type,
				size: file.size,
				storageId: result.storageId,
				previewUrl: URL.createObjectURL(file),
			} satisfies UploadFieldValue;
		}),
	);
}
