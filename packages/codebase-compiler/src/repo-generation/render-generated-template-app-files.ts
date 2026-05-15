import { readFileSync } from "node:fs";
import path from "node:path";

import type { CanonicalProjectDefinition } from "../canonical-project-definition/project-definition";
import type { RenderedCodebaseFile } from "../codebases/render-types";
import { resolveRepoRootPath } from "../repo-root";

const generatedTemplateAppScripts = {
	dev: "next dev",
	"dev:core": "next dev",
	"dev:web": "next dev",
	"dev:web:only": "next dev",
	"dev:web:webpack": "next dev --webpack",
	"dev:web:raw": "next dev",
	"dev:convex":
		"bun -e \"console.log('Convex is optional for the generated template app. Add Convex functions before running convex dev.')\"",
	"dev:stripe":
		"bun -e \"console.log('Stripe webhook listening is optional for the generated template app.')\"",
	"dev:full": "next dev",
	build: "node scripts/run-next-build-serialized.mjs",
	start: "next start",
	typecheck: "node scripts/run-next-build-serialized.mjs",
	lint: "oxlint -c ../../.oxlintrc.json --deny-warnings .",
	"lint:fix": "oxlint -c ../../.oxlintrc.json --fix --fix-suggestions .",
	format: "oxfmt -c ../../.oxfmtrc.json --ignore-path .gitignore .",
	"format:check":
		"oxfmt -c ../../.oxfmtrc.json --ignore-path .gitignore --check .",
	"test:unit": "bun -e \"console.log('No generated unit tests yet.')\"",
	"test:contracts":
		"bun -e \"console.log('No generated app contract tests yet.')\"",
	"test:integration":
		"bun -e \"console.log('No generated integration tests yet.')\"",
	"test:e2e:sandbox":
		"bun -e \"console.log('No generated sandbox e2e tests yet.')\"",
	check: "bun run lint && bun run format:check && bun run typecheck",
} as const;

function readSourceAppPackageJson() {
	return JSON.parse(
		readFileSync(
			path.join(resolveRepoRootPath(), "apps/web/package.json"),
			"utf8",
		),
	) as {
		name?: string;
		version?: string;
		packageManager?: string;
		dependencies?: Record<string, string>;
		devDependencies?: Record<string, string>;
	};
}

function readTemplateSourceFile(relativePath: string) {
	return readFileSync(
		path.join(
			resolveRepoRootPath(),
			"templates/starter-app/source",
			relativePath,
		),
		"utf8",
	);
}

function replaceRequired(
	source: string,
	target: string,
	replacement: string,
	sourcePath: string,
) {
	if (!source.includes(target)) {
		throw new Error(
			`Template source drifted while generating ${sourcePath}: missing expected segment.`,
		);
	}

	return source.replace(target, replacement);
}

function renderGeneratedAppPackageJson() {
	const sourcePackageJson = readSourceAppPackageJson();
	const appPackageJson = {
		name: sourcePackageJson.name ?? "ship-by-sunday-site",
		version: sourcePackageJson.version ?? "0.1.0",
		private: true,
		packageManager: sourcePackageJson.packageManager ?? "bun@1.3.5",
		scripts: generatedTemplateAppScripts,
		dependencies: sourcePackageJson.dependencies ?? {},
		devDependencies: sourcePackageJson.devDependencies ?? {},
	};

	return `${JSON.stringify(appPackageJson, null, 2)}\n`;
}

function renderGeneratedAppReadme(
	projectDefinition: CanonicalProjectDefinition,
) {
	const { facts } = projectDefinition;

	return [
		`# ${facts.product_name} Web App`,
		"",
		"This is the generated Next.js app for the customer repo. It starts from the pinned Ship by Sunday Starter template source under `templates/starter-app/source`, mapped into `apps/web/`, with small generated overlays for product facts, monorepo scripts, and no-provider-safe setup.",
		"",
		"## No-Provider Contract",
		"",
		"The generated repo must install, lint, typecheck, and expose dev commands before Clerk, Convex, Stripe, Resend, Sentry, PostHog, or OpenAI are configured. Provider-specific route handlers and live webhook code are intentionally not active in this first materialized subset; generated setup ExecPlans should activate them deliberately.",
		"",
		"## Main Edit Points",
		"",
		"- `config/product.ts`",
		"- `config/generated-design-system.ts` for the T3 Code visual contract",
		"- `src/app/(marketing)/page.tsx`",
		"- `src/app/(app)/chat/page.tsx`",
		"- `convex/`",
		"",
		"## Commands",
		"",
		"Run app commands from `apps/web/` or through the root workspace scripts.",
		"",
		"- `bun run dev` starts the generated Next.js app.",
		"- `bun run check` runs lint, format check, and the generated app typecheck/build contract.",
		"- `bun run dev:convex` and `bun run dev:stripe` are no-op placeholders until those providers are configured.",
		"",
		"Template provenance for this app is recorded at `docs/facts/template-source.json`.",
		"",
	].join("\n");
}

function renderProductConfig(projectDefinition: CanonicalProjectDefinition) {
	const { facts } = projectDefinition;
	const productConfig = {
		name: facts.product_name,
		promise: facts.outcome_statement,
		metadataDescription: facts.product_summary,
		priceDisplay: facts.price_display,
		priceUsdCents: facts.price_usd_cents,
		currency: facts.currency,
		primaryCta: facts.primary_cta,
		supportEmail: facts.support_email,
		domain: facts.domain,
	};
	const productContent = {
		productName: facts.product_name,
		headline: facts.outcome_statement,
		subheadline: facts.product_summary,
		primaryCta: facts.primary_cta,
		primaryUser: facts.primary_user,
		problemStatement: facts.problem_statement,
		successLooksLike: facts.success_looks_like,
		problemUrgency: facts.problem_urgency,
		coreFlow: facts.core_flow,
		scopeIn: facts.scope_in,
		scopeOut: facts.scope_out,
		proofStrategy: facts.proof_strategy,
		sectionNarrative: facts.section_narrative,
	};

	return [
		`export const productConfig = ${JSON.stringify(productConfig, null, 2)} as const;`,
		"",
		`export const productContent = ${JSON.stringify(productContent, null, 2)} as const;`,
		"",
		"export const generatedProductConfig = productConfig;",
		"export const generatedProductContent = productContent;",
		"",
	].join("\n");
}

function renderGeneratedRootLayout() {
	const sourcePath = "src/app/layout.tsx";
	let source = readTemplateSourceFile(sourcePath);

	source = replaceRequired(
		source,
		'import { clientEnv } from "@/lib/env/client";',
		[
			'import { productConfig } from "@/config/product";',
			'import { productHomeUrl } from "@/lib/app/links";',
		].join("\n"),
		sourcePath,
	);
	source = replaceRequired(
		source,
		[
			"void clientEnv;",
			"",
			"export const metadata: Metadata = {",
			"  metadataBase: new URL(clientEnv.NEXT_PUBLIC_APP_URL),",
			"  title: {",
			'    default: "Northstar",',
			'    template: "%s | Northstar",',
			"  },",
			"  description:",
			'    "Northstar gives small teams one calm workspace for client work, billing, and updates.",',
			"};",
		].join("\n"),
		[
			"const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;",
			"",
			"export const metadata: Metadata = {",
			"  metadataBase: new URL(productHomeUrl),",
			"  title: {",
			"    default: productConfig.name,",
			"    template: `%s | ${productConfig.name}`,",
			"  },",
			"  description: productConfig.metadataDescription,",
			"};",
		].join("\n"),
		sourcePath,
	);
	source = replaceRequired(
		source,
		[
			'      <body className="min-h-screen bg-background font-sans text-foreground antialiased">',
			'        <ClerkProvider afterSignOutUrl="/">',
			"          <AppProviders>{children}</AppProviders>",
			"        </ClerkProvider>",
			"      </body>",
		].join("\n"),
		[
			'      <body className="min-h-screen bg-background font-sans text-foreground antialiased">',
			"        {clerkPublishableKey ? (",
			"          <ClerkProvider",
			'            afterSignOutUrl="/"',
			"            publishableKey={clerkPublishableKey}",
			"          >",
			"            <AppProviders>{children}</AppProviders>",
			"          </ClerkProvider>",
			"        ) : (",
			"          <AppProviders>{children}</AppProviders>",
			"        )}",
			"      </body>",
		].join("\n"),
		sourcePath,
	);

	return source;
}

function renderGeneratedProxy() {
	return [
		'import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";',
		'import { NextResponse, type NextProxy } from "next/server";',
		"",
		"const clerkProxyConfigured = Boolean(",
		"\tprocess.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY,",
		");",
		"",
		"const isProtectedRoute = createRouteMatcher([",
		'\t"/dashboard(.*)",',
		'\t"/chat(.*)",',
		'\t"/billing(.*)",',
		'\t"/api/billing(.*)",',
		'\t"/api/email/test(.*)",',
		'\t"/api/debug/sentry(.*)",',
		"]);",
		"",
		"const clerkProxy = clerkMiddleware(async (auth, request) => {",
		"\tif (isProtectedRoute(request)) {",
		"\t\tawait auth.protect();",
		"\t}",
		"});",
		"",
		"const generatedProxy: NextProxy = (request, event) => {",
		"\tif (!clerkProxyConfigured) {",
		"\t\treturn NextResponse.next();",
		"\t}",
		"",
		"\treturn clerkProxy(request, event);",
		"};",
		"",
		"export default generatedProxy;",
		"",
		"export const config = {",
		"\tmatcher: [",
		'\t\t"/((?!_next|[^?]*\\\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",',
		'\t\t"/(api|trpc)(.*)",',
		"\t],",
		"};",
		"",
	].join("\n");
}

function renderGeneratedAppProviders() {
	const sourcePath = "src/components/providers/app-providers.tsx";
	let source = readTemplateSourceFile(sourcePath);

	source = replaceRequired(
		source,
		'import { ConvexProviderWithClerk } from "convex/react-clerk";',
		[
			'import { ConvexReactClient } from "convex/react";',
			'import { ConvexProviderWithClerk } from "convex/react-clerk";',
		].join("\n"),
		sourcePath,
	);
	source = replaceRequired(
		source,
		'import { convex } from "@/lib/convex/client";\n',
		"",
		sourcePath,
	);
	source = replaceRequired(
		source,
		'import { getClientAnalyticsEnv } from "@/lib/env/client";',
		[
			'import { getClientAnalyticsEnv } from "@/lib/env/client";',
			"",
			"const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;",
			"const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;",
			"const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;",
		].join("\n"),
		sourcePath,
	);
	source = replaceRequired(
		source,
		[
			"  return (",
			"    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>",
			"      <PostHogProvider client={posthog}>",
			"        <UserBootstrapProvider>",
			"          {children}",
			'          <Toaster richColors position="top-right" />',
			"        </UserBootstrapProvider>",
			"      </PostHogProvider>",
			"    </ConvexProviderWithClerk>",
			"  );",
		].join("\n"),
		[
			"  const app = (",
			"    <PostHogProvider client={posthog}>",
			"      {convex && clerkPublishableKey ? (",
			"        <UserBootstrapProvider>{children}</UserBootstrapProvider>",
			"      ) : (",
			"        children",
			"      )}",
			'      <Toaster richColors position="top-right" />',
			"    </PostHogProvider>",
			"  );",
			"",
			"  if (!convex || !clerkPublishableKey) {",
			"    return app;",
			"  }",
			"",
			"  return (",
			"    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>",
			"      {app}",
			"    </ConvexProviderWithClerk>",
			"  );",
		].join("\n"),
		sourcePath,
	);

	return source;
}

function renderGeneratedConvexReadyGate() {
	const sourcePath = "src/components/app/convex-ready-gate.tsx";
	let source = readTemplateSourceFile(sourcePath);

	source = replaceRequired(
		source,
		'import { Card, CardContent } from "@/components/ui/card";',
		[
			'import { Card, CardContent } from "@/components/ui/card";',
			"",
			"const providersConfigured = Boolean(",
			"  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&",
			"    process.env.NEXT_PUBLIC_CONVEX_URL,",
			");",
		].join("\n"),
		sourcePath,
	);
	source = replaceRequired(
		source,
		[
			"export function ConvexReadyGate({",
			"  children,",
			'  loadingMessage = "Preparing your workspace...",',
			"}: {",
			"  children: ReactNode;",
			"  loadingMessage?: string;",
			"}) {",
		].join("\n"),
		[
			"export function ConvexReadyGate({",
			"  children,",
			'  loadingMessage = "Preparing your workspace...",',
			"}: {",
			"  children: ReactNode;",
			"  loadingMessage?: string;",
			"}) {",
			"  if (!providersConfigured) {",
			"    return <ProviderSetupNotice />;",
			"  }",
			"",
			"  return (",
			"    <ProviderBackedConvexReadyGate loadingMessage={loadingMessage}>",
			"      {children}",
			"    </ProviderBackedConvexReadyGate>",
			"  );",
			"}",
			"",
			"function ProviderSetupNotice() {",
			"  return (",
			"    <Card>",
			'      <CardContent className="py-10 text-sm leading-6 text-muted-foreground">',
			"        Clerk and Convex are not configured for this environment yet. The",
			"        template app can build and run without providers; add the public",
			"        provider environment values before using protected workspace data.",
			"      </CardContent>",
			"    </Card>",
			"  );",
			"}",
			"",
			"function ProviderBackedConvexReadyGate({",
			"  children,",
			'  loadingMessage = "Preparing your workspace...",',
			"}: {",
			"  children: ReactNode;",
			"  loadingMessage?: string;",
			"}) {",
		].join("\n"),
		sourcePath,
	);

	return source;
}

function renderGeneratedBillingPanel() {
	const sourcePath = "src/components/app/billing-panel.tsx";
	let source = readTemplateSourceFile(sourcePath);

	source = replaceRequired(
		source,
		'import { Button } from "@/components/ui/button";\n',
		"",
		sourcePath,
	);
	source = replaceRequired(
		source,
		[
			"          ) : canManageBilling ? (",
			"            <>",
			'              {billingStatus === "unconfigured" ? (',
			'                <p className="text-sm leading-6 text-muted-foreground">',
			"                  Billing actions stay disabled until Stripe is configured for this",
			"                  environment.",
			"                </p>",
			"              ) : null}",
			'              <form action="/api/billing/checkout" method="post">',
			'                <Button className="w-full" type="submit">',
			"                  Start checkout",
			"                </Button>",
			"              </form>",
			'              <form action="/api/billing/portal" method="post">',
			'                <Button className="w-full" type="submit" variant="outline">',
			"                  Open billing portal",
			"                </Button>",
			"              </form>",
			"            </>",
		].join("\n"),
		[
			"          ) : canManageBilling ? (",
			"            <>",
			'              {billingStatus === "unconfigured" ? (',
			'                <p className="text-sm leading-6 text-muted-foreground">',
			"                  Billing environment values are incomplete for this",
			"                  environment.",
			"                </p>",
			"              ) : null}",
			'              <p className="text-sm leading-6 text-muted-foreground">',
			"                Checkout and Customer Portal actions stay disabled in the",
			"                generated starter until the billing setup slice materializes",
			"                route handlers.",
			"              </p>",
			"            </>",
		].join("\n"),
		sourcePath,
	);

	return source;
}

function renderGeneratedClientEnv() {
	const sourcePath = "src/lib/env/client.ts";
	const source = readTemplateSourceFile(sourcePath);

	return replaceRequired(
		source,
		[
			"export const clientEnv = parseClientEnv({",
			"  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,",
			"  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:",
			"    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,",
			"  NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL,",
			"});",
		].join("\n"),
		[
			"export const clientEnv = {",
			"  NEXT_PUBLIC_APP_URL: resolveAppUrl(process.env.NEXT_PUBLIC_APP_URL),",
			"  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:",
			'    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "pk_test_provider_not_configured",',
			"  NEXT_PUBLIC_CONVEX_URL:",
			'    process.env.NEXT_PUBLIC_CONVEX_URL ?? "https://provider-not-configured.convex.cloud",',
			"};",
		].join("\n"),
		sourcePath,
	);
}

function renderGeneratedPublicAuthControls() {
	return [
		'import Link from "next/link";',
		"",
		'import { Button } from "@/components/ui/button";',
		"",
		"export function PublicAuthControls() {",
		"\treturn (",
		'\t\t<div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center sm:justify-end">',
		'\t\t\t<Button asChild variant="ghost" className="h-9 px-3 sm:h-10 sm:px-4">',
		'\t\t\t\t<Link href="/sign-in">Sign in</Link>',
		"\t\t\t</Button>",
		'\t\t\t<Button asChild className="h-9 px-3.5 sm:h-10 sm:px-4">',
		'\t\t\t\t<Link href="/sign-up">Get started</Link>',
		"\t\t\t</Button>",
		"\t\t</div>",
		"\t);",
		"}",
		"",
	].join("\n");
}

function renderGeneratedUserMenuButton() {
	return [
		'"use client";',
		"",
		"export function UserMenuButton() {",
		"\treturn (",
		'\t\t<div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">',
		"\t\t\tA",
		"\t\t</div>",
		"\t);",
		"}",
		"",
	].join("\n");
}

function renderGeneratedBrandLockup() {
	const sourcePath = "src/components/layout/brand-lockup.tsx";
	const source = readTemplateSourceFile(sourcePath);

	return replaceRequired(
		source,
		'import { cn } from "@/lib/utils";',
		[
			'import { productConfig } from "@/config/product";',
			'import { cn } from "@/lib/utils";',
		].join("\n"),
		sourcePath,
	).replace('title = "Northstar"', "title = productConfig.name");
}

function renderGeneratedMarketingLayout() {
	return readTemplateSourceFile("src/app/(marketing)/layout.tsx")
		.replaceAll("Why Northstar", "Why it works")
		.replaceAll("why-northstar", "workflow");
}

function renderGeneratedMarketingPage() {
	return [
		'import Link from "next/link";',
		'import { CheckCircle2, MessageSquare, ShieldCheck } from "lucide-react";',
		"",
		'import { productConfig, productContent } from "@/config/product";',
		'import { Button } from "@/components/ui/button";',
		'import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";',
		"",
		"const proofCards = [",
		"  {",
		'    title: "Product promise",',
		"    body: productContent.successLooksLike,",
		"    icon: CheckCircle2,",
		"  },",
		"  {",
		'    title: "Core workflow",',
		"    body: productContent.coreFlow.join(' -> '),",
		"    icon: MessageSquare,",
		"  },",
		"  {",
		'    title: "Proof strategy",',
		"    body: productContent.proofStrategy,",
		"    icon: ShieldCheck,",
		"  },",
		"];",
		"",
		"export default function MarketingHomePage() {",
		"  return (",
		'    <main id="main-content" className="flex flex-col gap-12 px-4 py-8 sm:px-6 lg:px-12 lg:py-12 xl:px-16 2xl:px-20">',
		'      <section id="hero" className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,32rem)] lg:items-start">',
		'        <div className="max-w-3xl space-y-6">',
		'          <p className="text-sm font-medium text-muted-foreground">',
		"            {productContent.primaryUser}",
		"          </p>",
		'          <div className="space-y-4">',
		'            <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-6xl">',
		"              {productContent.headline}",
		"            </h1>",
		'            <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">',
		"              {productContent.subheadline}",
		"            </p>",
		"          </div>",
		'          <div className="flex flex-col gap-3 sm:flex-row">',
		'            <Button asChild size="lg">',
		'              <Link href="/sign-up">{productConfig.primaryCta}</Link>',
		"            </Button>",
		'            <Button asChild size="lg" variant="outline">',
		'              <Link href="#workflow">View workflow</Link>',
		"            </Button>",
		"          </div>",
		"        </div>",
		"",
		'        <Card className="overflow-hidden">',
		'          <CardHeader className="border-b">',
		'            <p className="text-sm font-medium text-muted-foreground">',
		"              {productConfig.name} workspace",
		"            </p>",
		'            <CardTitle className="text-2xl">',
		"              {productContent.problemStatement}",
		"            </CardTitle>",
		"          </CardHeader>",
		'          <CardContent className="space-y-3 pt-4">',
		"            {productContent.coreFlow.map((step, index) => (",
		"              <div",
		"                key={step}",
		'                className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3"',
		"              >",
		'                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">',
		"                  {index + 1}",
		"                </span>",
		'                <p className="text-sm leading-6 text-foreground">{step}</p>',
		"              </div>",
		"            ))}",
		"          </CardContent>",
		"        </Card>",
		"      </section>",
		"",
		'      <section id="features" className="grid gap-4 md:grid-cols-3">',
		"        {proofCards.map((card) => {",
		"          const Icon = card.icon;",
		"",
		"          return (",
		"            <Card key={card.title}>",
		'              <CardHeader className="gap-3">',
		'                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">',
		'                  <Icon className="h-4 w-4" />',
		"                </div>",
		"                <CardTitle>{card.title}</CardTitle>",
		"              </CardHeader>",
		'              <CardContent className="pt-0">',
		'                <p className="text-sm leading-6 text-muted-foreground">',
		"                  {card.body}",
		"                </p>",
		"              </CardContent>",
		"            </Card>",
		"          );",
		"        })}",
		"      </section>",
		"",
		'      <section id="workflow" className="grid gap-8 border-t pt-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">',
		'        <div className="space-y-3">',
		'          <p className="text-sm font-medium text-muted-foreground">Why it works</p>',
		'          <h2 className="text-3xl font-semibold text-foreground">',
		"            {productContent.sectionNarrative}",
		"          </h2>",
		'          <p className="text-sm leading-6 text-muted-foreground">',
		"            {productContent.problemUrgency}",
		"          </p>",
		"        </div>",
		'        <div className="grid gap-3">',
		"          {productContent.scopeIn.map((item) => (",
		'            <div key={item} className="rounded-lg border bg-card p-4">',
		'              <p className="text-sm font-medium text-foreground">{item}</p>',
		"            </div>",
		"          ))}",
		"        </div>",
		"      </section>",
		"",
		'      <section id="pricing" className="rounded-lg border bg-card p-6">',
		'        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">',
		'          <div className="space-y-2">',
		'            <p className="text-sm font-medium text-muted-foreground">Pricing</p>',
		'            <h2 className="text-3xl font-semibold text-foreground">',
		"              {productConfig.priceDisplay}",
		"            </h2>",
		'            <p className="text-sm leading-6 text-muted-foreground">',
		"              {productContent.successLooksLike}",
		"            </p>",
		"          </div>",
		'          <Button asChild size="lg">',
		'            <Link href="/sign-up">Get started</Link>',
		"          </Button>",
		"        </div>",
		"      </section>",
		"    </main>",
		"  );",
		"}",
		"",
	].join("\n");
}

function renderGeneratedAuthLayout() {
	return readTemplateSourceFile("src/app/(auth)/layout.tsx")
		.replaceAll("Why Northstar", "Why it works")
		.replaceAll("why-northstar", "workflow");
}

function renderMissingClerkSetupComponent(message: string) {
	return [
		"function MissingClerkSetup() {",
		"  return (",
		'    <div className="rounded-lg border bg-card p-6 text-sm leading-6 text-muted-foreground">',
		`      ${message}`,
		"    </div>",
		"  );",
		"}",
	].join("\n");
}

function renderGeneratedSignInPage() {
	const sourcePath = "src/app/(auth)/sign-in/[[...sign-in]]/page.tsx";
	let source = readTemplateSourceFile(sourcePath);

	source = replaceRequired(
		source,
		'import { AuthShell } from "@/components/layout/auth-shell";',
		[
			'import { AuthShell } from "@/components/layout/auth-shell";',
			'import { productConfig } from "@/config/product";',
			"",
			renderMissingClerkSetupComponent(
				"Clerk is not configured yet. Add the Clerk public key when this product is ready for live authentication.",
			),
		].join("\n"),
		sourcePath,
	);
	source = replaceRequired(
		source,
		"export default function SignInPage() {\n  return (",
		[
			"export default function SignInPage() {",
			"  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);",
			"",
			"  return (",
		].join("\n"),
		sourcePath,
	);
	source = replaceRequired(
		source,
		'      eyebrow="Northstar access"',
		"      eyebrow={`${productConfig.name} access`}",
		sourcePath,
	);
	source = replaceRequired(
		source,
		'      description="Sign in to reopen your workspace, check billing details, and keep your team working from the same current context."',
		"      description={`Sign in to continue working on ${productConfig.name}.`}",
		sourcePath,
	);
	source = replaceRequired(
		source,
		"      <SignIn />",
		"      {clerkConfigured ? <SignIn /> : <MissingClerkSetup />}",
		sourcePath,
	);

	return source;
}

function renderGeneratedSignUpPage() {
	const sourcePath = "src/app/(auth)/sign-up/[[...sign-up]]/page.tsx";
	let source = readTemplateSourceFile(sourcePath);

	source = replaceRequired(
		source,
		'import { AuthShell } from "@/components/layout/auth-shell";',
		[
			'import { AuthShell } from "@/components/layout/auth-shell";',
			'import { productConfig, productContent } from "@/config/product";',
			"",
			renderMissingClerkSetupComponent(
				"Clerk is not configured yet. Add the Clerk public key when this product is ready for live sign-up.",
			),
		].join("\n"),
		sourcePath,
	);
	source = replaceRequired(
		source,
		"export default function SignUpPage() {\n  return (",
		[
			"export default function SignUpPage() {",
			"  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);",
			"",
			"  return (",
		].join("\n"),
		sourcePath,
	);
	source = replaceRequired(
		source,
		'      eyebrow="Set up Northstar"',
		"      eyebrow={`Set up ${productConfig.name}`}",
		sourcePath,
	);
	source = replaceRequired(
		source,
		'      description="Start with a clean workspace for your team so work, customer updates, and billing visibility all live in one place from day one."',
		"      description={productContent.subheadline}",
		sourcePath,
	);
	source = replaceRequired(
		source,
		"      <SignUp />",
		"      {clerkConfigured ? <SignUp /> : <MissingClerkSetup />}",
		sourcePath,
	);

	return source;
}

function renderGeneratedPublicFooter() {
	return [
		'import Link from "next/link";',
		"",
		'import { productConfig, productContent } from "@/config/product";',
		'import { BrandLockup } from "@/components/layout/brand-lockup";',
		"",
		"const sectionLinks = [",
		'  { label: "Features", href: "#features" },',
		'  { label: "Why it works", href: "#workflow" },',
		'  { label: "Pricing", href: "#pricing" },',
		"];",
		"",
		"const authLinks = [",
		'  { label: "Sign in", href: "/sign-in" },',
		'  { label: "Get started", href: "/sign-up" },',
		"];",
		"",
		"export function PublicFooter() {",
		"  return (",
		'    <footer className="border-t bg-background">',
		'      <div className="grid w-full gap-8 px-6 py-10 sm:px-8 lg:grid-cols-[minmax(0,1.35fr)_repeat(2,minmax(0,220px))] lg:px-12 xl:px-16 2xl:px-20">',
		'        <div className="space-y-4">',
		'          <BrandLockup href="/" title={productConfig.name} />',
		'          <p className="max-w-sm text-sm leading-6 text-muted-foreground">',
		"            {productContent.subheadline}",
		"          </p>",
		'          <p className="text-sm text-muted-foreground">',
		"            Generated from your Ship by Sunday Codebase questionnaire for {productConfig.name}.",
		"          </p>",
		"        </div>",
		'        <FooterLinkGroup title="Sections" links={sectionLinks} />',
		'        <FooterLinkGroup title="Access" links={authLinks} />',
		"      </div>",
		"    </footer>",
		"  );",
		"}",
		"",
		"function FooterLinkGroup({",
		"  title,",
		"  links,",
		"}: {",
		"  title: string;",
		"  links: { label: string; href: string }[];",
		"}) {",
		"  return (",
		'    <div className="space-y-4">',
		'      <p className="text-xs font-semibold text-muted-foreground">{title}</p>',
		'      <nav aria-label={title} className="flex flex-col gap-3">',
		"        {links.map((link) => (",
		"          <Link",
		"            key={link.href}",
		"            href={link.href}",
		'            className="rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"',
		"          >",
		"            {link.label}",
		"          </Link>",
		"        ))}",
		"      </nav>",
		"    </div>",
		"  );",
		"}",
		"",
	].join("\n");
}

function renderGeneratedAppLinks() {
	return [
		'import { productConfig } from "@/config/product";',
		"",
		"function normalizeProductUrl(domain: string) {",
		'\tif (domain.startsWith("http://") || domain.startsWith("https://")) {',
		"\t\treturn domain;",
		"\t}",
		"",
		"\treturn `https://${domain}`;",
		"}",
		"",
		"export const productHomeUrl = normalizeProductUrl(productConfig.domain);",
		"export const templateRepoUrl = productHomeUrl;",
		"",
	].join("\n");
}

function renderNextConfig() {
	return [
		'import type { NextConfig } from "next";',
		"",
		"const nextConfig: NextConfig = {};",
		"",
		"export default nextConfig;",
		"",
	].join("\n");
}

function renderGlobalError() {
	return [
		'"use client";',
		"",
		'import { Button } from "@/components/ui/button";',
		"",
		"export default function GlobalError({",
		"\terror,",
		"\treset,",
		"}: {",
		"\terror: Error & { digest?: string };",
		"\treset: () => void;",
		"}) {",
		"\treturn (",
		'\t\t<html lang="en">',
		'\t\t\t<body className="flex min-h-screen items-center justify-center bg-background px-6 font-sans text-foreground">',
		'\t\t\t\t<main className="max-w-md space-y-4 rounded-lg border bg-card p-6 text-center text-card-foreground">',
		'\t\t\t\t\t<h1 className="text-2xl font-semibold">Something went wrong</h1>',
		'\t\t\t\t\t<p className="text-sm leading-6 text-muted-foreground">{error.message}</p>',
		'\t\t\t\t\t<Button onClick={reset} type="button">Try again</Button>',
		"\t\t\t\t</main>",
		"\t\t\t</body>",
		"\t\t</html>",
		"\t);",
		"}",
		"",
	].join("\n");
}

function renderGeneratedStripeClient() {
	const sourcePath = "src/lib/billing/stripe.ts";
	const source = readTemplateSourceFile(sourcePath);

	return replaceRequired(
		source,
		'import { getBillingEnv } from "@/lib/env/server";',
		[
			'import { productConfig } from "@/config/product";',
			'import { getBillingEnv } from "@/lib/env/server";',
		].join("\n"),
		sourcePath,
	).replace(
		'name: "next-js-convex-clerk-stripe-template"',
		"name: productConfig.name",
	);
}

function renderGeneratedAppTsConfig() {
	return `${JSON.stringify(
		{
			compilerOptions: {
				target: "ES2017",
				lib: ["dom", "dom.iterable", "esnext"],
				allowJs: true,
				skipLibCheck: true,
				strict: true,
				noEmit: true,
				esModuleInterop: true,
				module: "esnext",
				moduleResolution: "bundler",
				resolveJsonModule: true,
				isolatedModules: true,
				jsx: "react-jsx",
				incremental: true,
				plugins: [{ name: "next" }],
				baseUrl: ".",
				paths: {
					"@/*": ["./*", "./src/*"],
					"@convex/*": ["./convex/*"],
				},
			},
			include: [
				"next-env.d.ts",
				"src/**/*.ts",
				"src/**/*.tsx",
				"convex/**/*.ts",
				"convex/**/*.tsx",
				"**/*.mts",
				"*.ts",
				"*.tsx",
				"config/**/*.ts",
				".next/types/**/*.ts",
				".next/dev/types/**/*.ts",
			],
			exclude: ["node_modules"],
		},
		null,
		2,
	)}\n`;
}

function renderEmailSendStub() {
	return [
		'import type { ReactElement } from "react";',
		"",
		"export async function sendTransactionalEmail(_args: {",
		"\tto: string;",
		"\tsubject: string;",
		"\treact: ReactElement;",
		"}) {",
		"\treturn { skipped: true as const };",
		"}",
		"",
	].join("\n");
}

function renderWelcomeEmailStub() {
	return [
		'import type { ReactElement } from "react";',
		"",
		"export function buildWelcomeEmail(args: {",
		"\tname?: string | null;",
		"\tworkspaceName: string;",
		"}) {",
		"\treturn {",
		"\t\treact: null as unknown as ReactElement,",
		"\t\tsubject: `Your workspace ${args.workspaceName} is ready`,",
		"\t};",
		"}",
		"",
	].join("\n");
}

export function renderGeneratedTemplateAppFiles(
	projectDefinition: CanonicalProjectDefinition,
): RenderedCodebaseFile[] {
	return [
		{
			path: "apps/web/README.md",
			content: renderGeneratedAppReadme(projectDefinition),
		},
		{
			path: "apps/web/config/product.ts",
			content: renderProductConfig(projectDefinition),
		},
		{
			path: "apps/web/package.json",
			content: renderGeneratedAppPackageJson(),
		},
		{
			path: "apps/web/tsconfig.json",
			content: renderGeneratedAppTsConfig(),
		},
		{
			path: "apps/web/next.config.ts",
			content: renderNextConfig(),
		},
		{
			path: "apps/web/src/proxy.ts",
			content: renderGeneratedProxy(),
		},
		{
			path: "apps/web/src/app/layout.tsx",
			content: renderGeneratedRootLayout(),
		},
		{
			path: "apps/web/src/app/global-error.tsx",
			content: renderGlobalError(),
		},
		{
			path: "apps/web/src/app/(marketing)/layout.tsx",
			content: renderGeneratedMarketingLayout(),
		},
		{
			path: "apps/web/src/app/(marketing)/page.tsx",
			content: renderGeneratedMarketingPage(),
		},
		{
			path: "apps/web/src/app/(auth)/layout.tsx",
			content: renderGeneratedAuthLayout(),
		},
		{
			path: "apps/web/src/app/(auth)/sign-in/[[...sign-in]]/page.tsx",
			content: renderGeneratedSignInPage(),
		},
		{
			path: "apps/web/src/app/(auth)/sign-up/[[...sign-up]]/page.tsx",
			content: renderGeneratedSignUpPage(),
		},
		{
			path: "apps/web/src/components/layout/brand-lockup.tsx",
			content: renderGeneratedBrandLockup(),
		},
		{
			path: "apps/web/src/components/layout/public-auth-controls.tsx",
			content: renderGeneratedPublicAuthControls(),
		},
		{
			path: "apps/web/src/components/layout/public-footer.tsx",
			content: renderGeneratedPublicFooter(),
		},
		{
			path: "apps/web/src/components/layout/user-menu-button.tsx",
			content: renderGeneratedUserMenuButton(),
		},
		{
			path: "apps/web/src/components/app/convex-ready-gate.tsx",
			content: renderGeneratedConvexReadyGate(),
		},
		{
			path: "apps/web/src/components/app/billing-panel.tsx",
			content: renderGeneratedBillingPanel(),
		},
		{
			path: "apps/web/src/components/providers/app-providers.tsx",
			content: renderGeneratedAppProviders(),
		},
		{
			path: "apps/web/src/lib/app/links.ts",
			content: renderGeneratedAppLinks(),
		},
		{
			path: "apps/web/src/lib/billing/stripe.ts",
			content: renderGeneratedStripeClient(),
		},
		{
			path: "apps/web/src/lib/email/send.ts",
			content: renderEmailSendStub(),
		},
		{
			path: "apps/web/src/lib/email/welcome.tsx",
			content: renderWelcomeEmailStub(),
		},
		{
			path: "apps/web/src/lib/env/client.ts",
			content: renderGeneratedClientEnv(),
		},
	];
}
