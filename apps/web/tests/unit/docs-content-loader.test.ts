import { describe, expect, it, vi } from "vitest";

import { getDocsContentEntries } from "@/app/_content/public-content-inventory";
import {
	getDocsContentLoaderKeys,
	getDocsContentMetadata,
} from "@/app/docs/_server/docs-content";

vi.mock("server-only", () => ({}));

function createSegmentsKey(segments: string[]) {
	return segments.join("/");
}

describe("docs content loader", () => {
	it("has a direct MDX loader for every docs inventory entry", async () => {
		const entries = await getDocsContentEntries();

		expect(getDocsContentLoaderKeys()).toEqual(
			entries.map((entry) => createSegmentsKey(entry.segments)).sort(),
		);
	});

	it("returns docs metadata from the inventory contract", async () => {
		await expect(getDocsContentMetadata(["local-setup"])).resolves.toEqual({
			title: "Local Setup",
			description:
				"Boot the starter locally in the right order so auth, payments, and protected access do not drift out of sync.",
		});
		await expect(
			getDocsContentMetadata(["telegram-support-bot"]),
		).resolves.toEqual({
			title: "Telegram Support Bot",
			description:
				"Set up the first-party homepage support widget and the dedicated Telegram support bot that backs it.",
		});
	});

	it("returns null for unknown docs routes", async () => {
		await expect(getDocsContentMetadata(["missing"])).resolves.toBeNull();
	});
});
