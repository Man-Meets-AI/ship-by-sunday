import { afterEach, describe, expect, it, vi } from "vitest";

import { uploadFilesToLessonStorage } from "@/features/course/lesson/workbench/fields/upload-storage";

const originalCreateObjectUrl = URL.createObjectURL;

afterEach(() => {
	Object.defineProperty(URL, "createObjectURL", {
		configurable: true,
		value: originalCreateObjectUrl,
	});
	vi.unstubAllGlobals();
});

describe("uploadFilesToLessonStorage", () => {
	it("uploads files through generated URLs and returns stored metadata", async () => {
		const createObjectUrl = vi.fn(() => "blob:preview");
		Object.defineProperty(URL, "createObjectURL", {
			configurable: true,
			value: createObjectUrl,
		});
		const fetchMock = vi.fn(async () => {
			return new Response(JSON.stringify({ storageId: "storage-123" }), {
				status: 200,
				headers: { "content-type": "application/json" },
			});
		});
		vi.stubGlobal("fetch", fetchMock);

		const file = new File(["image-bytes"], "reference.png", {
			type: "image/png",
		});
		const result = await uploadFilesToLessonStorage({
			files: [file],
			generateUploadUrl: async () => "https://uploads.example.com/upload",
		});

		expect(fetchMock).toHaveBeenCalledWith(
			"https://uploads.example.com/upload",
			{
				method: "POST",
				headers: { "Content-Type": "image/png" },
				body: file,
			},
		);
		expect(createObjectUrl).toHaveBeenCalledWith(file);
		expect(result).toEqual([
			{
				kind: "upload",
				status: "stored",
				fileName: "reference.png",
				mimeType: "image/png",
				size: file.size,
				storageId: "storage-123",
				previewUrl: "blob:preview",
			},
		]);
	});

	it("fails fast when the storage response omits a storage id", async () => {
		Object.defineProperty(URL, "createObjectURL", {
			configurable: true,
			value: vi.fn(() => "blob:preview"),
		});
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => {
				return new Response(JSON.stringify({}), {
					status: 200,
					headers: { "content-type": "application/json" },
				});
			}),
		);

		await expect(
			uploadFilesToLessonStorage({
				files: [new File(["bytes"], "missing-id.jpg", { type: "image/jpeg" })],
				generateUploadUrl: async () => "https://uploads.example.com/upload",
			}),
		).rejects.toThrow("Missing storage id");
	});
});
