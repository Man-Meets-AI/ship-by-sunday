import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Bebas_Neue, Manrope } from "next/font/google";
import "@xyflow/react/dist/style.css";

import { manifestConfig, productConfig } from "@/config/product";
import { ProductThemeProvider } from "@/features/course/shared/components/product-theme-provider";
import { getInitialProductTheme } from "@/features/course/shared/server/product-theme";
import {
	getProductThemeBootstrapScript,
	getProductThemeTokenStyles,
} from "@/features/course/shared/utils/product-theme";
import { ConvexClientProvider } from "@/platform/convex/convex-client-provider";

import "./globals.css";

const display = Bebas_Neue({
	variable: "--font-display",
	subsets: ["latin"],
	weight: "400",
});

const sans = Manrope({
	variable: "--font-sans",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: productConfig.name,
	description: productConfig.metadataDescription,
	manifest: "/manifest.webmanifest",
	icons: {
		icon: [...manifestConfig.metadataIcons.icon],
		apple: [...manifestConfig.metadataIcons.apple],
		shortcut: [...manifestConfig.metadataIcons.shortcut],
	},
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const initialTheme = await getInitialProductTheme();

	return (
		<html
			lang="en"
			data-product-theme={initialTheme}
			suppressHydrationWarning
			className={`${display.variable} ${sans.variable} ${initialTheme}`}
		>
			<head>
				<style>{getProductThemeTokenStyles()}</style>
				<script>{getProductThemeBootstrapScript()}</script>
			</head>
			<body>
				<ClerkProvider>
					<ProductThemeProvider initialTheme={initialTheme}>
						<ConvexClientProvider>{children}</ConvexClientProvider>
					</ProductThemeProvider>
				</ClerkProvider>
			</body>
		</html>
	);
}
