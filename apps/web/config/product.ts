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
	heroPreview: "/agent-ready-packs-preview.svg",
} as const;

export const brandColorConfig = {
	whiteHex: "#FDFDFD",
} as const;

export const starterRepoConfig = {
	owner: "ParkerRex",
	repo: "ship-by-sunday-starter",
	url: "https://github.com/ParkerRex/ship-by-sunday-starter",
} as const;

export const routeConfig = {
	home: "/",
	blueprint: "/blueprint",
	review: "/review",
	execute: "/execute",
	docs: "/docs",
	blog: "/blog",
	mission: "/mission",
	artifacts: "/artifacts",
	settings: "/settings",
	signIn: "/sign-in",
	signUp: "/sign-up",
	checkoutSuccess: "/checkout/success",
	checkoutCancel: "/checkout/cancel",
	systemHash: "#system",
	pricingHash: "#pricing",
} as const;

export const homePageSectionOrder = [
	"hero",
	"sprintPath",
	"mechanism",
	"whatsInside",
	"starterSystem",
	"durability",
	"socialProof",
	"faq",
	"pricing",
	"footer",
] as const;

export type HomePageSectionName = (typeof homePageSectionOrder)[number];

export type HomePageCtaTarget =
	| {
			readonly kind: "checkout";
	  }
	| {
			readonly kind: "link";
			readonly href: string;
	  };

export type StarterHomePageConfig = {
	readonly sections: Readonly<Record<HomePageSectionName, boolean>>;
	readonly heroPrimaryCta: HomePageCtaTarget;
	readonly pricingPrimaryCta: HomePageCtaTarget;
};

export const starterHomePageConfig = {
	sections: {
		hero: true,
		sprintPath: true,
		mechanism: false,
		whatsInside: true,
		starterSystem: true,
		durability: false,
		socialProof: true,
		faq: true,
		pricing: true,
		footer: true,
	},
	heroPrimaryCta: {
		kind: "checkout",
	},
	pricingPrimaryCta: {
		kind: "checkout",
	},
} as const satisfies StarterHomePageConfig;

export const starterConfig = {
	appId: PRODUCT_APP_ID,
	courseSlug: PRODUCT_COURSE_SLUG,
	brand: {
		name: "Ship by Sunday",
		shortMark: "MMAI",
		promise: "Ship a real, durable product by Sunday",
		metadataDescription:
			"Ship by Sunday helps you ship a real, durable product by Sunday with contract-first docs packs, an Agent-Ready Starter System, and support built to keep shipping on Monday.",
		images: {
			founderProof: assetPaths.founderProof,
			heroPreview: assetPaths.heroPreview,
		},
	},
	pricing: {
		priceUsdCents: 50000,
		priceDisplay: "$500",
		currency: "usd",
	},
	bonus: {
		name: "Product Management for Beginners",
		playlistUrl:
			"https://www.youtube.com/playlist?list=PLO6IqfGPRUN1Bof9pACmGc955t4d0J6cM",
	},
	marketing: {
		docsLabel: "Docs",
		loginLabel: "Sign in",
		primaryCtaLabel: "Get Ship by Sunday",
		previewImageAlt: "Ship by Sunday system preview",
	},
	workspace: {
		homeLabel: "Workspace",
		homeNoun: "workspace",
		homeSubtitle: "Your product, one step at a time",
		openHomeActionLabel: "Open workspace",
		firstStepLabel: "workspace step",
		artifactsLabel: "Artifacts",
		settingsLabel: "Settings",
	},
	docs: {
		badgeLabel: "Docs",
		description:
			"Operational setup and troubleshooting docs for Ship by Sunday, covering local setup, auth, payments, the route map, and launch-critical recovery steps.",
	},
	blog: {
		footerLabel: "Blog",
		description:
			"Public editorials from Ship by Sunday on durable product context, agent-ready packs, and shipping real software with AI without losing the thread.",
		promoCtaTarget: {
			kind: "link",
			href: "/#pricing",
		} satisfies HomePageCtaTarget,
	},
	modules: {
		docs: true,
		course: true,
		starterRepo: false,
		observability: true,
		codex: true,
	},
	homePage: starterHomePageConfig,
	starterRepo: starterRepoConfig,
} as const;

export const productConfig = {
	appId: starterConfig.appId,
	courseSlug: starterConfig.courseSlug,
	name: starterConfig.brand.name,
	shortMark: starterConfig.brand.shortMark,
	promise: starterConfig.brand.promise,
	metadataDescription: starterConfig.brand.metadataDescription,
	priceUsdCents: starterConfig.pricing.priceUsdCents,
	priceDisplay: starterConfig.pricing.priceDisplay,
	currency: starterConfig.pricing.currency,
	bonusName: starterConfig.bonus.name,
	bonusPlaylistUrl: starterConfig.bonus.playlistUrl,
	images: {
		founderProof: starterConfig.brand.images.founderProof,
		heroPreview: starterConfig.brand.images.heroPreview,
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

export const apiRouteConfig = {
	stripeCheckout: "/api/stripe/checkout",
	stripeWebhook: "/stripe/webhook",
	observabilityClerk: "/api/observability/clerk",
	observabilityVercel: "/api/observability/vercel",
	observabilityIncidentStatus:
		"/api/observability/incidents/[incidentId]/status",
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
	starterRepo: starterRepoConfig,
	/** Lesson 1.9 — Codex & skills orientation */
	codexLesson: {
		openaiSkillsPackZip:
			"https://github.com/openai/skills/archive/refs/heads/main.zip",
		figmaMcpDocs: "https://developers.figma.com/docs/figma-mcp-server/",
		codexSkillsDeeplink: "codex://skills",
		openaiSkillsRepo: "https://github.com/openai/skills",
	},
	/** Clerk / Convex / Stripe entry points for Build block setup (lesson 3.0). */
	buildSetup: {
		clerk: "https://dashboard.clerk.com/",
		convex: "https://www.convex.dev/",
		convexReferral: "https://convex.dev/referral/PARKER6190",
		/** Deployments, env vars, and project keys for the starter template. */
		convexDashboard: "https://dashboard.convex.dev/",
		stripe: "https://dashboard.stripe.com/register",
		/** Referenced in Build kickoff tooling copy (OpenAI Codex). */
		codex: "https://openai.com/codex",
	},
} as const;

export const authViewConfig = {
	fallbackRedirectUrl: routeConfig.blueprint,
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
