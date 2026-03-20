import { courseResourceConfig } from "@/config/product";

/** Persisted field ids — must match `build.ts` lesson 3.0 workbenchFields. */
export const BUILD_SETUP_PRODUCT_FOLDER_FIELD_ID = "build_product_folder_name";

export const BUILD_SETUP_CHECKLIST_FIELD_ID = "build_setup_prereqs";

export const BUILD_SETUP_STARTER_DESCRIPTION =
	"Next.js + Convex + Clerk + Stripe starter—the repo the build walkthrough assumes.";

export function buildSetupInstructorCommandsBlock(repoUrl: string): string {
	return [
		"# Copy the template into a fresh folder (replace YOUR_FOLDER)",
		`git clone ${repoUrl} YOUR_FOLDER`,
		"cd YOUR_FOLDER",
		"",
		"# Install deps (use npm, pnpm, or yarn—match what you use elsewhere)",
		"npm install",
		"",
		"# Copy env templates if the repo ships them, then fill keys from Convex / Clerk / Stripe",
		"# Open .env.local for development and .env.production for production deploy keys",
		"",
		"# Run the app (command may be npm run dev in the starter)",
		"npm run dev",
	].join("\n");
}

export const BUILD_SETUP_PROXY_ACCORDION_COPY = {
	title: "About `proxy` (optional)",
	body:
		"Next.js can route selected requests through a `proxy` file so browser calls hit your backend safely. Treat it as wiring—not your marketing copy. Secrets stay in env files and provider dashboards; the proxy is not a place to paste API keys.",
} as const;

export const BUILD_SETUP_MAC_TIP =
	"On Mac, some instructors keep active projects under a dedicated Developer folder in your home directory—that layout is optional.";

const { buildSetup } = courseResourceConfig;

type BuildSetupProviderDashboard = {
	name: string;
	logoSrc: string;
	description: string;
	href: string;
	/** Optional frame (e.g. white logo on tinted field). */
	logoMediaClassName?: string;
};

/** Provider dashboard links for env setup (logos in `public/integrations/`). */
export const BUILD_SETUP_PROVIDER_DASHBOARDS: readonly BuildSetupProviderDashboard[] = [
	{
		name: "Convex",
		logoSrc: "/integrations/convex.svg",
		description: "Deployments, env vars, and project keys for your backend.",
		href: buildSetup.convexDashboard,
	},
	{
		name: "Clerk",
		logoSrc: "/integrations/clerk.svg",
		/** White mark: tint so it reads on light card backgrounds. */
		logoMediaClassName: "rounded-md bg-violet-600 p-1.5",
		description: "API keys for authentication in your Next.js app.",
		href: buildSetup.clerk,
	},
	{
		name: "Stripe",
		logoSrc: "/integrations/stripe.svg",
		description: "Secret and publishable keys for billing and webhooks.",
		href: buildSetup.stripe,
	},
];
