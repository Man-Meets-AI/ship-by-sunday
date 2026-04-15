import { describe, expect, it } from "vitest";

import { formatBlogDate } from "@/features/blog/lib/blog-formatters";

describe("blog date formatting", () => {
	it("keeps date-only frontmatter stable across local timezones", () => {
		expect(formatBlogDate("2026-03-26")).toBe("March 26, 2026");
	});

	it("still formats full ISO timestamps", () => {
		expect(formatBlogDate("2026-03-26T18:00:00.000Z")).toBe("March 26, 2026");
	});
});
