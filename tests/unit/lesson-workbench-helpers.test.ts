import {
	formatTablePreview,
	getFilledTableRows,
	getLabeledTableRows,
	getTableRows,
} from "@/features/course/lesson/model/table";
import {
	getUploadMetadata,
	getUploadMetadataList,
	normalizeChecklistValue,
	parseLines,
	parseTable,
	toLineList,
	toTableText,
} from "@/features/course/lesson/workbench/fields/value-codecs";
import {
	appendSketchUploads,
	removeSketchUploadAt,
	replaceSketchUploads,
} from "@/features/course/lesson/workbench/modes/sketch-upload-workbench";
import { formatArtifactValue } from "@/features/course/lesson/workbench/shared/artifact-format";

describe("lesson workbench helpers", () => {
	it("round-trips line-list values", () => {
		const input = "first item\n second item \n\nthird item";

		expect(parseLines(input)).toEqual([
			"first item",
			"second item",
			"third item",
		]);
		expect(toLineList(parseLines(input))).toBe(
			"first item\nsecond item\nthird item",
		);
	});

	it("round-trips table values", () => {
		const input = "Alpha | Beta\nGamma| Delta ";

		expect(parseTable(input)).toEqual([
			["Alpha", "Beta"],
			["Gamma", "Delta"],
		]);
		expect(toTableText(parseTable(input))).toBe("Alpha | Beta\nGamma | Delta");
	});

	it("coerces table rows to the declared column count", () => {
		const columns = [
			{ id: "competitor", label: "Competitor", kind: "text" as const },
			{ id: "good", label: "Good", kind: "text" as const },
			{ id: "poor", label: "Poor", kind: "text" as const },
		];

		expect(
			getTableRows([["Alpha"], ["Beta", "Fast", "Clunky", "Ignore"]], columns),
		).toEqual([
			["Alpha", "", ""],
			["Beta", "Fast", "Clunky"],
		]);
	});

	it("ignores blank rows when deriving filled table data", () => {
		const columns = [
			{ id: "source", label: "Source", kind: "text" as const },
			{ id: "feedback", label: "Feedback", kind: "text" as const },
		];

		expect(
			getFilledTableRows(
				[
					["", ""],
					["Reddit", "Wanted export"],
				],
				columns,
			),
		).toEqual([["Reddit", "Wanted export"]]);
		expect(
			getLabeledTableRows(
				[
					["", ""],
					["Reddit", "Wanted export"],
				],
				columns,
			),
		).toEqual([{ source: "Reddit", feedback: "Wanted export" }]);
	});

	it("formats nested table arrays as readable previews", () => {
		expect(
			formatArtifactValue([
				["Notion", "Fast setup", "Weak structure"],
				["Coda", "Flexible", "Too much setup"],
			]),
		).toBe(
			"2 rows: Notion | Fast setup | Weak structure; Coda | Flexible | Too much setup",
		);
	});

	it("formats labeled table previews from column metadata", () => {
		const columns = [
			{ id: "person", label: "Person", kind: "text" as const },
			{ id: "channel", label: "Channel", kind: "text" as const },
			{
				id: "sent",
				label: "Sent?",
				kind: "select" as const,
				options: ["Yes", "No"],
			},
		];

		expect(
			formatTablePreview(
				[
					["Ava", "Email", "Yes"],
					["Leo", "DM", "No"],
				],
				columns,
			),
		).toBe(
			"2 rows: Person: Ava | Channel: Email | Sent?: Yes; Person: Leo | Channel: DM | Sent?: No",
		);
	});

	it("normalizes checklist values from existing structured entries", () => {
		expect(
			normalizeChecklistValue(
				[
					{ label: "One", checked: true },
					{ label: "Two", checked: false },
				],
				["One", "Two", "Three"],
			),
		).toEqual([
			{ label: "One", checked: true },
			{ label: "Two", checked: false },
			{ label: "Three", checked: false },
		]);
	});

	it("normalizes checklist values from legacy string arrays", () => {
		expect(normalizeChecklistValue(["Two"], ["One", "Two"])).toEqual([
			{ label: "One", checked: false },
			{ label: "Two", checked: true },
		]);
	});

	it("detects upload metadata payloads", () => {
		const uploadValue = {
			kind: "upload",
			status: "stored",
			fileName: "flow.png",
			storageId: "abc123",
		};

		expect(getUploadMetadata(uploadValue)).toEqual(uploadValue);
		expect(getUploadMetadata("nope")).toBeNull();
		expect(getUploadMetadataList([uploadValue, "nope"])).toEqual([uploadValue]);
	});

	it("formats artifact values for uploads and checklist selections", () => {
		expect(
			formatArtifactValue({
				kind: "upload",
				status: "stored",
				fileName: "flow.png",
			}),
		).toBe("flow.png");
		expect(
			formatArtifactValue([
				{ label: "Open the starter or repo", checked: true },
				{ label: "Install dependencies", checked: false },
				{ label: "Run the app locally", checked: true },
			]),
		).toBe("Open the starter or repo, Run the app locally");
		expect(
			formatArtifactValue([
				{
					kind: "upload",
					status: "stored",
					fileName: "screen-1.jpg",
					storageId: "sketch-1",
				},
				{
					kind: "upload",
					status: "stored",
					fileName: "screen-2.jpg",
					storageId: "sketch-2",
				},
			]),
		).toBe("2 images uploaded");
	});

	it("adds, replaces, and removes sketch uploads without disturbing the remaining gallery", () => {
		const first = [
			{
				kind: "upload" as const,
				status: "stored" as const,
				fileName: "screen-1.jpg",
				storageId: "sketch-1",
			},
		];
		const second = [
			{
				kind: "upload" as const,
				status: "stored" as const,
				fileName: "screen-2.jpg",
				storageId: "sketch-2",
			},
			{
				kind: "upload" as const,
				status: "stored" as const,
				fileName: "screen-3.jpg",
				storageId: "sketch-3",
			},
		];

		const appended = appendSketchUploads(first, second);
		expect(appended.map((item) => item.storageId)).toEqual([
			"sketch-1",
			"sketch-2",
			"sketch-3",
		]);
		expect(
			removeSketchUploadAt(appended, 1).map((item) => item.storageId),
		).toEqual(["sketch-1", "sketch-3"]);
		expect(
			replaceSketchUploads(appended, second).map((item) => item.storageId),
		).toEqual(["sketch-2", "sketch-3"]);
	});
});
