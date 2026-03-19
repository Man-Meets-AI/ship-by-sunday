/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import { getLessonById } from "@/features/course/lesson/model";
import { FieldControl } from "@/features/course/lesson/workbench/fields/field-control";
import { WorkbenchRenderer } from "@/features/course/lesson/workbench/renderer";

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
				onChange={setValue}
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

		// Guided sections (3) plus compare UI: desktop grid (3) and one mounted mobile tab panel (1).
		expect(screen.getAllByText("Who has this problem?")).toHaveLength(7);
		expect(
			screen.getAllByText("What recurring pain do they keep running into?"),
		).toHaveLength(7);
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

	it("renders handoff problem selection plus detail fields on Pick One User", () => {
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

		expect(screen.getByText("Pick the problem to carry forward")).toBeTruthy();
		expect(screen.getByText("Independent fitness coach")).toBeTruthy();
		expect(screen.getByText("Solo recruiter")).toBeTruthy();
		expect(screen.getByText("Agency founder")).toBeTruthy();
		expect(
			screen.getByText("What exact moment makes this painful?"),
		).toBeTruthy();
		expect(screen.getByText("How do they handle it today?")).toBeTruthy();
		expect(screen.getByText("How can you reach them this week?")).toBeTruthy();
		expect(screen.getByText("User statement preview")).toBeTruthy();
		expect(screen.getAllByText("Use this problem")).toHaveLength(3);
	});
});
