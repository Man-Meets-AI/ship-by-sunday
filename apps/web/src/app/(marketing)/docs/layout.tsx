import type { Metadata, Viewport } from "next";

import { getDocsNavigationEntries } from "@/app/_content/public-content-inventory";
import { DocsShell } from "@/app/(marketing)/docs/_components/docs-shell";
import { getDocsMetadataDefaults } from "@/app/(marketing)/docs/_lib/docs-metadata";
import { isStarterModuleEnabled } from "@/config/starter-selectors";

import "@/app/(marketing)/docs/_styles/docs-theme.css";

import { DocsModuleDisabledState } from "./_components/docs-module-disabled-state";

export const metadata: Metadata = getDocsMetadataDefaults();

export const viewport: Viewport = {
	themeColor: [
		{
			media: "(prefers-color-scheme: light)",
			color: "rgb(253,253,253)",
		},
		{
			media: "(prefers-color-scheme: dark)",
			color: "rgb(11,11,11)",
		},
	],
};

export default async function DocsLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	if (!isStarterModuleEnabled("docs")) {
		return <DocsModuleDisabledState />;
	}

	const navigationEntries = await getDocsNavigationEntries();

	return (
		<DocsShell navigationEntries={navigationEntries}>{children}</DocsShell>
	);
}
