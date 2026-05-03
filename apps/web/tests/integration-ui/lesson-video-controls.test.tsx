import { beforeEach, describe, expect, it, vi } from "vitest";

const reducedMotionSim = vi.hoisted(() => ({ current: false }));

vi.mock("motion/react", async (importOriginal) => {
	const actual = await importOriginal<typeof import("motion/react")>();
	return {
		...actual,
		useReducedMotion: () => reducedMotionSim.current,
	};
});

import React, { useRef } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { getLessonById } from "@/lib/course/lesson/model";
import { LessonVideoSurface } from "@/app/(workspace)/_components/course/lesson/components/lesson-video-surface";
import { useBunnyPlayerKeyboard } from "@/app/(workspace)/_components/course/lesson/components/use-bunny-player-controls";

function BunnyKeyboardHarness({
	postMessageSpy,
	fullscreenMock,
}: {
	postMessageSpy: (payload: string) => void;
	fullscreenMock: () => Promise<void>;
}) {
	const iframeRef = useRef<HTMLIFrameElement | null>(null);
	const { onKeyDown } = useBunnyPlayerKeyboard(iframeRef, true);
	return (
		<div
			data-testid="lesson-video-focus-catcher"
			tabIndex={0}
			onKeyDown={onKeyDown}
		>
			<iframe
				title="lesson-test"
				src="about:blank"
				ref={(el) => {
					iframeRef.current = el;
					if (el) {
						Object.defineProperty(el, "contentWindow", {
							value: { postMessage: postMessageSpy },
							configurable: true,
						});
						Object.defineProperty(el, "requestFullscreen", {
							value: fullscreenMock,
							configurable: true,
						});
					}
				}}
			/>
		</div>
	);
}

describe("LessonVideoControls / watch bare surface", () => {
	beforeEach(() => {
		reducedMotionSim.current = false;
	});
	it("renders Bunny affordance with kbd hints on watch-shell bare when video is ready", () => {
		const lesson = getLessonById("3.0");
		expect(lesson).toBeTruthy();
		if (!lesson) throw new Error("Expected lesson 3.0");

		render(
			<LessonVideoSurface
				coachContent={lesson.content.coach}
				variant="watch-shell"
				playerFrame="bare"
			/>,
		);

		const controls = screen.getByTestId("lesson-video-controls");
		expect(controls.getAttribute("data-variant")).toBe("bunny-forward");
		expect(screen.getByTestId("lesson-video-control-key-space")).toBeTruthy();
		expect(screen.getByTestId("lesson-video-control-key-seek")).toBeTruthy();
		expect(
			screen.getByTestId("lesson-video-control-key-fullscreen"),
		).toBeTruthy();
		expect(
			screen.getByTestId("lesson-video-control-key-captions"),
		).toBeTruthy();
		expect(screen.getByTestId("lesson-video-focus-catcher")).toBeTruthy();
	});

	it("does not render controls row when the video is not ready", () => {
		const lesson = getLessonById("4.0");
		expect(lesson).toBeTruthy();
		if (!lesson) throw new Error("Expected lesson 4.0");

		render(
			<LessonVideoSurface
				coachContent={{
					...lesson.content.coach,
					video: { status: "pending", title: "T" },
				}}
				variant="watch-shell"
				playerFrame="bare"
			/>,
		);

		expect(screen.queryByTestId("lesson-video-controls")).toBeNull();
	});

	it("uses embed-help copy for non-Bunny ready video on watch-shell bare", () => {
		const lesson = getLessonById("3.0");
		expect(lesson).toBeTruthy();
		if (!lesson) throw new Error("Expected lesson 3.0");

		render(
			<LessonVideoSurface
				coachContent={{
					...lesson.content.coach,
					video: {
						status: "ready",
						provider: "file",
						url: "https://example.com/lesson.mp4",
						title: "Test",
						durationLabel: "1m",
					},
				}}
				variant="watch-shell"
				playerFrame="bare"
			/>,
		);

		const controls = screen.getByTestId("lesson-video-controls");
		expect(controls.getAttribute("data-variant")).toBe("embed-help");
	});

	it("marks reduced-motion preference on the controls row when useReducedMotion is true", () => {
		reducedMotionSim.current = true;

		const lesson = getLessonById("3.0");
		expect(lesson).toBeTruthy();
		if (!lesson) throw new Error("Expected lesson 3.0");

		render(
			<LessonVideoSurface
				coachContent={lesson.content.coach}
				variant="watch-shell"
				playerFrame="bare"
			/>,
		);

		expect(
			screen.getByTestId("lesson-video-controls").dataset.prefersReducedMotion,
		).toBe("true");
	});

	it("forwards Space to player.js pause when getPaused does not answer", async () => {
		const postMessageSpy = vi.fn();
		const fullscreenMock = vi.fn().mockResolvedValue(undefined);
		render(
			<BunnyKeyboardHarness
				postMessageSpy={postMessageSpy}
				fullscreenMock={fullscreenMock}
			/>,
		);

		const catcher = screen.getByTestId("lesson-video-focus-catcher");
		catcher.focus();
		fireEvent.keyDown(catcher, { key: " ", bubbles: true });

		await waitFor(() => {
			const payloads = postMessageSpy.mock.calls.map((c) => String(c[0]));
			expect(payloads.some((p) => p.includes('"method":"getPaused"'))).toBe(
				true,
			);
			expect(payloads.some((p) => p.includes('"method":"pause"'))).toBe(true);
		});
	});

	it("requests fullscreen on F", async () => {
		const postMessageSpy = vi.fn();
		const fullscreenMock = vi.fn().mockResolvedValue(undefined);
		render(
			<BunnyKeyboardHarness
				postMessageSpy={postMessageSpy}
				fullscreenMock={fullscreenMock}
			/>,
		);

		const catcher = screen.getByTestId("lesson-video-focus-catcher");
		catcher.focus();
		fireEvent.keyDown(catcher, { key: "f", bubbles: true });

		await waitFor(() => {
			expect(fullscreenMock).toHaveBeenCalled();
		});
	});
});
