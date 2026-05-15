import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertTitle,
} from "@/components/ui/alert";
import {
	Card,
	CardContent,
	CardFrame,
	CardFrameDescription,
	CardFrameFooter,
	CardFrameHeader,
	CardFrameTitle,
	CardPanel,
	CardTitle,
} from "@/components/ui/card";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Skeleton } from "@/components/ui/skeleton";

describe("T3 Code display primitive recipes", () => {
	it("renders Card with the T3 Code surface and preserves CardContent", () => {
		const markup = renderToStaticMarkup(
			<Card>
				<CardTitle>Review</CardTitle>
				<CardContent>Download</CardContent>
			</Card>,
		);

		expect(markup).toContain('data-slot="card"');
		expect(markup).toContain("rounded-2xl");
		expect(markup).toContain("before:shadow-[0_1px_--theme(--color-black/4%)]");
		expect(markup).toContain('data-slot="card-panel"');
		expect(markup).not.toContain('data-slot="card-content"');
	});

	it("exports the T3 Code CardFrame family", () => {
		const markup = renderToStaticMarkup(
			<CardFrame>
				<CardFrameHeader>
					<CardFrameTitle>Codebase</CardFrameTitle>
					<CardFrameDescription>Ready</CardFrameDescription>
				</CardFrameHeader>
				<CardPanel>Body</CardPanel>
				<CardFrameFooter>Footer</CardFrameFooter>
			</CardFrame>,
		);

		expect(markup).toContain('data-slot="card-frame"');
		expect(markup).toContain("[--clip-top:-1rem]");
		expect(markup).toContain('data-slot="card-frame-header"');
		expect(markup).toContain('data-slot="card-frame-title"');
		expect(markup).toContain('data-slot="card-frame-description"');
		expect(markup).toContain('data-slot="card-frame-footer"');
	});

	it("renders Alert status variants and keeps destructive compatibility", () => {
		const markup = renderToStaticMarkup(
			<Alert variant="destructive">
				<AlertTitle>Failed</AlertTitle>
				<AlertDescription>Try again</AlertDescription>
				<AlertAction>Action</AlertAction>
			</Alert>,
		);

		expect(markup).toContain('role="alert"');
		expect(markup).toContain('data-slot="alert"');
		expect(markup).toContain("border-destructive/32");
		expect(markup).toContain("bg-destructive/4");
		expect(markup).toContain('data-slot="alert-action"');

		const infoMarkup = renderToStaticMarkup(<Alert variant="info" />);
		expect(infoMarkup).toContain("border-info/32");
		expect(infoMarkup).toContain("bg-info/4");
	});

	it("renders Skeleton and Kbd with T3 Code recipes", () => {
		const skeletonMarkup = renderToStaticMarkup(
			<Skeleton className="h-4 w-24" />,
		);
		const kbdMarkup = renderToStaticMarkup(
			<KbdGroup>
				<Kbd>Ctrl</Kbd>
				<Kbd>K</Kbd>
			</KbdGroup>,
		);

		expect(skeletonMarkup).toContain('data-slot="skeleton"');
		expect(skeletonMarkup).toContain("animate-skeleton");
		expect(skeletonMarkup).toContain(
			"[background:linear-gradient(120deg,transparent_40%,var(--skeleton-highlight),transparent_60%)_var(--color-muted)_0_0/200%_100%_fixed]",
		);
		expect(kbdMarkup).toContain('data-slot="kbd-group"');
		expect(kbdMarkup).toContain('data-slot="kbd"');
		expect(kbdMarkup).toContain("rounded bg-muted");
	});
});
