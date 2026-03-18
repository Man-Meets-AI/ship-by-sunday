import type { Metadata } from "next";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import { Layout } from "nextra-theme-docs";

import { PRODUCT_THEME_STORAGE_KEY } from "@/features/course/shared/utils/product-theme";
import { DocsFooter } from "@/features/docs/components/docs-footer";
import { DocsNavbar } from "@/features/docs/components/docs-navbar";

import "nextra-theme-docs/style.css";
import "@/features/docs/styles/docs-theme.css";

export const metadata: Metadata = {
	title: {
		default: "Ship by Sunday Docs",
		template: "%s | Ship by Sunday Docs",
	},
	description:
		"Tutorial-first docs for getting the Ship by Sunday starter running, customized, and shipped.",
};

export default async function DocsLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
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
					storageKey: PRODUCT_THEME_STORAGE_KEY,
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
