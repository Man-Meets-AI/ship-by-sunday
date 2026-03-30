import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ThemeProvider } from "next-themes";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
	default: ({
		children,
		href,
		scroll: _scroll,
		...props
	}: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
		children: React.ReactNode;
		href: string;
		scroll?: boolean;
	}) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));

vi.mock("next/navigation", () => ({
	usePathname: () => "/artifacts",
}));

vi.mock("@clerk/nextjs", () => ({
	useUser: () => ({
		isLoaded: true,
		user: {
			fullName: "Test User",
			firstName: "Test",
			lastName: "User",
			imageUrl: "",
			primaryEmailAddress: { emailAddress: "test@example.com" },
		},
	}),
	useClerk: () => ({
		openUserProfile: vi.fn(),
		signOut: vi.fn(),
	}),
}));

globalThis.React = React;

import { AppShell } from "@/features/course/shared/components/app-shell";
import type { AppShellPrimaryNav } from "@/features/course/shared/components/app-shell/app-shell-props";

const primaryNav: AppShellPrimaryNav = {
	kind: "workspace",
	items: [
		{
			kind: "link",
			id: "review",
			label: "Review",
			href: "/review",
			state: "available",
		},
		{
			kind: "link",
			id: "build",
			label: "Build Lessons",
			href: "/lesson/iterate-the-product-with-ai",
			state: "active",
		},
		{
			kind: "link",
			id: "launch",
			label: "Launch Lessons",
			href: "/lesson/product-review",
			state: "disabled",
		},
		{
			kind: "menu",
			id: "bonus",
			label: "Bonus",
			state: "available",
			items: [
				{
					kind: "link",
					id: "bonus-product",
					label: "Product lessons",
					href: "/lesson/welcome-to-ship-by-sunday",
					state: "available",
				},
				{
					kind: "link",
					id: "bonus-design",
					label: "Design lessons",
					href: "/lesson/design-references",
					state: "available",
				},
				{
					kind: "link",
					id: "bonus-lesson-map",
					label: "Lesson Map",
					href: "/review?showLessonMap=1",
					state: "available",
				},
			],
		},
	],
};

function renderAppShell(element: React.ReactElement) {
	return renderToStaticMarkup(
		<ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
			{element}
		</ThemeProvider>,
	);
}

describe("AppShell", () => {
	it("renders the explicit primary navigation instead of loading mission data implicitly", () => {
		const markup = renderAppShell(
			<AppShell
				showSkillRail={false}
				primaryNav={primaryNav}
				progressSummary={{ progressCount: 9, totalLessons: 28 }}
			>
				<div>Body</div>
			</AppShell>,
		);

		expect(markup).toContain('href="/review"');
		expect(markup).toContain('href="/lesson/iterate-the-product-with-ai"');
		expect(markup).toContain("Launch Lessons");
		expect(markup).toContain("Bonus");
		expect(markup).toContain("9/28");
		expect(markup).not.toContain("Open CEO");
	});

	it("links the header brand to the start page and keeps account chrome visible", () => {
		const markup = renderAppShell(
			<AppShell showSkillRail={false} primaryNav={primaryNav}>
				<div>Body</div>
			</AppShell>,
		);

		expect(markup).toContain('href="/start"');
		expect(markup).toContain('aria-label="Ship by Sunday"');
		expect(markup).toContain('aria-label="Open account menu"');
	});

	it("lets app surfaces opt into page scrolling without the fixed viewport shell", () => {
		const markup = renderAppShell(
			<AppShell showSkillRail={false} viewportMode="app" appScrollMode="page">
				<div>Body</div>
			</AppShell>,
		);

		expect(markup).toContain(
			'class="flex min-h-screen flex-col bg-background text-foreground"',
		);
		expect(markup).not.toContain("xl:h-dvh");
		expect(markup).not.toContain("xl:overflow-hidden");
	});

	it("omits progress and primary navigation when pages do not provide them", () => {
		const markup = renderAppShell(
			<AppShell showSkillRail={false}>
				<div>Body</div>
			</AppShell>,
		);

		expect(markup).not.toContain("9/28");
		expect(markup).not.toContain("Build Lessons");
	});
});
