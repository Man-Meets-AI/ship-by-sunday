import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
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

vi.mock("@/app/(app)/_components/app-shell", () => ({
	AppShell: ({
		children,
		appScrollMode,
		viewportMode,
	}: {
		children: React.ReactNode;
		appScrollMode?: "viewport" | "page";
		viewportMode?: "document" | "app";
	}) => (
		<div
			data-app-scroll-mode={appScrollMode}
			data-testid="app-shell"
			data-viewport-mode={viewportMode}
		>
			{children}
		</div>
	),
}));

import { buildPaidAppHomeModel } from "@/app/(app)/_lib/paid-app-home-model";
import { PaidAppHomePage } from "@/app/(app)/_components/paid-app-home/paid-app-home-page";

describe("PaidAppHomePage", () => {
	it("renders paid home through the protected route surface recipe", () => {
		const markup = renderToStaticMarkup(
			<PaidAppHomePage
				model={buildPaidAppHomeModel()}
				showCheckoutWelcome={false}
			/>,
		);

		expect(markup).toContain('data-viewport-mode="app"');
		expect(markup).toContain('data-app-scroll-mode="page"');
		expect(markup).toContain('data-slot="protected-route-page"');
		expect(markup).toContain('data-slot="protected-route-header"');
		expect(markup).toContain('data-slot="protected-route-panel"');
		expect(markup).toContain("Open Starter");
		expect(markup).toContain('href="/starter/home"');
		expect(markup).toContain("Open Workers");
		expect(markup).toContain('href="/workers/setup"');
		expect(markup).toContain("Worker runs");
		expect(markup).toContain('href="/workers/runs"');
		expect(markup).toContain("Settings");
		expect(markup).toContain('href="/settings"');
		expect(markup).not.toContain("font-heading-serif");
	});

	it("preserves the checkout welcome account copy and navigation", () => {
		const markup = renderToStaticMarkup(
			<PaidAppHomePage
				accountEmail="buyer@example.com"
				model={buildPaidAppHomeModel()}
				showCheckoutWelcome={true}
			/>,
		);

		expect(markup).toContain("Access is live for buyer@example.com.");
		expect(markup).toContain("You&#x27;re in.");
		expect(markup).toContain("Choose where you want to start.");
		expect(markup).toContain('href="/starter/home"');
		expect(markup).toContain('href="/workers/setup"');
	});
});
