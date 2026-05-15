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

import CheckoutCancelConfirmedPage from "@/app/checkout/cancel/confirmed/page";
import CheckoutClearPendingPage from "@/app/checkout/clear-pending/page";

function expectEdgeSurface(markup: string) {
	expect(markup).toContain('data-slot="edge-route-page"');
	expect(markup).toContain('data-slot="edge-route-panel"');
	expect(markup).not.toContain("font-heading-serif");
	expect(markup).not.toContain("bg-ink");
}

describe("checkout edge surfaces", () => {
	it("renders the cancel confirmation on the shared edge route surface", () => {
		const markup = renderToStaticMarkup(<CheckoutCancelConfirmedPage />);

		expectEdgeSurface(markup);
		expect(markup).toContain("No charge was completed");
		expect(markup).toContain('href="/starter"');
		expect(markup).toContain('href="/"');
	});

	it("keeps clear-pending checkout form action while using the edge surface", async () => {
		const page = await CheckoutClearPendingPage({
			searchParams: Promise.resolve({
				redirect_url: "/starter/home",
			}),
		});
		const markup = renderToStaticMarkup(page);

		expectEdgeSurface(markup);
		expect(markup).toContain("Clearing checkout state");
		expect(markup).toContain(
			'action="/checkout/clear-pending/submit?redirect_url=%2Fstarter%2Fhome"',
		);
		expect(markup).toContain("Clear checkout and continue");
	});
});
