import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { toastSuccessMock, writeTextMock } = vi.hoisted(() => ({
	toastSuccessMock: vi.fn(),
	writeTextMock: vi.fn(),
}));

vi.mock("sonner", () => ({
	toast: {
		success: toastSuccessMock,
	},
}));

import {
	type ArtifactPreview,
	getLessonById,
	getPromptTemplateState,
} from "@/features/course/lesson/model";
import { CopyPromptResourceCard } from "@/features/course/lesson/shells/copy-prompt-resource-card";

const pinnedArtifacts: ArtifactPreview[] = [
	{
		artifactKey: "user_statement",
		artifactLabel: "User statement",
		artifactType: "mixed",
		lessonId: "1.4",
		lessonTitle: "Pick One User",
		fieldValues: {
			selected_problem_owner: "Startup operators",
			selected_problem_statement:
				"They lose action items after meetings and waste time rebuilding them.",
			problem_when:
				"Right after team meetings when they need to share next steps fast.",
			problem_where: "At their desk, cleaning up scattered notes.",
			problem_trigger: "The meeting ends before owners are aligned.",
			pain_level: "High",
			pain_why_now:
				"If they do not ship a recap the same day, follow-ups die for a week.",
		},
		fields: [],
	},
	{
		artifactKey: "outcome_statement",
		artifactLabel: "Outcome statement",
		artifactType: "mixed",
		lessonId: "1.5",
		lessonTitle: "Define the Outcome",
		fieldValues: {
			messaging_person: "Startup operators",
			messaging_problem:
				"They lose action items after meetings and waste time rebuilding them.",
			messaging_what_it_does:
				"They can paste notes, review a usable action summary, and share it without rebuilding everything by hand.",
			messaging_benefit:
				"They stop losing decisions in messy notes and can close the loop while the meeting is still fresh.",
			outcome_statement_body:
				"Startup operators leave a meeting with a clean action summary they can review and send in minutes.",
		},
		fields: [],
	},
];

describe("CopyPromptResourceCard interactions", () => {
	beforeEach(() => {
		toastSuccessMock.mockReset();
		writeTextMock.mockReset();
		writeTextMock.mockResolvedValue(undefined);
		Object.defineProperty(navigator, "clipboard", {
			configurable: true,
			value: {
				writeText: writeTextMock,
			},
		});
	});

	it("copies the 1.6 research prompt and shows the research toast", async () => {
		const lesson = getLessonById("1.6");
		expect(lesson).toBeTruthy();
		if (!lesson) {
			throw new Error("Expected lesson 1.6 to exist.");
		}

		const resource = lesson.content.coach.resources?.find(
			(candidate) => candidate.kind === "copy_prompt",
		);
		expect(resource).toBeTruthy();
		if (!resource || resource.kind !== "copy_prompt") {
			throw new Error("Expected lesson 1.6 to expose a copy prompt resource.");
		}

		const promptState = getPromptTemplateState(
			resource.promptTemplateId,
			pinnedArtifacts,
		);
		expect(promptState.disabledReason).toBeNull();
		expect(promptState.prompt).toBeTruthy();

		render(
			<CopyPromptResourceCard
				resource={resource}
				pinnedArtifacts={pinnedArtifacts}
			/>,
		);

		fireEvent.click(screen.getByRole("button", { name: "Copy prompt" }));

		await waitFor(() => {
			expect(writeTextMock).toHaveBeenCalledWith(promptState.prompt);
		});
		await waitFor(() => {
			expect(toastSuccessMock).toHaveBeenCalledWith(
				"Copied the research prompt. Go paste it in your favorite model.",
			);
		});
		await waitFor(() => {
			expect(screen.getByRole("button", { name: "Copied" })).toBeTruthy();
		});
	});
});
