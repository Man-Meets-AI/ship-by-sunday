import { describe, expect, it } from "vitest";

import { parseCsv } from "../../../../qa/scripts/lib/csv.mjs";

describe("qa csv parsing", () => {
	it("tracks malformed rows when a free-text cell contains an unquoted comma", () => {
		const parsed = parseCsv(
			["scenario_id,notes", 'GOOD,"quoted, note"', "BAD,unquoted, note"].join(
				"\n",
			),
		);

		expect(parsed.malformedRows).toEqual([
			{
				cellCount: 3,
				headersCount: 2,
				lineNumber: 3,
				row: ["BAD", "unquoted", " note"],
			},
		]);
	});

	it("preserves quoted commas in valid rows", () => {
		const parsed = parseCsv(
			["scenario_id,notes", 'GOOD,"quoted, note"'].join("\n"),
		);

		expect(parsed.records).toEqual([
			{
				scenario_id: "GOOD",
				notes: "quoted, note",
			},
		]);
		expect(parsed.malformedRows).toEqual([]);
	});
});
