import "server-only";

import type { Metadata } from "next";
import type { ComponentType } from "react";

import {
	getDocsContentEntries,
	type DocsContentEntry,
} from "@/app/_content/public-content-inventory";

type DocsMdxModule = {
	default: ComponentType<object>;
};

type DocsMdxModuleLoader = () => Promise<DocsMdxModule>;

export type DocsContentPageModel = {
	entry: DocsContentEntry;
	Content: ComponentType<object>;
};

const docsMdxModuleLoaders: Record<string, DocsMdxModuleLoader> = {
	"": () => import("@/content/docs/index.mdx") as Promise<DocsMdxModule>,
	"build-your-product": () =>
		import("@/content/docs/build-your-product.mdx") as Promise<DocsMdxModule>,
	"cleaning-vs-refactoring": () =>
		import("@/content/docs/cleaning-vs-refactoring.mdx") as Promise<DocsMdxModule>,
	"clerk-convex-auth": () =>
		import("@/content/docs/clerk-convex-auth.mdx") as Promise<DocsMdxModule>,
	commands: () =>
		import("@/content/docs/commands.mdx") as Promise<DocsMdxModule>,
	"configure-the-homepage": () =>
		import("@/content/docs/configure-the-homepage.mdx") as Promise<DocsMdxModule>,
	"customize-the-starter": () =>
		import("@/content/docs/customize-the-starter.mdx") as Promise<DocsMdxModule>,
	"debugging-with-logs-and-screenshots": () =>
		import("@/content/docs/debugging-with-logs-and-screenshots.mdx") as Promise<DocsMdxModule>,
	"deploy-to-vercel": () =>
		import("@/content/docs/deploy-to-vercel.mdx") as Promise<DocsMdxModule>,
	"environment-variables": () =>
		import("@/content/docs/environment-variables.mdx") as Promise<DocsMdxModule>,
	glossary: () =>
		import("@/content/docs/glossary.mdx") as Promise<DocsMdxModule>,
	"how-the-starter-works": () =>
		import("@/content/docs/how-the-starter-works.mdx") as Promise<DocsMdxModule>,
	"ide-and-terminal-basics": () =>
		import("@/content/docs/ide-and-terminal-basics.mdx") as Promise<DocsMdxModule>,
	"implement-the-first-protected-ux": () =>
		import("@/content/docs/implement-the-first-protected-ux.mdx") as Promise<DocsMdxModule>,
	"lay-of-the-land": () =>
		import("@/content/docs/lay-of-the-land.mdx") as Promise<DocsMdxModule>,
	"local-qa": () =>
		import("@/content/docs/local-qa.mdx") as Promise<DocsMdxModule>,
	"local-setup": () =>
		import("@/content/docs/local-setup.mdx") as Promise<DocsMdxModule>,
	"mcps-and-skills": () =>
		import("@/content/docs/mcps-and-skills.mdx") as Promise<DocsMdxModule>,
	"parallel-agents": () =>
		import("@/content/docs/parallel-agents.mdx") as Promise<DocsMdxModule>,
	"prompting-patterns": () =>
		import("@/content/docs/prompting-patterns.mdx") as Promise<DocsMdxModule>,
	"route-map": () =>
		import("@/content/docs/route-map.mdx") as Promise<DocsMdxModule>,
	"set-up-db-auth-and-payments": () =>
		import("@/content/docs/set-up-db-auth-and-payments.mdx") as Promise<DocsMdxModule>,
	"set-up-the-marketing-site": () =>
		import("@/content/docs/set-up-the-marketing-site.mdx") as Promise<DocsMdxModule>,
	"ship-live": () =>
		import("@/content/docs/ship-live.mdx") as Promise<DocsMdxModule>,
	"stripe-checkout-webhook": () =>
		import("@/content/docs/stripe-checkout-webhook.mdx") as Promise<DocsMdxModule>,
	"test-the-buyer-journey": () =>
		import("@/content/docs/test-the-buyer-journey.mdx") as Promise<DocsMdxModule>,
	"the-build-loop": () =>
		import("@/content/docs/the-build-loop.mdx") as Promise<DocsMdxModule>,
	"troubleshooting/access": () =>
		import("@/content/docs/troubleshooting/access.mdx") as Promise<DocsMdxModule>,
	"troubleshooting/local-dev-issues": () =>
		import("@/content/docs/troubleshooting/local-dev-issues.mdx") as Promise<DocsMdxModule>,
	"troubleshooting/login-issues": () =>
		import("@/content/docs/troubleshooting/login-issues.mdx") as Promise<DocsMdxModule>,
	"troubleshooting/stripe-convex": () =>
		import("@/content/docs/troubleshooting/stripe-convex.mdx") as Promise<DocsMdxModule>,
	"video-pipeline": () =>
		import("@/content/docs/video-pipeline.mdx") as Promise<DocsMdxModule>,
};

function createDocsSegmentsKey(segments: string[] = []) {
	return segments.join("/");
}

function createDocsEntryMetadata(entry: DocsContentEntry): Metadata {
	return {
		title: entry.title,
		description: entry.description,
	};
}

export async function getDocsContentEntry(mdxPath?: string[]) {
	const key = createDocsSegmentsKey(mdxPath);
	const entries = await getDocsContentEntries();

	return entries.find((entry) => createDocsSegmentsKey(entry.segments) === key);
}

export async function getDocsContentMetadata(mdxPath?: string[]) {
	const entry = await getDocsContentEntry(mdxPath);
	if (!entry) {
		return null;
	}

	return createDocsEntryMetadata(entry);
}

export async function getDocsContentPage(
	mdxPath?: string[],
): Promise<DocsContentPageModel | null> {
	const key = createDocsSegmentsKey(mdxPath);
	const loader = docsMdxModuleLoaders[key];
	const entry = await getDocsContentEntry(mdxPath);

	if (!loader || !entry) {
		return null;
	}

	const mdxModule = await loader();

	return {
		entry,
		Content: mdxModule.default,
	};
}

export function getDocsContentLoaderKeys() {
	return Object.keys(docsMdxModuleLoaders).sort();
}
