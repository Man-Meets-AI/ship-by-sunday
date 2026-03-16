import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Bebas_Neue, Manrope } from "next/font/google";
import "@xyflow/react/dist/style.css";

import { ConvexClientProvider } from "@/components/convex-client-provider";
import { productConfig } from "@/config/product";
import { getProductThemeBootstrapScript } from "@/lib/product-theme";
import { getInitialProductTheme } from "@/lib/server/product-theme";

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
		icon: [
			{ url: "/favicon.ico", sizes: "any" },
			{ url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
			{ url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
			{
				url: "/android-chrome-192x192.png",
				type: "image/png",
				sizes: "192x192",
			},
			{
				url: "/android-chrome-512x512.png",
				type: "image/png",
				sizes: "512x512",
			},
		],
		apple: [
			{
				url: "/apple-touch-icon.png",
				type: "image/png",
				sizes: "180x180",
			},
		],
		shortcut: ["/favicon.ico"],
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
			className={`${display.variable} ${sans.variable}`}
		>
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: getProductThemeBootstrapScript(),
					}}
				/>
			</head>
			<body>
				<ClerkProvider>
					<ConvexClientProvider>{children}</ConvexClientProvider>
				</ClerkProvider>
			</body>
		</html>
	);
}
