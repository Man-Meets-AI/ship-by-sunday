import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/features/course/shared/components/app-shell", () => ({
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

vi.mock("@/features/settings/components/settings-account-card", () => ({
	SettingsAccountCard: () => (
		<div data-settings-account-card="true">Account</div>
	),
}));

globalThis.React = React;

import { SettingsPage } from "@/features/settings/components/settings-page";

describe("SettingsPage", () => {
	it("includes Codex, starter repo, and account cards in order", () => {
		const markup = renderToStaticMarkup(<SettingsPage />);

		expect(markup).toContain("Manage your account");
		const codex = markup.indexOf('data-codex-card="true"');
		const starter = markup.indexOf('data-starter-repo-card="settings"');
		const account = markup.indexOf('data-settings-account-card="true"');
		expect(codex).toBeGreaterThan(-1);
		expect(starter).toBeGreaterThan(-1);
		expect(account).toBeGreaterThan(-1);
		expect(codex).toBeLessThan(starter);
		expect(starter).toBeLessThan(account);
	});
});
