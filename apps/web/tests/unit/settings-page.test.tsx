import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/app/(workspace)/_components/app-shell", () => ({
	AppShell: ({ children }: { children: React.ReactNode }) => (
		<div data-product-shell="true">{children}</div>
	),
}));

vi.mock(
	"@/app/(workspace)/_components/codex-connection-card/codex-connection-card",
	() => ({
		CodexConnectionCard: () => <div data-codex-card="true">Codex</div>,
	}),
);

vi.mock(
	"@/app/(workspace)/_components/starter-repo-access/starter-repo-access-card",
	() => ({
		StarterRepoAccessCard: ({ surface }: { surface: string }) => (
			<div data-starter-repo-card={surface}>Starter Repo</div>
		),
	}),
);

vi.mock("@/app/(workspace)/_components/settings-account-card", () => ({
	SettingsAccountCard: () => (
		<div data-settings-account-card="true">Account</div>
	),
}));

globalThis.React = React;

import { SettingsPage } from "@/app/(workspace)/settings/_components/settings-page";

describe("SettingsPage", () => {
	it("includes Codex, starter repo, and account cards", () => {
		const markup = renderToStaticMarkup(<SettingsPage />);

		expect(markup).toContain(
			"Manage your account, Codex connection, and starter repo access",
		);
		const codex = markup.indexOf('data-codex-card="true"');
		const starterRepo = markup.indexOf('data-starter-repo-card="settings"');
		const account = markup.indexOf('data-settings-account-card="true"');
		expect(codex).toBeGreaterThan(-1);
		expect(starterRepo).toBeGreaterThan(-1);
		expect(account).toBeGreaterThan(-1);
		expect(codex).toBeLessThan(starterRepo);
		expect(starterRepo).toBeLessThan(account);
	});
});
