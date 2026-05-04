import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { BonusMissionState } from "@/lib/execute-ship/bonus-mission-types";

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
		scroll: _scroll,
		...props
	}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
		children: React.ReactNode;
		href: string;
	}) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));

vi.mock("@/app/(workspace)/_components/app-shell", () => ({
	AppShell: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
}));

vi.mock("@/components/ui/accordion", () => ({
	Accordion: ({ children }: { children: React.ReactNode }) => (
		<div data-slot="accordion">{children}</div>
	),
	AccordionContent: ({ children }: { children: React.ReactNode }) => (
		<div data-slot="accordion-content">{children}</div>
	),
	AccordionItem: ({
		children,
		value,
	}: {
		children: React.ReactNode;
		value: string;
	}) => (
		<div data-slot="accordion-item" data-value={value}>
			{children}
		</div>
	),
	AccordionTrigger: ({ children }: { children: React.ReactNode }) => (
		<div data-slot="accordion-trigger">{children}</div>
	),
}));

vi.mock("@/components/ui/progress", () => ({
	Progress: ({
		className,
		value,
	}: {
		className?: string;
		value?: number | null;
	}) => <div className={className} data-slot="progress" data-value={value} />,
}));

import { BonusMissionPage } from "@/app/(workspace)/_components/execute-ship/bonus-mission-page";
import { buildBonusShellMission } from "@/lib/execute-ship/bonus-library-presentation";

const missionState: BonusMissionState = {
	exploredCount: 3,
	totalLessons: 29,
	blocks: [
		{
			id: "CEO",
			order: 1,
			lessons: [
				{
					lessonKey: "start-with-the-problem",
					routeSegment: "start-with-the-problem",
					id: "1.1",
					displayLabel: "1.1",
					title: "Start With the Problem",
					shortTitle: "Problem",
					block: "CEO",
					order: 1,
					status: "opened",
					isImplemented: true,
					artifactLabel: "Problem set",
				},
			],
		},
		{
			id: "DESIGN",
			order: 2,
			lessons: [
				{
					lessonKey: "find-references-first",
					routeSegment: "find-references-first",
					id: "2.2",
					displayLabel: "2.2",
					title: "Find References First",
					shortTitle: "References",
					block: "DESIGN",
					order: 1,
					status: "available",
					isImplemented: true,
					artifactLabel: "Reference set",
				},
			],
		},
		{
			id: "BUILD",
			order: 3,
			lessons: [
				{
					lessonKey: "iterate-the-product-with-ai",
					routeSegment: "iterate-the-product-with-ai",
					id: "3.1",
					displayLabel: "3.1",
					title: "Iterate the product with AI",
					shortTitle: "Iterate",
					block: "BUILD",
					order: 1,
					status: "opened",
					isImplemented: true,
					artifactLabel: "Build notes",
					durationLabel: "3m 43s",
				},
			],
		},
		{
			id: "SHIP",
			order: 4,
			lessons: [
				{
					lessonKey: "product-review",
					routeSegment: "product-review",
					id: "4.0",
					displayLabel: "4.0",
					title: "Product Review",
					shortTitle: "Review",
					block: "SHIP",
					order: 1,
					status: "available",
					isImplemented: true,
					artifactLabel: "Launch review",
				},
			],
		},
	],
};

describe("BonusMissionPage", () => {
	it("renders natural bonus labels and BUILD-first copy without completed wording", () => {
		const markup = renderToStaticMarkup(
			<BonusMissionPage missionState={missionState} />,
		);

		expect(markup).toContain(
			"Your Ship by Sunday Codebase is ready. Build is next.",
		);
		expect(markup).toContain("Build");
		expect(markup).toContain("Product");
		expect(markup).toContain("Design");
		expect(markup).toContain("Ship");
		expect(markup).toContain("Product, Design, Build, Ship");
		expect(markup).toContain('href="/lesson/iterate-the-product-with-ai"');
		expect(markup).toContain("Continue in Build");
		expect(markup).toContain("Review the full library");
		expect(markup).not.toContain("Codebase complete");
		expect(markup).not.toContain("Completed earlier");
		expect(markup).not.toContain(">CEO<");
		expect(markup).not.toContain(">DESIGN<");
		expect(markup).not.toContain(">SHIP<");
	});

	it("orders the shared shell mission state in natural route order", () => {
		expect(
			buildBonusShellMission(missionState).blocks.map((block) => block.id),
		).toEqual(["CEO", "DESIGN", "BUILD", "SHIP"]);
	});
});
