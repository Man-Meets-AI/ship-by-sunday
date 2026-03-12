import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const pushMock = vi.fn();

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
		scroll: _scroll,
		...props
	}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
		href: string;
		children: React.ReactNode;
		scroll?: boolean;
	}) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));

vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: pushMock,
	}),
}));

globalThis.React = React;

import { SkillRail } from "@/components/skill-rail";

describe("SkillRail", () => {
	beforeEach(() => {
		pushMock.mockReset();
	});

	it("renders completion sweep and next-unlock ping when given a completion cue", () => {
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

		expect(markup).toContain("sbs-rail-complete-slot");
		expect(markup).toContain("sbs-rail-complete-sweep");
		expect(markup).toContain("sbs-rail-unlock-slot");
		expect(markup).toContain(">Q<");
		expect(markup).toContain(">E<");
		expect(markup).toContain("Carry forward");
	});

	it("skips the unlock ping when there is no next lesson", () => {
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

		expect(markup).toContain("sbs-rail-complete-slot");
		expect(markup).not.toContain("sbs-rail-unlock-slot");
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

		expect(markup).toContain('href="/lesson/1.1"');
		expect(markup).toContain("Open previous lesson in this stage");
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

		expect(markup).toContain("Open next lesson in this stage");
		expect(markup).toContain('data-disabled="true"');
		expect(markup).not.toContain('href="/lesson/1.3"');
	});

	it("uses navigation lessons to cross forward into the next stage while keeping the visible strip scoped", () => {
		const markup = renderToStaticMarkup(
			<SkillRail
				label="CEO"
				currentLessonId="1.7"
				lessons={[
					{
						id: "1.6",
						shortTitle: "Scope",
						status: "completed",
					},
					{
						id: "1.7",
						shortTitle: "Brief",
						status: "completed",
					},
				]}
				navigationLessons={[
					{
						id: "1.6",
						shortTitle: "Scope",
						status: "completed",
					},
					{
						id: "1.7",
						shortTitle: "Brief",
						status: "completed",
					},
					{
						id: "2.1",
						shortTitle: "References",
						status: "available",
					},
				]}
			/>,
		);

		expect(markup).toContain('href="/lesson/2.1"');
		expect(markup).toContain("Open next lesson in this stage");
		expect(markup).toContain(">Scope<");
		expect(markup).toContain(">Brief<");
		expect(markup).not.toContain(">References<");
	});

	it("uses navigation lessons to cross backward into the previous stage", () => {
		const markup = renderToStaticMarkup(
			<SkillRail
				label="DESIGN"
				currentLessonId="2.1"
				lessons={[
					{
						id: "2.1",
						shortTitle: "References",
						status: "in_progress",
					},
					{
						id: "2.2",
						shortTitle: "Sketch",
						status: "available",
					},
				]}
				navigationLessons={[
					{
						id: "1.7",
						shortTitle: "Brief",
						status: "completed",
					},
					{
						id: "2.1",
						shortTitle: "References",
						status: "in_progress",
					},
					{
						id: "2.2",
						shortTitle: "Sketch",
						status: "available",
					},
				]}
			/>,
		);

		expect(markup).toContain('href="/lesson/1.7"');
		expect(markup).toContain("Open previous lesson in this stage");
		expect(markup).not.toContain(">Brief<");
	});

	it("disables Q on the first lesson and E on the last lesson", () => {
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

		expect(firstMarkup).toContain(
			'aria-label="Open previous lesson in this stage"',
		);
		expect(firstMarkup).toContain('data-disabled="true"');
		expect(lastMarkup).toContain('aria-label="Open next lesson in this stage"');
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

		expect(markup).not.toContain("Open previous lesson in this stage");
		expect(markup).not.toContain("Open next lesson in this stage");
	});
});
