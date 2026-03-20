import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import "@xyflow/react/dist/style.css";
import { Bebas_Neue } from "next/font/google";
import { ThemeProvider } from "next-themes";

const bebasNeue = Bebas_Neue({
	subsets: ["latin"],
	weight: "400",
	variable: "--font-bebas-neue",
});

import { Toaster } from "@/components/ui/sonner";
import { manifestConfig, productConfig } from "@/config/product";
import { sessionTaskUrls } from "@/features/auth/sign-in/sign-in-route-utils";
import { ConvexClientProvider } from "@/platform/convex/convex-client-provider";
import { getMetadataBase } from "@/platform/next/metadata-base";
import "./globals.css";

export const metadata: Metadata = {
	metadataBase: getMetadataBase(),
	title: {
		default: productConfig.name,
		template: `%s | ${productConfig.name}`,
	},
	description: productConfig.metadataDescription,
	alternates: {
		canonical: "/",
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "/",
		siteName: productConfig.name,
		title: productConfig.name,
		description: productConfig.metadataDescription,
		images: [
			{
				url: productConfig.images.heroPreview,
				alt: `${productConfig.name} preview`,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: productConfig.name,
		description: productConfig.metadataDescription,
		images: [productConfig.images.heroPreview],
	},
	manifest: "/manifest.webmanifest",
	icons: {
		icon: [...manifestConfig.metadataIcons.icon],
		apple: [...manifestConfig.metadataIcons.apple],
		shortcut: [...manifestConfig.metadataIcons.shortcut],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={bebasNeue.variable}>
				<ClerkProvider taskUrls={sessionTaskUrls}>
					<ThemeProvider
						attribute="class"
						defaultTheme="light"
						enableSystem={false}
					>
						<ConvexClientProvider>{children}</ConvexClientProvider>
						<Toaster />
					</ThemeProvider>
				</ClerkProvider>
			</body>
		</html>
	);
}
