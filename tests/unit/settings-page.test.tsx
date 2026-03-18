import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@clerk/nextjs", () => ({
	UserProfile: ({ path }: { path: string }) => (
		<div data-user-profile={path}>UserProfile</div>
	),
}));

vi.mock("@/features/course/shared/components/product-shell", () => ({
	ProductShell: ({ children }: { children: React.ReactNode }) => (
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

globalThis.React = React;

import { SettingsPage } from "@/features/settings/components/settings-page";

describe("SettingsPage", () => {
	it("includes the starter repo access card above the Clerk profile", () => {
		const markup = renderToStaticMarkup(<SettingsPage />);

		expect(markup).toContain("Manage your account");
		expect(markup).toContain('data-starter-repo-card="settings"');
		expect(markup).toContain('data-user-profile="/settings"');
	});
});
