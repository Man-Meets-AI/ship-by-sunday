import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/app/(app)/_components/app-shell", () => ({
	AppShell: ({ children }: { children: React.ReactNode }) => (
		<div data-product-shell="true">{children}</div>
	),
}));

vi.mock(
	"@/app/(app)/_components/codex-connection-card/codex-connection-card",
	() => ({
		CodexConnectionCard: () => <div data-codex-card="true">Codex</div>,
	}),
);

vi.mock("@/app/(app)/_components/settings-account-card", () => ({
	SettingsAccountCard: () => (
		<div data-settings-account-card="true">Account</div>
	),
}));

globalThis.React = React;

import { SettingsPage } from "@/app/(app)/settings/_components/settings-page";

describe("SettingsPage", () => {
	it("includes Codex and account cards", () => {
		const markup = renderToStaticMarkup(<SettingsPage />);

		expect(markup).toContain('data-slot="protected-route-page"');
		expect(markup).toContain('data-slot="protected-route-header"');
		expect(markup).toContain("Connect Codex and open Clerk");
		expect(markup).toContain('id="settings-toc"');
		expect(markup).toContain('id="settings-account"');
		const codex = markup.indexOf('data-codex-card="true"');
		const account = markup.indexOf('data-settings-account-card="true"');
		expect(codex).toBeGreaterThan(-1);
		expect(account).toBeGreaterThan(-1);
		expect(codex).toBeLessThan(account);
		expect(markup).not.toContain("Starter repository");
		expect(markup).not.toContain("Starter repo");
		expect(markup).not.toContain("font-heading-serif");
	});
});
