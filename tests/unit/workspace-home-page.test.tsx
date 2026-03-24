import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

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

vi.mock("@/features/course/shared/components/app-shell", () => ({
	AppShell: ({
		children,
		title,
		subtitle,
	}: {
		children: React.ReactNode;
		title?: string;
		subtitle?: string;
	}) => (
		<div data-shell="true" data-title={title} data-subtitle={subtitle}>
			{children}
		</div>
	),
}));

vi.mock("@/features/codex/components/codex-connection-card", () => ({
	CodexConnectionCard: () => <div data-card="codex">Codex card</div>,
}));

vi.mock("@/features/starter-repo/components/starter-repo-access-card", () => ({
	StarterRepoAccessCard: () => (
		<div data-card="starter-repo">Starter repo card</div>
	),
}));

vi.mock("@/features/settings/components/settings-account-card", () => ({
	SettingsAccountCard: () => <div data-card="account">Account card</div>,
}));

import { WorkspaceHomePage } from "@/features/workspace-home/components/workspace-home-page";
import { buildWorkspaceHomeModel } from "@/features/workspace-home/lib/workspace-home-model";

describe("WorkspaceHomePage", () => {
	it("renders the neutral starter-mode protected home", () => {
		const markup = renderToStaticMarkup(
			<WorkspaceHomePage
				model={buildWorkspaceHomeModel({
					docs: true,
					course: false,
					starterRepo: true,
					codex: true,
					observability: true,
				})}
			/>,
		);

		expect(markup).toContain('data-shell="true"');
		expect(markup).toContain("Starter workspace ready");
		expect(markup).toContain("Enabled starter modules");
		expect(markup).toContain("Next steps");
		expect(markup).toContain("Review starter settings");
		expect(markup).toContain('data-card="codex"');
		expect(markup).toContain('data-card="starter-repo"');
		expect(markup).toContain('data-card="account"');
	});
});
