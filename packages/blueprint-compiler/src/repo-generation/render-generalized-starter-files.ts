import type { CanonicalProjectDefinition } from "../canonical-project-definition/project-definition";
import type { RenderedBlueprintFile } from "../blueprints/render-types";

function renderAssistantGuide(
	title: "AGENTS.md" | "CLAUDE.md" | "GEMINI.md",
	productName: string,
	productSummary: string,
): RenderedBlueprintFile {
	return {
		path: title,
		content: [
			`# ${title}`,
			"",
			`This starter repo for ${productName} ships generated planning material under \`docs/\` plus the runnable app under \`apps/web\`.`,
			"",
			productSummary,
			"",
			"## Start Here",
			"",
			"- Read `README.md`, then open `DESIGN.md`, `docs/README.md`, and `docs/facts/project-definition.json`.",
			"- Treat `DESIGN.md` as the visual source of truth before changing layout, styling, theming, motion, or component presentation.",
			"- When using an AI coding or design tool, explicitly tell it to follow `DESIGN.md` and the generated design snapshot before it proposes UI changes.",
			"- Use `bun` for JavaScript work and `uv` for Python utilities.",
			"- Keep diffs scoped, rename vague identifiers, and separate UI rendering from stateful logic.",
			"- Keep browser smoke under `apps/web/playwright/` and app-local Vitest helpers under `apps/web/tests/`.",
		].join("\n"),
	};
}

function renderAppAssistantGuide(
	productName: string,
	productSummary: string,
): RenderedBlueprintFile {
	return {
		path: "apps/web/AGENTS.md",
		content: [
			"# apps/web/AGENTS.md",
			"",
			`This app for ${productName} ships with a generated root \`DESIGN.md\` plus generated planning material under \`docs/\`.`,
			"",
			productSummary,
			"",
			"## Start Here",
			"",
			"- Read root `DESIGN.md` before changing layout, styling, theming, motion, docs chrome, or component presentation.",
			"- Use `docs/facts/design-system.json` and `apps/web/config/generated-design-system.ts` as the machine-readable design snapshot.",
			"- Preserve semantic tokens such as `background`, `foreground`, `primary`, `border`, and `sidebar-*` instead of hard-coding colors.",
			"- Keep the app UI aligned with the generated design system unless the user explicitly changes it.",
			"- When prompting an AI tool, name the screen goal and tell it to follow `DESIGN.md` rather than inventing a fresh visual style.",
		].join("\n"),
	};
}

export function renderGeneralizedStarterFiles(
	projectDefinition: CanonicalProjectDefinition,
): RenderedBlueprintFile[] {
	const { facts } = projectDefinition;

	return [
		renderAssistantGuide(
			"AGENTS.md",
			facts.product_name,
			facts.product_summary,
		),
		renderAssistantGuide(
			"CLAUDE.md",
			facts.product_name,
			facts.product_summary,
		),
		renderAssistantGuide(
			"GEMINI.md",
			facts.product_name,
			facts.product_summary,
		),
		renderAppAssistantGuide(facts.product_name, facts.product_summary),
		{
			path: ".agents/README.md",
			content: [
				"# .agents",
				"",
				"Use this folder for project-safe agent plans, references, and reusable working notes.",
				"",
				"- Keep customer-sensitive or secret material out of this folder.",
				"- Prefer short, task-specific plan files under `.agents/plans/`.",
				"- Put reusable process notes or starter skills under `.agents/skills/`.",
			].join("\n"),
		},
		{
			path: ".agents/plans/README.md",
			content:
				"# Agent Plans\n\nStore short execution plans here when work needs more than a single chat turn.\n",
		},
		{
			path: ".agents/skills/README.md",
			content:
				"# Starter Skills\n\nUse this folder for reusable project-safe agent instructions and checklists.\n",
		},
		{
			path: ".github/workflows/examples/README.md",
			content: [
				"# Workflow Examples",
				"",
				"These files are safe starter examples. Copy one into `.github/workflows/` and adapt the secrets, branches, and deploy steps for your own environment before enabling it.",
			].join("\n"),
		},
		{
			path: ".github/workflows/examples/basic-ci.example.yml",
			content: [
				"name: Basic CI Example",
				"",
				"on:",
				"  pull_request:",
				"  workflow_dispatch:",
				"",
				"jobs:",
				"  checks:",
				"    runs-on: ubuntu-latest",
				"    steps:",
				"      - uses: actions/checkout@v4",
				"      - uses: oven-sh/setup-bun@v2",
				"      - run: bun install",
				"      - run: bun run lint",
				"      - run: bun run build",
			].join("\n"),
		},
		{
			path: "apps/web/tests/README.md",
			content: [
				"# App Tests",
				"",
				"Keep tests close to the app code and grouped by product domain instead of by framework layer.",
				"",
				"- Domain folders should mirror app areas such as `auth/`, `checkout/`, `course/`, or `observability/`.",
				"- Plain `*.test.ts` and `*.test.tsx` files are the default unit lane.",
				"- `*.integration.test.ts` files are the route and server integration lane.",
				"- `*.ui.test.tsx` files are the jsdom UI lane.",
				"- `*.contract.test.ts` files are the offline contract lane.",
				"- `*.convex-contract.test.ts` files are the edge-runtime Convex contract lane.",
				"- `tests/setupTests.ts` is the shared jsdom setup entrypoint.",
				"- `tests/utils/` is the app-local shared test helper surface.",
			].join("\n"),
		},
		{
			path: "apps/web/tests/utils/README.md",
			content: [
				"# Test Utils",
				"",
				"Put shared Vitest helpers here when more than one domain-level test needs them.",
			].join("\n"),
		},
		{
			path: "apps/web/playwright/README.md",
			content: [
				"# Playwright",
				"",
				"Keep browser smoke and browser-specific setup here, next to the web app.",
				"",
				"- Prefer one deterministic smoke suite that can run locally and against a deployed URL.",
				"- Keep checkout-route smoke optional through env flags instead of building a second QA runtime.",
			].join("\n"),
		},
		{
			path: "apps/web/.env.production.example",
			content: [
				"# Canonical production URL for hosted redirects and metadata.",
				"APP_BASE_URL=https://your-domain.example",
				"",
				"# Clerk",
				"NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=",
				"NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in",
				"CLERK_SECRET_KEY=",
				"CLERK_WEBHOOK_SIGNING_SECRET=",
				"CLERK_FRONTEND_API_URL=",
				"CLERK_AUTHORIZED_PARTIES=https://your-domain.example",
				"",
				"# Convex",
				"NEXT_PUBLIC_CONVEX_URL=",
				"NEXT_PUBLIC_CONVEX_SITE_URL=",
				"",
				"# Observability",
				"OBSERVABILITY_INGEST_TOKEN=",
				"OBSERVABILITY_INCIDENT_CONTROL_TOKEN=",
				"OBSERVABILITY_VERCEL_WEBHOOK_SECRET=",
				"TELEGRAM_BOT_TOKEN=",
				"TELEGRAM_CHAT_ID=",
				"",
				"# Stripe",
				"STRIPE_SECRET_KEY=",
				"STRIPE_WEBHOOK_SECRET=",
				"STRIPE_PRICE_ID=",
				"STRIPE_PRODUCT_ID=",
				"",
				"# Media and Codex integrations",
				"AUPHONIC_API_KEY=",
				"AUPHONIC_PRESET_ID=",
				"BUNNY_STREAM_API_KEY=",
				"BUNNY_STREAM_LIBRARY_ID=",
				"CODEX_BINARY=",
				"CODEX_APP_SERVER_ENABLED=false",
				"CODEX_APP_SERVER_HOME_ROOT=",
				"CODEX_APP_SERVER_MODEL=",
				"CODEX_APP_SERVER_TIMEOUT_MS=",
			].join("\n"),
		},
	];
}
