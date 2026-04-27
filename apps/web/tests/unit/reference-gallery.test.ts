import {
	createReferenceGalleryValue,
	getReferenceGalleryCount,
	hydrateReferenceGalleryValue,
	toPersistedReferenceGalleryValue,
} from "@/lib/course/lesson/model";

describe("reference gallery helpers", () => {
	it("hydrates stored gallery uploads back into public URLs", async () => {
		const hydrated = await hydrateReferenceGalleryValue(
			createReferenceGalleryValue([
				{
					id: "upload-1",
					source: "upload",
					storageId: "storage-1",
					fileName: "hero.png",
				},
				{
					id: "remote-1",
					source: "remote_url",
					url: "https://images.example.com/ref.png",
				},
			]),
			async (storageId) =>
				storageId === "storage-1"
					? "https://cdn.example.com/storage-1.png"
					: null,
		);

		expect(hydrated).toEqual({
			kind: "reference_gallery",
			items: [
				{
					id: "upload-1",
					source: "upload",
					storageId: "storage-1",
					fileName: "hero.png",
					url: "https://cdn.example.com/storage-1.png",
				},
				{
					id: "remote-1",
					source: "remote_url",
					url: "https://images.example.com/ref.png",
				},
			],
		});
	});

	it("ignores remote references that do not include an image URL", () => {
		const value = createReferenceGalleryValue([
			{
				id: "remote-1",
				source: "remote_url",
				url: "https://images.example.com/ref.png",
			},
			{
				id: "remote-2",
				source: "remote_url",
				fileName: "Product brief block",
			},
		]);

		expect(getReferenceGalleryCount(value)).toBe(1);
		expect(toPersistedReferenceGalleryValue(value)).toEqual({
			kind: "reference_gallery",
			items: [
				{
					id: "remote-1",
					source: "remote_url",
					url: "https://images.example.com/ref.png",
					fileName: undefined,
				},
			],
		});
	});
});
