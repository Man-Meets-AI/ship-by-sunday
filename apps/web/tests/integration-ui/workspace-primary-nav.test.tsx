import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { WorkspacePrimaryNav } from "@/app/(protected)/_components/workspace-navigation/workspace-primary-nav";
import type { WorkspacePrimaryNavItem } from "@/lib/workspace-navigation/build-primary-nav-model";

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

vi.mock("@/components/ui/navigation-menu", async () => {
	function passthroughClassName(
		className: string | undefined,
		requiredClassName = "",
	) {
		return [requiredClassName, className].filter(Boolean).join(" ");
	}

	return {
		NavigationMenu: ({
			children,
			className,
			viewport = true,
		}: {
			children: React.ReactNode;
			className?: string;
			viewport?: boolean;
		}) => (
			<nav
				className={className}
				data-slot="navigation-menu"
				data-viewport={String(viewport)}
			>
				{children}
			</nav>
		),
		NavigationMenuContent: ({
			children,
			className,
		}: {
			children: React.ReactNode;
			className?: string;
		}) => (
			<div
				className={passthroughClassName(
					className,
					"group-data-[viewport=false]/navigation-menu:absolute group-data-[viewport=false]/navigation-menu:z-50",
				)}
				data-slot="navigation-menu-content"
			>
				{children}
			</div>
		),
		NavigationMenuItem: ({ children }: { children: React.ReactNode }) => (
			<li>{children}</li>
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
		}) => <ul className={className}>{children}</ul>,
		NavigationMenuTrigger: ({
			children,
			className,
			disabled,
		}: {
			children: React.ReactNode;
			className?: string;
			disabled?: boolean;
		}) => (
			<button className={className} disabled={disabled} type="button">
				{children}
			</button>
		),
	};
});

const primaryNavItems: WorkspacePrimaryNavItem[] = [
	{
		kind: "link",
		id: "build",
		label: "Build Lessons",
		href: "/lesson/iterate-the-product-with-ai",
		state: "available",
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
				kind: "action",
				id: "bonus-lesson-map",
				label: "Lesson Map",
				actionId: "showLessonMap",
				state: "available",
			},
		],
	},
];

describe("WorkspacePrimaryNav", () => {
	it("keeps the Bonus dropdown on the viewport-less overlay layer", async () => {
		const user = userEvent.setup();
		const { container } = render(
			<WorkspacePrimaryNav items={primaryNavItems} />,
		);

		await user.click(screen.getByRole("button", { name: "Bonus" }));

		const menuRoot = container.querySelector('[data-slot="navigation-menu"]');
		const menuContent = screen
			.getByText("Product lessons")
			.closest('[data-slot="navigation-menu-content"]');

		expect(menuRoot?.getAttribute("data-viewport")).toBe("false");
		expect(menuContent).not.toBeNull();
		expect(menuContent?.className).toContain(
			"group-data-[viewport=false]/navigation-menu:absolute",
		);
		expect(menuContent?.className).toContain(
			"group-data-[viewport=false]/navigation-menu:z-50",
		);
	});
});
