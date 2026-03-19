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
import { ConvexClientProvider } from "@/platform/convex/convex-client-provider";
import "./globals.css";

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

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={bebasNeue.variable}>
				<ClerkProvider>
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
