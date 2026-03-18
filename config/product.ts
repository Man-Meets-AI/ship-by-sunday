type ThemeMode = "dark" | "light";

type ProductThemePalette = {
	colorScheme: ThemeMode;
	bgRgb: string;
	surfaceRgb: string;
	surfaceStrongRgb: string;
	surfaceAltRgb: string;
	borderRgb: string;
	textRgb: string;
	mutedRgb: string;
	accentRgb: string;
	accentSoftRgb: string;
	chipRgb: string;
	shadowRgb: string;
};

export const PRODUCT_APP_ID = "ship-by-sunday" as const;
export const PRODUCT_COURSE_SLUG = "ship-by-sunday" as const;

export const assetPaths = {
	favicon: "/favicon.ico",
	favicon16: "/favicon-16x16.png",
	favicon32: "/favicon-32x32.png",
	appleTouchIcon: "/apple-touch-icon.png",
	androidChrome192: "/android-chrome-192x192.png",
	androidChrome512: "/android-chrome-512x512.png",
	founderProof: "/founder-proof.jpg",
	logo: "/ship-by-sunday.png",
	missionPreview: "/product/mission-bg.png",
} as const;

export const brandColorConfig = {
	whiteHex: "#ffffff",
	whiteRgb: "255 255 255",
	inkHex: "#111111",
	inkRgb: "17 17 17",
	paperHex: "#f5f1ea",
	paperRgb: "245 241 234",
	lineHex: "#1a1a1a",
	lineRgb: "26 26 26",
	mutedHex: "#ece7de",
	mutedRgb: "236 231 222",
	accentHex: "#262626",
	accentRgb: "38 38 38",
	dangerHex: "#a83232",
	dangerRgb: "168 50 50",
	dangerSoftHex: "#f0b4b4",
	dangerSoftRgb: "240 180 180",
} as const;

export const productThemePalettes = {
	light: {
		colorScheme: "light",
		bgRgb: "245 241 234",
		surfaceRgb: "255 255 255",
		surfaceStrongRgb: "245 241 234",
		surfaceAltRgb: "236 231 222",
		borderRgb: "26 26 26",
		textRgb: "17 17 17",
		mutedRgb: "86 78 64",
		accentRgb: "17 17 17",
		accentSoftRgb: "38 38 38",
		chipRgb: "236 231 222",
		shadowRgb: "17 17 17",
	},
	dark: {
		colorScheme: "dark",
		bgRgb: "11 11 11",
		surfaceRgb: "18 18 20",
		surfaceStrongRgb: "10 10 12",
		surfaceAltRgb: "34 34 38",
		borderRgb: "92 92 92",
		textRgb: "252 252 252",
		mutedRgb: "174 182 194",
		accentRgb: "75 179 248",
		accentSoftRgb: "149 255 255",
		chipRgb: "23 25 30",
		shadowRgb: "0 0 0",
	},
} as const satisfies Record<ThemeMode, ProductThemePalette>;

export const productThemeConfig = {
	defaultTheme: "dark" as const,
	storageKey: "sbs:theme",
	cookieName: "sbs-theme",
	cookieMaxAgeSeconds: 31_536_000,
	scrollbarSizePx: 8,
	scrollbarThumbAlpha: 0.34,
	scrollbarThumbHoverAlpha: 0.5,
	motion: {
		fastMs: 120,
		baseMs: 180,
		slowMs: 240,
		easeStandard: "cubic-bezier(0.2, 0.8, 0.2, 1)",
		easeExit: "cubic-bezier(0.4, 0, 1, 1)",
	},
	palettes: productThemePalettes,
} as const;

export const productConfig = {
	appId: PRODUCT_APP_ID,
	courseSlug: PRODUCT_COURSE_SLUG,
	name: "Ship by Sunday",
	shortMark: "MMAI",
	promise: "Go from idea to v1 this weekend",
	metadataDescription:
		"Go from idea to v1 this weekend with an action-first system for engineers who want to stop circling unfinished ideas.",
	priceUsdCents: 50000,
	priceDisplay: "$500",
	currency: "usd",
	bonusName: "Product Management for Beginners",
	images: {
		founderProof: assetPaths.founderProof,
		logo: assetPaths.logo,
		missionPreview: assetPaths.missionPreview,
	},
} as const;

export const manifestConfig = {
	startUrl: "/",
	display: "standalone",
	backgroundColorHex: brandColorConfig.whiteHex,
	themeColorHex: brandColorConfig.whiteHex,
	icons: [
		{
			src: assetPaths.androidChrome192,
			sizes: "192x192",
			type: "image/png",
		},
		{
			src: assetPaths.androidChrome512,
			sizes: "512x512",
			type: "image/png",
		},
	],
	metadataIcons: {
		icon: [
			{ url: assetPaths.favicon, sizes: "any" },
			{ url: assetPaths.favicon16, type: "image/png", sizes: "16x16" },
			{ url: assetPaths.favicon32, type: "image/png", sizes: "32x32" },
			{
				url: assetPaths.androidChrome192,
				type: "image/png",
				sizes: "192x192",
			},
			{
				url: assetPaths.androidChrome512,
				type: "image/png",
				sizes: "512x512",
			},
		],
		apple: [
			{
				url: assetPaths.appleTouchIcon,
				type: "image/png",
				sizes: "180x180",
			},
		],
		shortcut: [assetPaths.favicon],
	},
} as const;

export const routeConfig = {
	home: "/",
	mission: "/mission",
	accessRequired: "/access-required",
	artifacts: "/artifacts",
	settings: "/settings",
	signIn: "/sign-in",
	signUp: "/sign-up",
	checkoutSuccess: "/checkout/success",
	checkoutCancel: "/checkout/cancel",
	pricingHash: "#pricing",
} as const;

export const apiRouteConfig = {
	stripeCheckout: "/api/stripe/checkout",
	stripeWebhook: "/api/stripe/webhook",
	codexGenerate: "/api/codex/generate",
	codexAccountRead: "/api/codex/account/read",
	codexAccountLoginStart: "/api/codex/account/login/start",
	codexAccountLoginPoll: "/api/codex/account/login/poll",
	codexAccountRateLimits: "/api/codex/account/rate-limits",
	codexAccountLogout: "/api/codex/account/logout",
} as const;

export const apiConfig = {
	secureHttpProtocol: "https://",
	stripeApiVersion: "2026-02-25.clover",
	convexAuthTokenTemplate: "convex",
	bunnyEmbedBaseUrl: "https://player.mediadelivery.net/embed",
	codexAppServerClientVersion: "0.1.0",
} as const;

export const timingConfig = {
	accessRetryResetMs: 1200,
	checkoutAutoRedirectMs: 700,
	checkoutStatusRotateMs: 1600,
	lessonAutosaveDebounceMs: 650,
	promptCopyResetMs: 1600,
	lessonCompletionReducedMotionNavigateMs: 250,
	lessonCompletionNavigateMs: 900,
} as const;

export const limitConfig = {
	codexAppServerRequestTimeoutMinMs: 2_000,
	codexAppServerRequestTimeoutDefaultMs: 25_000,
	codexTurnTimeoutDefaultMs: 60_000,
	codexUserStateHashLength: 16,
} as const;

export const courseResourceConfig = {
	downloads: {
		coreTemplatesPdf: "/downloads/ship-by-sunday-core-templates.pdf",
		studentPacketPdf: "/downloads/ship-by-sunday-student-packet.pdf",
		storyboardTemplatePdf: "/downloads/ship-by-sunday-storyboard-template.pdf",
	},
	figjam: {
		workspace:
			"https://www.figma.com/board/csR3w46LJaHNU0RKHVOJDB/Ship-by-Sunday-Template?node-id=0-1",
		storyboard:
			"https://www.figma.com/board/csR3w46LJaHNU0RKHVOJDB/Template-for-Storyboard?node-id=0-1",
	},
	designReferences: [
		{ id: "ref-mobbin", label: "Mobbin", href: "https://mobbin.design" },
		{
			id: "ref-spotted-in-prod",
			label: "Spotted in Prod",
			href: "https://spottedinprod.com",
		},
		{
			id: "ref-curated",
			label: "Curated",
			href: "https://www.curated.design",
		},
		{
			id: "ref-landing-love",
			label: "Landing Love",
			href: "https://www.landing.love",
		},
		{
			id: "ref-navbar-gallery",
			label: "Navbar Gallery",
			href: "https://www.navbar.gallery",
		},
		{
			id: "ref-cta-gallery",
			label: "CTA Gallery",
			href: "https://www.cta.gallery",
		},
		{
			id: "ref-app-motion",
			label: "App Motion",
			href: "https://appmotion.design",
		},
		{
			id: "ref-rebrand-gallery",
			label: "Rebrand Gallery",
			href: "https://www.rebrand.gallery",
		},
		{
			id: "ref-hugeicons",
			label: "Hugeicons",
			href: "https://hugeicons.com",
		},
		{
			id: "ref-component-gallery",
			label: "Component Gallery",
			href: "https://www.component.gallery",
		},
	],
} as const;

export const authViewConfig = {
	clerkCardClassName:
		"rounded-none border border-product-border bg-product-surface/92 text-product-text shadow-panel backdrop-blur-xl",
	fallbackRedirectUrl: routeConfig.mission,
} as const;

export function getSignInRedirectHref(redirectPath: string) {
	return `${routeConfig.signIn}?redirect_url=${encodeURIComponent(redirectPath)}`;
}

export function getCheckoutSuccessHref(sessionId?: string) {
	if (!sessionId) {
		return routeConfig.checkoutSuccess;
	}

	return `${routeConfig.checkoutSuccess}?session_id=${sessionId}`;
}
