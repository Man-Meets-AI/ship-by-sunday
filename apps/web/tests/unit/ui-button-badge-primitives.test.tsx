import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";

describe("T3 Code Button and Badge primitive recipes", () => {
	it("renders the T3 Code Button recipe and preserves a safe default button type", () => {
		const markup = renderToStaticMarkup(<Button>Ship</Button>);

		expect(markup).toContain('data-slot="button"');
		expect(markup).toContain('data-variant="default"');
		expect(markup).toContain('data-size="default"');
		expect(markup).toContain('type="button"');
		expect(markup).toContain("shadow-primary/24");
		expect(markup).toContain("focus-visible:ring-offset-background");
	});

	it("keeps Button asChild anchors on the existing composition API", () => {
		const markup = renderToStaticMarkup(
			<Button asChild variant="outline" size="icon-xl">
				<a href="https://example.com">Go</a>
			</Button>,
		);

		expect(markup.startsWith("<a ")).toBe(true);
		expect(markup).toContain('href="https://example.com"');
		expect(markup).toContain('data-slot="button"');
		expect(markup).toContain('data-size="icon-xl"');
		expect(markup).toContain("not-dark:bg-clip-padding");
		expect(markup).not.toContain('type="button"');
	});

	it("exposes the T3 Code Button variant and size scale", () => {
		expect(
			buttonVariants({ variant: "destructive-outline", size: "xs" }),
		).toContain("border-destructive/32");
		expect(buttonVariants({ variant: "default", size: "icon-lg" })).toContain(
			"sm:size-9",
		);
		expect(buttonVariants({ variant: "ghost" })).toContain(
			"data-open:bg-accent",
		);
		expect(buttonVariants({ variant: "outline" })).toContain(
			"aria-expanded:bg-accent/50",
		);
	});

	it("renders Badge status variants and sizes from the T3 Code recipe", () => {
		const markup = renderToStaticMarkup(
			<Badge variant="success" size="lg">
				Done
			</Badge>,
		);

		expect(markup).toContain('data-slot="badge"');
		expect(markup).toContain('data-variant="success"');
		expect(markup).toContain('data-size="lg"');
		expect(markup).toContain("bg-success/8");
		expect(markup).toContain("text-success-foreground");
		expect(badgeVariants({ variant: "warning", size: "sm" })).toContain(
			"bg-warning/8",
		);
	});
});
