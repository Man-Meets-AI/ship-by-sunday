import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
	createCompleteProjectDefinition,
	deriveStageStatus,
} from "@shipbysunday/codebase-compiler";

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

vi.mock("@/app/(app)/_components/app-shell/app-shell-theme-toggle", () => ({
	AppShellThemeToggle: () => <button type="button" aria-label="Toggle theme" />,
}));

vi.mock("@/app/(app)/_components/app-shell/app-shell-user-menu", () => ({
	AppShellUserMenu: () => (
		<button type="button" aria-label="Open account menu" />
	),
}));

vi.mock("@/app/_components/support-mode/support-mode-bar", () => ({
	SupportModeBar: () => null,
}));

vi.mock("@/components/ui/navigation-menu", () => ({
	NavigationMenu: ({ children }: { children: React.ReactNode }) => (
		<nav data-slot="navigation-menu">{children}</nav>
	),
	NavigationMenuContent: ({
		children,
		className,
	}: {
		children: React.ReactNode;
		className?: string;
	}) => <div className={className}>{children}</div>,
	NavigationMenuItem: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	NavigationMenuLink: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
	NavigationMenuList: ({
		children,
		className,
	}: {
		children: React.ReactNode;
		className?: string;
	}) => <div className={className}>{children}</div>,
	NavigationMenuTrigger: ({
		children,
		className,
		disabled,
	}: {
		children: React.ReactNode;
		className?: string;
		disabled?: boolean;
	}) => (
		<button type="button" className={className} disabled={disabled}>
			{children}
		</button>
	),
}));

globalThis.React = React;

import { AppShell } from "@/app/(app)/_components/app-shell";
import type {
	AppShellLocalNav,
	AppShellPrimaryNav,
} from "@/app/(app)/_components/app-shell/app-shell-props";

const codebaseStageStatuses = deriveStageStatus(
	createCompleteProjectDefinition().facts,
).stageStatuses;

const primaryNav: AppShellPrimaryNav = {
	kind: "combined",
	stageStatuses: codebaseStageStatuses,
	postReviewItems: [
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
					href: "/starter/generate-codebase/review?showLessonMap=1",
					state: "available",
				},
			],
		},
	],
};

const localNav: AppShellLocalNav = {
	kind: "codebase",
	compact: <div>Compact codebase rail</div>,
	desktop: <div>Desktop codebase rail</div>,
};

function renderAppShell(element: React.ReactElement) {
	return renderToStaticMarkup(element);
}

describe("AppShell", () => {
	it("renders the explicit primary navigation instead of loading mission data implicitly", () => {
		const markup = renderAppShell(
			<AppShell
				showSkillRail={false}
				primaryNav={primaryNav}
				localNav={localNav}
				progressSummary={{ progressCount: 9, totalLessons: 28 }}
			>
				<div>Body</div>
			</AppShell>,
		);

		expect(markup).toContain('href="/starter/generate-codebase/review"');
		expect(markup).toContain('href="/lesson/iterate-the-product-with-ai"');
		expect(markup).toContain("Launch Lessons");
		expect(markup).toContain("Bonus");
		expect(markup).toContain("overflow-x-auto lg:overflow-visible");
		expect(markup).toContain("9/28");
		expect(markup).toContain('data-shell-local-nav-kind="codebase"');
		expect(markup).toContain("Compact codebase rail");
		expect(markup).toContain("Desktop codebase rail");
		expect(markup).not.toContain('aria-label="Billing attention"');
		expect(markup).toContain(
			"hidden min-h-0 min-w-0 xl:sticky xl:top-3 xl:block xl:self-start xl:pr-2",
		);
		expect(markup).toContain('aria-label="Collapse local navigation"');
		expect(markup).not.toContain("xl:rounded-xl");
		expect(markup).not.toContain("xl:bg-background");
		expect(markup).not.toContain("xl:p-4");
		expect(markup).not.toContain("Open CEO");
	});

	it("keeps product route links and account chrome visible", () => {
		const markup = renderAppShell(
			<AppShell showSkillRail={false} primaryNav={primaryNav}>
				<div>Body</div>
			</AppShell>,
		);

		expect(markup).toContain('href="/home"');
		expect(markup).toContain('href="/starter/generate-codebase"');
		expect(markup).toContain('aria-label="Ship by Sunday"');
		expect(markup).toContain('aria-label="Open account menu"');
	});

	it("renders a non-dismissible billing attention banner when supplied", () => {
		const markup = renderAppShell(
			<AppShell
				showSkillRail={false}
				primaryNav={primaryNav}
				billingAttention={{
					title: "Payment needs attention",
					message:
						"Workers access stays active during the retry window. Update the payment method to keep the workspace current.",
					statusLabel: "past_due",
					action: {
						label: "Manage billing",
						href: "/billing",
					},
				}}
			>
				<div>Body</div>
			</AppShell>,
		);

		expect(markup).toContain('aria-label="Billing attention"');
		expect(markup).toContain("Payment needs attention");
		expect(markup).toContain("Workers access stays active");
		expect(markup).toContain("past_due");
		expect(markup).toContain('href="/billing"');
		expect(markup).toContain("Manage billing");
		expect(markup).not.toContain("Dismiss");
		expect(markup).not.toContain("Snooze");
	});

	it("lets app surfaces opt into page scrolling without the fixed viewport shell", () => {
		const markup = renderAppShell(
			<AppShell showSkillRail={false} viewportMode="app" appScrollMode="page">
				<div>Body</div>
			</AppShell>,
		);

		expect(markup).toContain(
			'class="flex min-h-screen flex-col bg-background text-foreground tracking-normal"',
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
		expect(markup).not.toContain("Desktop codebase rail");
	});
});
