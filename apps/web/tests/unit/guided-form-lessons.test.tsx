/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import { getLessonById } from "@/lib/course/lesson/model";
import { FieldControl } from "@/app/(workspace)/_components/course/lesson/workbench/fields/field-control";
import { WorkbenchRenderer } from "@/app/(workspace)/_components/course/lesson/workbench/renderer";

function StatefulRadioField() {
	const [value, setValue] = useState("");

	return (
		<div>
			<FieldControl
				field={{
					id: "frequency",
					label: "How frequent is this problem?",
					kind: "radio_group",
					options: ["Hourly", "Daily", "Weekly", "Monthly"],
				}}
				value={value}
				onChange={(next) =>
					setValue(typeof next === "string" ? next : String(next ?? ""))
				}
				pinnedArtifacts={[]}
			/>
			<p data-testid="selected-frequency">{value}</p>
		</div>
	);
}

describe("restored guided-form lessons", () => {
	it("persists radio_group selections as strings", async () => {
		const user = userEvent.setup();
		render(<StatefulRadioField />);

		await user.click(screen.getByRole("radio", { name: "Daily" }));

		expect(screen.getByTestId("selected-frequency").textContent).toBe("Daily");
	});

	it("renders the full three-problem form on Start With the Problem", () => {
		const lesson = getLessonById("1.3");
		expect(lesson).toBeTruthy();
		if (!lesson) {
			throw new Error("Expected lesson 1.3 to exist.");
		}

		render(
			<WorkbenchRenderer
				lesson={lesson}
				lessonContent={lesson.content}
				fieldValues={{}}
				onFieldChange={() => {}}
				pinnedArtifacts={[]}
				layoutMode="focus"
			/>,
		);

		// Three guided candidate sections only (compare workbench removed).
		expect(screen.getAllByText("Who has this problem?")).toHaveLength(3);
		expect(
			screen.getAllByText("What recurring pain do they keep running into?"),
		).toHaveLength(3);
		expect(screen.getAllByText("How frequent is this problem?")).toHaveLength(
			3,
		);
		expect(screen.getAllByText("How painful is the problem?")).toHaveLength(3);
		expect(screen.getAllByText("Hourly")).toHaveLength(3);
		const severitySelects = screen.getAllByRole("combobox", {
			name: /How painful is the problem/i,
		});
		expect(severitySelects).toHaveLength(3);
	});

	it("renders handoff problem selection plus qualification fields on Pick One User", () => {
		const lesson = getLessonById("1.4");
		expect(lesson).toBeTruthy();
		if (!lesson) {
			throw new Error("Expected lesson 1.4 to exist.");
		}

		const pinnedArtifacts = [
			{
				artifactKey: "candidate_problems",
				artifactLabel: "3 Candidate Problems",
				artifactType: "mixed" as const,
				lessonId: "1.3",
				lessonTitle: "Start With the Problem",
				fieldValues: {
					problem_1_who: "Independent fitness coach",
					problem_1_pain:
						"Every week they rebuild client workout plans from scattered notes.",
					problem_2_who: "Solo recruiter",
					problem_2_pain:
						"Every day they chase interview feedback across email and Slack.",
					problem_3_who: "Agency founder",
					problem_3_pain:
						"Every month they lose client context between kickoff and delivery.",
				},
				fields: [],
			},
		];

		render(
			<WorkbenchRenderer
				lesson={lesson}
				lessonContent={lesson.content}
				fieldValues={{}}
				onFieldChange={() => {}}
				pinnedArtifacts={pinnedArtifacts}
				layoutMode="focus"
			/>,
		);

		expect(screen.getByText("Your three problem candidates")).toBeTruthy();
		expect(screen.getByText("Independent fitness coach")).toBeTruthy();
		expect(screen.getByText("Solo recruiter")).toBeTruthy();
		expect(screen.getByText("Agency founder")).toBeTruthy();
		expect(
			screen.getByRole("textbox", {
				name: "When does this problem happen?",
			}),
		).toBeTruthy();
		expect(
			screen.getByRole("textbox", {
				name: "Where / in what situation does it happen?",
			}),
		).toBeTruthy();
		expect(
			screen.getByRole("textbox", { name: "What is the trigger?" }),
		).toBeTruthy();
		expect(
			screen.getByRole("combobox", { name: "How painful is this?" }),
		).toBeTruthy();
		expect(
			screen.getByRole("textbox", {
				name: "Why is this painful enough to solve now?",
			}),
		).toBeTruthy();
		expect(
			screen.getAllByText("Selected user problem brief").length,
		).toBeGreaterThan(0);
		expect(screen.getAllByRole("radio")).toHaveLength(3);
	});

	it("renders Codex orientation panel and capture fields on CEO Skills (1.9)", () => {
		const lesson = getLessonById("1.9");
		expect(lesson).toBeTruthy();
		if (!lesson) {
			throw new Error("Expected lesson 1.9 to exist.");
		}

		render(
			<WorkbenchRenderer
				lesson={lesson}
				lessonContent={lesson.content}
				fieldValues={{}}
				onFieldChange={() => {}}
				pinnedArtifacts={[]}
				layoutMode="focus"
			/>,
		);

		expect(screen.getByText("Codex & skills")).toBeTruthy();
		expect(screen.getByText("What you should see in Codex")).toBeTruthy();
		expect(
			screen.getByRole("textbox", { name: "Project / folder name" }),
		).toBeTruthy();
		expect(
			screen.getByRole("textbox", {
				name: "What am I building and what problem does it solve?",
			}),
		).toBeTruthy();
	});
});
