import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

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

vi.mock("next/image", () => ({
	default: ({
		alt,
		src,
		...props
	}: React.ImgHTMLAttributes<HTMLImageElement> & {
		src: string | { src: string };
	}) => (
		<img
			alt={alt ?? ""}
			src={typeof src === "string" ? src : src.src}
			{...props}
		/>
	),
}));

vi.mock("@/app/checkout/_components/checkout-button", () => ({
	CheckoutButton: ({
		label,
		offerId,
		testId,
	}: {
		label: string;
		offerId: "starter" | "workers";
		testId?: string;
	}) => (
		<button data-offer-id={offerId} data-testid={testId} type="button">
			{label}
		</button>
	),
}));

vi.mock("@/components/workerSealTeam6/WorkerSealTeam6CalBooking", () => ({
	WorkerSealTeam6CalBooking: ({
		calLink,
		directSchedulingHref,
		hostedBookingUrl,
	}: {
		calLink: string | null;
		directSchedulingHref: string;
		hostedBookingUrl: string | null;
	}) => (
		<div
			data-cal-link={calLink ?? ""}
			data-direct-scheduling-href={directSchedulingHref}
			data-hosted-booking-url={hostedBookingUrl ?? ""}
			data-testid="worker-seal-team-6-cal-booking"
		/>
	),
}));

vi.mock("next-themes", () => ({
	useTheme: () => ({
		resolvedTheme: "light",
		setTheme: vi.fn(),
	}),
}));

vi.mock("@/app/_components/support/support-widget", () => ({
	SupportWidget: ({
		analyticsSurface,
		content,
		entrySurface,
		fallbackHref,
		launcherMotion,
	}: {
		analyticsSurface: string;
		content: { launcherLabel: string };
		entrySurface: string;
		fallbackHref: string;
		launcherMotion: string;
	}) => (
		<div
			data-analytics-surface={analyticsSurface}
			data-entry-surface={entrySurface}
			data-fallback-href={fallbackHref}
			data-launcher-motion={launcherMotion}
			data-testid="public-support-widget"
		>
			{content.launcherLabel}
		</div>
	),
}));

import BlogIndexRoute from "@/app/(marketing)/blog/[[...slug]]/page";
import { BlogIndexPage } from "@/app/(marketing)/blog/_components/blog-index-page";
import { BlogPostShell } from "@/app/(marketing)/blog/_components/blog-post-shell";
import MarketingLayout from "@/app/(marketing)/layout";
import HomePage from "@/app/(marketing)/page";
import StarterPage from "@/app/(marketing)/starter/page";
import WorkerSealTeam6Page from "@/app/(marketing)/worker-seal-team-6/page";
import WorkersPage from "@/app/(marketing)/workers/page";

const blogPost = {
	title: "What Ship by Sunday does",
	description: "A field note.",
	summary: "How the app keeps product truth ahead of AI work.",
	publishedAt: "2026-04-27",
	authorName: "Parker Rex",
	authorRole: "Founder",
	featured: true,
	draft: false,
	heroMediaKind: "image" as const,
	heroMediaSrc: "/blog/editorial-surface.svg",
	heroPosterSrc: undefined,
	slug: ["what-ship-by-sunday-does"],
	href: "/blog/what-ship-by-sunday-does",
	sourcePath: "content/blog/what-ship-by-sunday-does.mdx",
};

function expectPublicRouteSurface(markup: string) {
	expect(markup).toContain('data-slot="public-route-page"');
	expect(markup).toContain('data-slot="public-site-header"');
	expect(markup).not.toContain("font-heading-serif");
	expect(markup).not.toContain("font-product-wordmark");
	expect(markup).not.toContain("opacity-22");
}

function renderMarketingRoute(children: React.ReactNode) {
	return renderToStaticMarkup(<MarketingLayout>{children}</MarketingLayout>);
}

function expectPublicSupportWidget(markup: string) {
	expect(markup.match(/data-testid="public-support-widget"/g)).toHaveLength(1);
	expect(markup).toContain('data-analytics-surface="homepage"');
	expect(markup).toContain('data-entry-surface="homepage_support_widget"');
	expect(markup).toContain('data-fallback-href="https://t.me/parkerrex"');
	expect(markup).toContain('data-launcher-motion="squishy"');
	expect(markup).toContain("Message Parker");
}

describe("public marketing surfaces", () => {
	it("renders the Man Meets AI index as a T3 public route surface", () => {
		const markup = renderMarketingRoute(<HomePage />);

		expectPublicRouteSurface(markup);
		expectPublicSupportWidget(markup);
		expect(markup).toContain('data-slot="public-route-header"');
		expect(markup).toContain('<h3 data-slot="public-route-panel-title"');
		expect(markup).toContain('href="/starter"');
		expect(markup).toContain('href="/workers"');
		expect(markup).toContain('href="/worker-seal-team-6"');
		expect(markup.match(/href="\/"/g)).toHaveLength(1);
	});

	it("preserves Starter checkout while using public route panels", () => {
		const markup = renderMarketingRoute(<StarterPage />);

		expectPublicRouteSurface(markup);
		expectPublicSupportWidget(markup);
		expect(markup).toContain('data-slot="public-route-panel"');
		expect(markup).toContain('data-testid="starter-checkout-cta"');
		expect(markup).toContain('data-testid="starter-interactive-preview"');
		expect(markup).toContain('data-testid="starter-preview-checkout-cta"');
		expect(markup.match(/data-offer-id="starter"/g)).toHaveLength(2);
		expect(markup).toContain('href="/workers"');
		expect(markup).not.toContain('data-testid="codebase-demo-codebase-branch"');
	});

	it("preserves Workers checkout while using public route panels", () => {
		const markup = renderMarketingRoute(<WorkersPage />);

		expectPublicRouteSurface(markup);
		expectPublicSupportWidget(markup);
		expect(markup).toContain('data-slot="public-route-panel"');
		expect(markup).toContain('data-testid="workers-checkout-cta"');
		expect(markup).toContain('data-offer-id="workers"');
		expect(markup).toContain('href="/starter"');
	});

	it("preserves Worker Seal Team 6 booking affordances", () => {
		const markup = renderMarketingRoute(<WorkerSealTeam6Page />);

		expectPublicRouteSurface(markup);
		expectPublicSupportWidget(markup);
		expect(markup).toContain('href="#booking"');
		expect(markup).toContain('data-testid="worker-seal-team-6-cal-booking"');
		expect(markup).toContain('data-slot="public-route-list-panel"');
		expect(markup).toContain('<h3 data-slot="public-route-panel-title"');
		expect(markup).toContain("data-direct-scheduling-href=");
		expect(markup).not.toContain("/api/stripe/checkout");
	});

	it("renders blog index and post shells without legacy editorial title classes", () => {
		const indexMarkup = renderMarketingRoute(
			<BlogIndexPage posts={[blogPost]} />,
		);
		const postMarkup = renderMarketingRoute(
			<BlogPostShell
				post={blogPost}
				toc={[{ depth: 2, id: "proof", label: "Proof" }]}
				promoTarget={{ kind: "link", href: "/starter" }}
			>
				<p>Article body.</p>
			</BlogPostShell>,
		);

		expectPublicRouteSurface(indexMarkup);
		expectPublicRouteSurface(postMarkup);
		expectPublicSupportWidget(indexMarkup);
		expectPublicSupportWidget(postMarkup);
		expect(indexMarkup).toContain('data-slot="public-route-header"');
		expect(postMarkup).toContain('data-slot="public-route-header"');
		expect(postMarkup).toContain('href="/blog/what-ship-by-sunday-does#proof"');
	});

	it("keeps the route module rendering the public blog index", async () => {
		const route = await BlogIndexRoute({ params: Promise.resolve({}) });
		const markup = renderMarketingRoute(route);

		expectPublicRouteSurface(markup);
		expectPublicSupportWidget(markup);
		expect(markup).toContain("newest first");
	});

	it("mounts public support for direct-link docs children through the marketing layout", () => {
		const markup = renderMarketingRoute(
			<div className="sbs-docs-shell">Docs route child</div>,
		);

		expect(markup).toContain("Docs route child");
		expectPublicSupportWidget(markup);
	});
});
