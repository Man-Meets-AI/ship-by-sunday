import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Bebas_Neue, Manrope } from "next/font/google";

import { ConvexClientProvider } from "@/components/convex-client-provider";
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
	title: "Ship by Sunday",
	description:
		"Go from idea to v1 this weekend with an action-first system for engineers who want to stop circling unfinished ideas.",
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
