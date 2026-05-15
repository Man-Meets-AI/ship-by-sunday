import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
	allowsUnknownBoundaryType,
	collectUnknownBoundaryViolations,
	formatUnknownBoundaryViolations,
} from "../../../../scripts/static-analysis/unknown-boundary-lint";

describe("unknown boundary lint", () => {
	let fixtureRoot: string;

	beforeEach(() => {
		fixtureRoot = mkdtempSync(path.join(tmpdir(), "unknown-boundary-lint-"));
	});

	afterEach(() => {
		rmSync(fixtureRoot, { force: true, recursive: true });
	});

	it("flags explicit unknown types outside route and DB boundaries", () => {
		writeFixture(
			"apps/web/src/lib/not-a-boundary.ts",
			"export type LeakyValue = unknown;\n",
		);

		expect(collectUnknownBoundaryViolations(fixtureRoot, ["apps/web"])).toEqual(
			[
				{
					relativePath: "apps/web/src/lib/not-a-boundary.ts",
					line: 1,
					column: 26,
				},
			],
		);
	});

	it("allows explicit unknown types in route handlers and DB-loading paths", () => {
		writeFixture(
			"apps/web/src/app/api/example/route.ts",
			"export type RoutePayload = unknown;\n",
		);
		writeFixture(
			"apps/web/convex/model.ts",
			"export type DbPayload = unknown;\n",
		);
		writeFixture(
			"apps/web/src/app/(app)/_lib/workspace-support-read-model.ts",
			"export type ReadModelPayload = unknown;\n",
		);

		expect(collectUnknownBoundaryViolations(fixtureRoot, ["apps/web"])).toEqual(
			[],
		);
	});

	it("flags explicit unknown types in API helper modules", () => {
		writeFixture(
			"apps/web/src/app/api/example/_server/helper.ts",
			"export type HelperPayload = unknown;\n",
		);

		expect(collectUnknownBoundaryViolations(fixtureRoot, ["apps/web"])).toEqual(
			[
				{
					relativePath: "apps/web/src/app/api/example/_server/helper.ts",
					line: 1,
					column: 29,
				},
			],
		);
	});

	it("ignores string literals and test files", () => {
		writeFixture(
			"apps/web/src/lib/status.ts",
			'export const status = "unknown";\n',
		);
		writeFixture(
			"apps/web/tests/unit/not-a-source.test.ts",
			"export type TestPayload = unknown;\n",
		);

		expect(collectUnknownBoundaryViolations(fixtureRoot, ["apps/web"])).toEqual(
			[],
		);
	});

	it("formats violations with actionable guidance", () => {
		expect(
			formatUnknownBoundaryViolations([
				{
					relativePath: "apps/web/src/lib/not-a-boundary.ts",
					line: 1,
					column: 25,
				},
			]),
		).toContain(
			"Move validation to those boundaries, then pass typed values through the source tree.",
		);
	});

	it("documents allowed boundary paths", () => {
		expect(
			allowsUnknownBoundaryType("apps/web/src/app/api/example/route.ts"),
		).toBe(true);
		expect(allowsUnknownBoundaryType("apps/web/convex/model.ts")).toBe(true);
		expect(
			allowsUnknownBoundaryType(
				"apps/web/src/app/(app)/_lib/workspace-support-read-model.ts",
			),
		).toBe(true);
		expect(
			allowsUnknownBoundaryType(
				"apps/web/src/app/api/example/_server/helper.ts",
			),
		).toBe(false);
		expect(
			allowsUnknownBoundaryType("apps/web/src/lib/not-a-boundary.ts"),
		).toBe(false);
	});

	function writeFixture(relativePath: string, contents: string) {
		const absolutePath = path.join(fixtureRoot, relativePath);
		mkdirSync(path.dirname(absolutePath), { recursive: true });
		writeFileSync(absolutePath, contents, { flush: true });
	}
});
