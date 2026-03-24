import type { Metadata } from "next";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import { Layout } from "nextra-theme-docs";

import { DOCS_THEME_STORAGE_KEY } from "@/features/docs/lib/theme-preferences";
import { getDocsMetadataDefaults } from "@/features/docs/lib/docs-metadata";
import { DocsFooter } from "@/features/docs/components/docs-footer";
import { DocsNavbar } from "@/features/docs/components/docs-navbar";
import { DocsModuleDisabledState } from "@/features/starter/components/docs-module-disabled-state";
import { isStarterModuleEnabled } from "@/features/starter/lib/starter-selectors";

import "nextra-theme-docs/style.css";
import "@/features/docs/styles/docs-theme.css";

export const metadata: Metadata = getDocsMetadataDefaults();

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
		<>
			<Head
				color={{
					hue: {
						light: 22,
						dark: 206,
					},
					saturation: {
						light: 42,
						dark: 82,
					},
					lightness: {
						light: 28,
						dark: 66,
					},
				}}
				backgroundColor={{
					light: "rgb(245,241,234)",
					dark: "rgb(11,11,11)",
				}}
			/>
			<Layout
				darkMode={false}
				editLink={null}
				feedback={{ content: null }}
				footer={<DocsFooter />}
				navbar={<DocsNavbar />}
				nextThemes={{
					attribute: "class",
					defaultTheme: "dark",
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
		</>
	);
}
