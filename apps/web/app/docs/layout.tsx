import type { Metadata, Viewport } from "next";
import { getPageMap } from "nextra/page-map";
import { Layout } from "nextra-theme-docs";

import { DOCS_THEME_STORAGE_KEY } from "@/features/docs/lib/theme-preferences";
import { getDocsMetadataDefaults } from "@/features/docs/lib/docs-metadata";
import { DocsFooter } from "@/features/docs/components/docs-footer";
import { DocsNavbar } from "@/features/docs/components/docs-navbar";
import { isStarterModuleEnabled } from "@/config/starter-selectors";

import "nextra-theme-docs/style.css";
import "@/features/docs/styles/docs-theme.css";

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

	const pageMap = await getPageMap("/docs");

	return (
		<Layout
			darkMode={false}
			editLink={null}
			feedback={{ content: null }}
			footer={<DocsFooter />}
			navbar={<DocsNavbar />}
			nextThemes={{
				attribute: "class",
				defaultTheme: "system",
				storageKey: DOCS_THEME_STORAGE_KEY,
				disableTransitionOnChange: true,
			}}
			pageMap={pageMap}
			search={null}
			sidebar={{
				defaultMenuCollapseLevel: 1,
			}}
			toc={{
				title: "On this page",
			}}
		>
			{children}
		</Layout>
	);
}
