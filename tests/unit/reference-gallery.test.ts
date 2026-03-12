import {
	createReferenceGalleryValue,
	hydrateReferenceGalleryValue,
} from "@/lib/course";

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
});
