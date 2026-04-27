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

vi.mock("@/features/workspace-shell/components/app-shell", () => ({
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

vi.mock(
	"@/app/(workspace)/_components/codex-connection-card/codex-connection-card",
	() => ({
		CodexConnectionCard: () => <div data-card="codex">Codex card</div>,
	}),
);

vi.mock(
	"@/app/(workspace)/_components/starter-repo-access/starter-repo-access-card",
	() => ({
		StarterRepoAccessCard: () => (
			<div data-card="starter-repo">Starter repo card</div>
		),
	}),
);

vi.mock("@/app/(workspace)/_components/settings-account-card", () => ({
	SettingsAccountCard: () => <div data-card="account">Account card</div>,
}));

vi.mock(
	"@/app/(workspace)/_components/workspace-home/workspace-home-hero",
	() => ({
		WorkspaceHomeHero: () => <section>Starter workspace ready</section>,
	}),
);

vi.mock(
	"@/app/(workspace)/_components/workspace-home/workspace-home-module-list",
	() => ({
		WorkspaceHomeModuleList: () => <section>Enabled starter modules</section>,
	}),
);

vi.mock(
	"@/app/(workspace)/_components/workspace-home/workspace-home-next-steps",
	() => ({
		WorkspaceHomeNextSteps: () => (
			<section>
				Next steps
				<span>Review starter settings</span>
			</section>
		),
	}),
);

import { WorkspaceHomePage } from "@/app/(workspace)/_components/workspace-home/workspace-home-page";
import { buildWorkspaceHomeModel } from "@/app/(workspace)/_lib/workspace-home-model";

describe("WorkspaceHomePage", () => {
	it("renders the neutral starter-mode protected home", () => {
		const markup = renderToStaticMarkup(
			<WorkspaceHomePage
				model={buildWorkspaceHomeModel({
					docs: true,
					course: false,
					starterRepo: false,
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
		expect(markup).not.toContain('data-card="starter-repo"');
		expect(markup).toContain('data-card="account"');
	});
});
