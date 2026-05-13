import {
	formatTablePreview,
	getFilledTableRows,
	getLabeledTableRows,
	getTableRows,
} from "@/lib/course/lesson/model/table";
import {
	getUploadMetadata,
	getUploadMetadataList,
	normalizeChecklistValue,
} from "@/app/(protected)/_components/course/artifacts/preview/artifact-value-codecs";
import { formatArtifactValue } from "@/app/(protected)/_components/course/artifacts/preview/artifact-value-format";

describe("artifact preview formatting", () => {
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
});
