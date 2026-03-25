import JSZip from "jszip";
import { createCompleteProjectDefinition } from "../src";
import {
	buildBuildPacketArchive,
	buildDesignPacketArchive,
	buildMarketingPacketArchive,
} from "../src/server";

async function listArchiveEntries(buffer: Buffer) {
	const zip = await JSZip.loadAsync(buffer);
	return Object.keys(zip.files).sort();
}

describe("packet archives", () => {
	it("builds the design packet archive", async () => {
		const entries = await listArchiveEntries(
			await buildDesignPacketArchive(createCompleteProjectDefinition()),
		);

		expect(entries).toEqual(
			expect.arrayContaining([
				"packet/design/AGENTS.md",
				"packet/design/CHECKLIST.md",
				"packet/facts/project-definition.json",
			]),
		);
	});

	it("builds the marketing packet archive", async () => {
		const entries = await listArchiveEntries(
			await buildMarketingPacketArchive(createCompleteProjectDefinition()),
		);

		expect(entries).toEqual(
			expect.arrayContaining([
				"packet/marketing/AGENTS.md",
				"packet/marketing/README.md",
				"packet/facts/project-definition.json",
			]),
		);
	});

	it("builds the build packet archive", async () => {
		const entries = await listArchiveEntries(
			await buildBuildPacketArchive(createCompleteProjectDefinition()),
		);

		expect(entries).toEqual(
			expect.arrayContaining([
				"packet/build/AGENTS.md",
				"packet/build/docs/prompt.md",
				"packet/facts/project-definition.json",
			]),
		);
	});
});
