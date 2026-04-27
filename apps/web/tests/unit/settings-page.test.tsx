import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/features/workspace-shell/components/app-shell", () => ({
	AppShell: ({ children }: { children: React.ReactNode }) => (
		<div data-product-shell="true">{children}</div>
	),
}));

vi.mock("@/features/codex/components/codex-connection-card", () => ({
	CodexConnectionCard: () => <div data-codex-card="true">Codex</div>,
}));

vi.mock("@/features/starter-repo/components/starter-repo-access-card", () => ({
	StarterRepoAccessCard: ({ surface }: { surface: string }) => (
		<div data-starter-repo-card={surface}>Starter Repo</div>
	),
}));

vi.mock("@/app/(workspace)/_components/settings-account-card", () => ({
	SettingsAccountCard: () => (
		<div data-settings-account-card="true">Account</div>
	),
}));

globalThis.React = React;

import { SettingsPage } from "@/app/(workspace)/settings/_components/settings-page";

describe("SettingsPage", () => {
	it("includes Codex and account cards without the legacy starter-repo card", () => {
		const markup = renderToStaticMarkup(<SettingsPage />);

		expect(markup).toContain("Manage your account");
		const codex = markup.indexOf('data-codex-card="true"');
		const account = markup.indexOf('data-settings-account-card="true"');
		expect(codex).toBeGreaterThan(-1);
		expect(account).toBeGreaterThan(-1);
		expect(markup).not.toContain('data-starter-repo-card="settings"');
		expect(codex).toBeLessThan(account);
	});
});
