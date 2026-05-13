import { describe, expect, it } from "vitest";

import {
	buildDocsMetadata,
	getDocsMetadataDefaults,
} from "@/app/docs/_lib/docs-metadata";

describe("docs metadata helpers", () => {
	it("provides canonical and social defaults for the docs landing page", () => {
		const metadata = getDocsMetadataDefaults();

		expect(metadata.alternates?.canonical).toBe("/docs");
		expect(metadata.robots).toMatchObject({
			index: false,
			follow: false,
		});
		expect(metadata.openGraph?.url).toBe("/docs");
		expect(metadata.openGraph?.type).toBe("article");
		expect(metadata.twitter?.card).toBe("summary_large_image");
	});

	it("merges docs page metadata with per-page canonical and social fields", () => {
		const metadata = buildDocsMetadata({
			mdxPath: ["local-setup"],
			metadata: {
				title: "Local Setup",
				description: "Get the starter running locally.",
			},
		});

		expect(metadata.alternates?.canonical).toBe("/docs/local-setup");
		expect(metadata.robots).toMatchObject({
			index: false,
			follow: false,
		});
		expect(metadata.openGraph?.url).toBe("/docs/local-setup");
		expect(metadata.openGraph?.title).toBe("Local Setup");
		expect(metadata.openGraph?.description).toBe(
			"Get the starter running locally.",
		);
		expect(metadata.twitter?.title).toBe("Local Setup");
	});
});
