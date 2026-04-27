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
import { generatedDesignSystem } from "@/config/generated-design-system";
import { manifestConfig, productConfig, routeConfig } from "@/config/product";
import { sessionTaskUrls } from "@/platform/auth/auth-route-utils";
import { clerkProviderAppearance } from "@/lib/clerk-auth-appearance";
import { ConvexClientProvider } from "@/platform/convex/convex-client-provider";
import { publicEnv } from "@/platform/env/public";
import { serverEnv } from "@/platform/env/server";
import { getMetadataBase } from "@/platform/next/metadata-base";
import { buildGeneratedDesignSystemCss } from "@/lib/generated-design-system-css";
import "./globals.css";

void publicEnv.NEXT_PUBLIC_CLERK_SIGN_IN_URL;
const generatedDesignSystemCss = buildGeneratedDesignSystemCss(
	generatedDesignSystem,
);

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
				url: productConfig.images.founderProof,
				alt: `${productConfig.name} founder proof`,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: productConfig.name,
		description: productConfig.metadataDescription,
		images: [productConfig.images.founderProof],
	},
	verification: {
		google: serverEnv.GOOGLE_SITE_VERIFICATION,
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
			<head>
				{generatedDesignSystem.preset.font.googleFontsUrl ? (
					<link
						rel="stylesheet"
						href={generatedDesignSystem.preset.font.googleFontsUrl}
					/>
				) : null}
				<style id="generated-design-system">{generatedDesignSystemCss}</style>
			</head>
			<body className={bebasNeue.variable}>
				<ClerkProvider
					appearance={clerkProviderAppearance}
					signInUrl={routeConfig.signIn}
					signUpUrl={routeConfig.signUp}
					taskUrls={sessionTaskUrls}
				>
					<ThemeProvider
						attribute="class"
						defaultTheme="system"
						enableSystem={true}
					>
						<ConvexClientProvider>{children}</ConvexClientProvider>
						<Toaster />
					</ThemeProvider>
				</ClerkProvider>
			</body>
		</html>
	);
}
