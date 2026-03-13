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
