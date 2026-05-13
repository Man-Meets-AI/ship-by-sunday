/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: pushMock,
	}),
}));

globalThis.React = React;

import { SkillRailShadcn as SkillRail } from "@/app/(protected)/_components/course/shared/components/skill-rail-shadcn";

function createRailLesson(
	lessonKey: string,
	displayLabel: string,
	shortTitle: string,
	status: "available" | "completed" | "in_progress" | "locked",
) {
	return {
		lessonKey,
		displayLabel,
		shortTitle,
		status,
	};
}

describe("SkillRail", () => {
	beforeEach(() => {
		pushMock.mockReset();
	});

	it("highlights the completing lesson and keeps the next step locked in markup", () => {
		const markup = renderToStaticMarkup(
			<SkillRail
				label="CEO"
				currentLessonId="welcome-to-ship-by-sunday"
				completionCue={{
					completedLessonId: "welcome-to-ship-by-sunday",
					nextLessonId: "how-the-sprint-works",
				}}
				lessons={[
					createRailLesson(
						"welcome-to-ship-by-sunday",
						"1.1",
						"Start",
						"in_progress",
					),
					createRailLesson(
						"how-the-sprint-works",
						"1.2",
						"Carry forward",
						"locked",
					),
				]}
			/>,
		);

		expect(markup).toContain("bg-primary/10");
		expect(markup).toContain("border-b-primary");
		expect(markup).toContain(">Previous<");
		expect(markup).toContain(">Next<");
		expect(markup).toContain("Carry forward");
		expect(markup).toContain('aria-current="step"');
		expect(markup).toContain('aria-label="Lesson 1.1. Start. Current lesson."');
		expect(markup).toContain('aria-label="Lesson 1.2. Carry forward. Locked."');
	});

	it("highlights completion on the final lesson without a next-unlock target", () => {
		const markup = renderToStaticMarkup(
			<SkillRail
				label="SHIP"
				currentLessonId="product-review"
				completionCue={{
					completedLessonId: "product-review",
					nextLessonId: null,
				}}
				lessons={[
					createRailLesson(
						"product-review",
						"4.0",
						"Final wrap",
						"in_progress",
					),
				]}
			/>,
		);

		expect(markup).toContain("bg-primary/10");
		expect(markup).toContain(
			'aria-label="Lesson 4.0. Final wrap. Current lesson."',
		);
		expect(markup).not.toContain("Lesson 4.1");
	});

	it("keeps the previous key enabled for completed lessons", () => {
		const markup = renderToStaticMarkup(
			<SkillRail
				label="CEO"
				currentLessonId="how-the-sprint-works"
				lessons={[
					createRailLesson(
						"welcome-to-ship-by-sunday",
						"1.1",
						"Problem",
						"completed",
					),
					createRailLesson(
						"how-the-sprint-works",
						"1.2",
						"User",
						"in_progress",
					),
					createRailLesson(
						"start-with-the-problem",
						"1.3",
						"Outcome",
						"available",
					),
				]}
			/>,
		);

		expect(markup).toContain('data-href="/lesson/welcome-to-ship-by-sunday"');
		expect(markup).toContain('aria-label="Open previous lesson: Problem"');
		expect(markup).toContain('data-disabled="false"');
	});

	it("disables the next key when the adjacent lesson is locked", () => {
		const markup = renderToStaticMarkup(
			<SkillRail
				label="CEO"
				currentLessonId="how-the-sprint-works"
				lessons={[
					createRailLesson(
						"welcome-to-ship-by-sunday",
						"1.1",
						"Problem",
						"completed",
					),
					createRailLesson(
						"how-the-sprint-works",
						"1.2",
						"User",
						"in_progress",
					),
					createRailLesson(
						"start-with-the-problem",
						"1.3",
						"Outcome",
						"locked",
					),
				]}
			/>,
		);

		expect(markup).toContain('aria-label="No next lesson available"');
		expect(markup).toContain('data-disabled="true"');
		expect(markup).not.toContain('data-href="/lesson/start-with-the-problem"');
	});

	it("uses navigation lessons to cross forward into the next stage while keeping the visible strip scoped", () => {
		const markup = renderToStaticMarkup(
			<SkillRail
				label="DESIGN"
				currentLessonId="design-references"
				lessons={[
					createRailLesson("design-references", "2.0", "Refs", "completed"),
				]}
				navigationLessons={[
					createRailLesson("design-references", "2.0", "Refs", "completed"),
					createRailLesson("map-the-core-flow", "2.1", "Scope", "available"),
				]}
			/>,
		);

		expect(markup).toContain('data-href="/lesson/map-the-core-flow"');
		expect(markup).toContain('aria-label="Open next stage: Scope"');
		expect(markup).toContain(">Refs<");
		expect(markup).not.toContain(">Scope<");
	});

	it("uses navigation lessons to cross backward into the previous stage", () => {
		const markup = renderToStaticMarkup(
			<SkillRail
				label="DESIGN"
				currentLessonId="map-the-core-flow"
				lessons={[
					createRailLesson("map-the-core-flow", "2.1", "Scope", "in_progress"),
					createRailLesson("find-references-first", "2.2", "Find", "available"),
				]}
				navigationLessons={[
					createRailLesson("design-references", "2.0", "Refs", "completed"),
					createRailLesson("map-the-core-flow", "2.1", "Scope", "in_progress"),
					createRailLesson("find-references-first", "2.2", "Find", "available"),
				]}
			/>,
		);

		expect(markup).toContain('data-href="/lesson/design-references"');
		expect(markup).toContain('aria-label="Open previous stage: Refs"');
		expect(markup).not.toContain(">Refs<");
	});

	it("navigates in place when a rail step is clicked", async () => {
		const user = userEvent.setup();

		render(
			<SkillRail
				label="CEO"
				currentLessonId="how-the-sprint-works"
				lessons={[
					createRailLesson(
						"welcome-to-ship-by-sunday",
						"1.1",
						"Problem",
						"completed",
					),
					createRailLesson(
						"how-the-sprint-works",
						"1.2",
						"User",
						"in_progress",
					),
					createRailLesson(
						"start-with-the-problem",
						"1.3",
						"Outcome",
						"available",
					),
				]}
			/>,
		);

		await user.click(
			screen.getByRole("button", {
				name: "Lesson 1.3. Outcome. Available lesson.",
			}),
		);

		expect(pushMock).toHaveBeenCalledWith("/lesson/start-with-the-problem", {
			scroll: false,
		});
	});

	it("disables adjacent nav at the first and last visible lesson", () => {
		const firstMarkup = renderToStaticMarkup(
			<SkillRail
				label="CEO"
				currentLessonId="welcome-to-ship-by-sunday"
				lessons={[
					createRailLesson(
						"welcome-to-ship-by-sunday",
						"1.1",
						"Problem",
						"in_progress",
					),
					createRailLesson("how-the-sprint-works", "1.2", "User", "available"),
				]}
			/>,
		);
		const lastMarkup = renderToStaticMarkup(
			<SkillRail
				label="CEO"
				currentLessonId="how-the-sprint-works"
				lessons={[
					createRailLesson(
						"welcome-to-ship-by-sunday",
						"1.1",
						"Problem",
						"completed",
					),
					createRailLesson(
						"how-the-sprint-works",
						"1.2",
						"User",
						"in_progress",
					),
				]}
			/>,
		);

		expect(firstMarkup).toContain('aria-label="No previous lesson available"');
		expect(firstMarkup).toContain('data-disabled="true"');
		expect(lastMarkup).toContain('aria-label="No next lesson available"');
		expect(lastMarkup).toContain('data-disabled="true"');
	});

	it("keeps Q and E hidden when there is no current lesson", () => {
		const markup = renderToStaticMarkup(
			<SkillRail
				label="CEO"
				lessons={[
					createRailLesson(
						"welcome-to-ship-by-sunday",
						"1.1",
						"Problem",
						"available",
					),
				]}
			/>,
		);

		expect(markup).not.toContain("Open previous lesson");
		expect(markup).not.toContain("Open next lesson");
	});

	it("shows step position, completion check for finished lessons, and stateful aria labels", () => {
		const markup = renderToStaticMarkup(
			<SkillRail
				label="CEO"
				currentLessonId="how-the-sprint-works"
				lessons={[
					createRailLesson(
						"welcome-to-ship-by-sunday",
						"1.1",
						"Problem",
						"completed",
					),
					createRailLesson(
						"how-the-sprint-works",
						"1.2",
						"User",
						"in_progress",
					),
					createRailLesson(
						"start-with-the-problem",
						"1.3",
						"Outcome",
						"available",
					),
				]}
			/>,
		);

		expect(markup).toContain(">1.1<");
		expect(markup).toContain(">1.2<");
		expect(markup).toContain(">1.3<");
		expect(markup).toContain("lucide-check");
		expect(markup).toContain(
			'aria-label="Lesson 1.1. Problem. Explored lesson."',
		);
		expect(markup).toContain('aria-label="Lesson 1.2. User. Current lesson."');
		expect(markup).toContain(
			'aria-label="Lesson 1.3. Outcome. Available lesson."',
		);
	});

	it("drops the persistent Q/E hint row from the rail", () => {
		const markup = renderToStaticMarkup(
			<SkillRail
				label="CEO"
				currentLessonId="how-the-sprint-works"
				lessons={[
					createRailLesson(
						"welcome-to-ship-by-sunday",
						"1.1",
						"Problem",
						"completed",
					),
					createRailLesson(
						"how-the-sprint-works",
						"1.2",
						"User",
						"in_progress",
					),
				]}
			/>,
		);

		expect(markup).not.toContain("Use Q / E to move");
	});
});
