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

import { getLessonById } from "@/features/course/lesson/model";
import { CopyPromptResourceCard } from "@/features/course/lesson/shells/copy-prompt-resource-card";

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

		expect(resource.body).toContain("Research Table");
		expect(resource.body).toContain("What this means for my v1");

		render(<CopyPromptResourceCard resource={resource} pinnedArtifacts={[]} />);

		fireEvent.click(screen.getByRole("button", { name: "Copy prompt" }));

		await waitFor(() => {
			expect(writeTextMock).toHaveBeenCalledWith(resource.body?.trim());
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
