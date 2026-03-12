import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

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

globalThis.React = React;

import { SkillRail } from "@/components/skill-rail";

describe("SkillRail", () => {
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
});
