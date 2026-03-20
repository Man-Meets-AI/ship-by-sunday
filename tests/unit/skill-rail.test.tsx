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

import { SkillRail } from "@/features/course/shared/components/skill-rail";

describe("SkillRail", () => {
	beforeEach(() => {
		pushMock.mockReset();
	});

	it("highlights the completing lesson and keeps the next step locked in markup", () => {
		const markup = renderToStaticMarkup(
			<SkillRail
				label="CEO"
				currentLessonId="1.1"
				completionCue={{
					completedLessonId: "1.1",
					nextLessonId: "1.2",
				}}
				lessons={[
					{
						id: "1.1",
						shortTitle: "Start",
						status: "in_progress",
					},
					{
						id: "1.2",
						shortTitle: "Carry forward",
						status: "locked",
					},
				]}
			/>,
		);

		expect(markup).toContain("bg-primary/10");
		expect(markup).toContain("border-b-primary");
		expect(markup).toContain(">Previous<");
		expect(markup).toContain(">Next<");
		expect(markup).toContain("Carry forward");
		expect(markup).toContain('aria-current="step"');
		expect(markup).toContain(
			'aria-label="Lesson 1 of 2. Start. Current lesson."',
		);
		expect(markup).toContain(
			'aria-label="Lesson 2 of 2. Carry forward. Locked."',
		);
	});

	it("highlights completion on the final lesson without a next-unlock target", () => {
		const markup = renderToStaticMarkup(
			<SkillRail
				label="SHIP"
				currentLessonId="4.6"
				completionCue={{
					completedLessonId: "4.6",
					nextLessonId: null,
				}}
				lessons={[
					{
						id: "4.6",
						shortTitle: "Final wrap",
						status: "in_progress",
					},
				]}
			/>,
		);

		expect(markup).toContain("bg-primary/10");
		expect(markup).toContain(
			'aria-label="Lesson 1 of 1. Final wrap. Current lesson."',
		);
		expect(markup).not.toContain("Lesson 2 of");
	});

	it("keeps the previous key enabled for completed lessons", () => {
		const markup = renderToStaticMarkup(
			<SkillRail
				label="CEO"
				currentLessonId="1.2"
				lessons={[
					{
						id: "1.1",
						shortTitle: "Problem",
						status: "completed",
					},
					{
						id: "1.2",
						shortTitle: "User",
						status: "in_progress",
					},
					{
						id: "1.3",
						shortTitle: "Outcome",
						status: "available",
					},
				]}
			/>,
		);

		expect(markup).toContain('data-href="/lesson/1.1"');
		expect(markup).toContain('aria-label="Open previous lesson: Problem"');
		expect(markup).toContain('data-disabled="false"');
	});

	it("disables the next key when the adjacent lesson is locked", () => {
		const markup = renderToStaticMarkup(
			<SkillRail
				label="CEO"
				currentLessonId="1.2"
				lessons={[
					{
						id: "1.1",
						shortTitle: "Problem",
						status: "completed",
					},
					{
						id: "1.2",
						shortTitle: "User",
						status: "in_progress",
					},
					{
						id: "1.3",
						shortTitle: "Outcome",
						status: "locked",
					},
				]}
			/>,
		);

		expect(markup).toContain('aria-label="No next lesson available"');
		expect(markup).toContain('data-disabled="true"');
		expect(markup).not.toContain('data-href="/lesson/1.3"');
	});

	it("uses navigation lessons to cross forward into the next stage while keeping the visible strip scoped", () => {
		const markup = renderToStaticMarkup(
			<SkillRail
				label="DESIGN"
				currentLessonId="2.0"
				lessons={[
					{
						id: "2.0",
						shortTitle: "Refs",
						status: "completed",
					},
				]}
				navigationLessons={[
					{
						id: "2.0",
						shortTitle: "Refs",
						status: "completed",
					},
					{
						id: "2.1",
						shortTitle: "Scope",
						status: "available",
					},
				]}
			/>,
		);

		expect(markup).toContain('data-href="/lesson/2.1"');
		expect(markup).toContain('aria-label="Open next stage: Scope"');
		expect(markup).toContain(">Refs<");
		expect(markup).not.toContain(">Scope<");
	});

	it("uses navigation lessons to cross backward into the previous stage", () => {
		const markup = renderToStaticMarkup(
			<SkillRail
				label="DESIGN"
				currentLessonId="2.1"
				lessons={[
					{
						id: "2.1",
						shortTitle: "Scope",
						status: "in_progress",
					},
					{
						id: "2.2",
						shortTitle: "Find",
						status: "available",
					},
				]}
				navigationLessons={[
					{
						id: "2.0",
						shortTitle: "Refs",
						status: "completed",
					},
					{
						id: "2.1",
						shortTitle: "Scope",
						status: "in_progress",
					},
					{
						id: "2.2",
						shortTitle: "Find",
						status: "available",
					},
				]}
			/>,
		);

		expect(markup).toContain('data-href="/lesson/2.0"');
		expect(markup).toContain('aria-label="Open previous stage: Refs"');
		expect(markup).not.toContain(">Refs<");
	});

	it("navigates in place when a rail step is clicked", async () => {
		const user = userEvent.setup();

		render(
			<SkillRail
				label="CEO"
				currentLessonId="1.2"
				lessons={[
					{
						id: "1.1",
						shortTitle: "Problem",
						status: "completed",
					},
					{
						id: "1.2",
						shortTitle: "User",
						status: "in_progress",
					},
					{
						id: "1.3",
						shortTitle: "Outcome",
						status: "available",
					},
				]}
			/>,
		);

		await user.click(
			screen.getByRole("button", {
				name: "Lesson 3 of 3. Outcome. Available lesson.",
			}),
		);

		expect(pushMock).toHaveBeenCalledWith("/lesson/1.3", { scroll: false });
	});

	it("disables adjacent nav at the first and last visible lesson", () => {
		const firstMarkup = renderToStaticMarkup(
			<SkillRail
				label="CEO"
				currentLessonId="1.1"
				lessons={[
					{
						id: "1.1",
						shortTitle: "Problem",
						status: "in_progress",
					},
					{
						id: "1.2",
						shortTitle: "User",
						status: "available",
					},
				]}
			/>,
		);
		const lastMarkup = renderToStaticMarkup(
			<SkillRail
				label="CEO"
				currentLessonId="1.2"
				lessons={[
					{
						id: "1.1",
						shortTitle: "Problem",
						status: "completed",
					},
					{
						id: "1.2",
						shortTitle: "User",
						status: "in_progress",
					},
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
					{
						id: "1.1",
						shortTitle: "Problem",
						status: "available",
					},
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
				currentLessonId="1.2"
				lessons={[
					{
						id: "1.1",
						shortTitle: "Problem",
						status: "completed",
					},
					{
						id: "1.2",
						shortTitle: "User",
						status: "in_progress",
					},
					{
						id: "1.3",
						shortTitle: "Outcome",
						status: "available",
					},
				]}
			/>,
		);

		expect(markup).toContain("Lesson 1 of 3");
		expect(markup).toContain("Lesson 2 of 3");
		expect(markup).toContain("Lesson 3 of 3");
		expect(markup).toContain("lucide-check");
		expect(markup).toContain(
			'aria-label="Lesson 1 of 3. Problem. Completed lesson."',
		);
		expect(markup).toContain(
			'aria-label="Lesson 2 of 3. User. Current lesson."',
		);
		expect(markup).toContain(
			'aria-label="Lesson 3 of 3. Outcome. Available lesson."',
		);
	});

	it("drops the persistent Q/E hint row from the rail", () => {
		const markup = renderToStaticMarkup(
			<SkillRail
				label="CEO"
				currentLessonId="1.2"
				lessons={[
					{
						id: "1.1",
						shortTitle: "Problem",
						status: "completed",
					},
					{
						id: "1.2",
						shortTitle: "User",
						status: "in_progress",
					},
				]}
			/>,
		);

		expect(markup).not.toContain("Use Q / E to move");
	});
});
