import { notFound } from "next/navigation";

import { DocsArticle } from "@/app/docs/_components/docs-article";
import { buildDocsMetadata } from "@/app/docs/_lib/docs-metadata";
import { generateDocsStaticParams } from "@/app/docs/_lib/page-paths";
import {
	getDocsContentMetadata,
	getDocsContentPage,
} from "@/app/docs/_server/docs-content";
import { isStarterModuleEnabled } from "@/config/starter-selectors";

import { DocsModuleDisabledState } from "../_components/docs-module-disabled-state";

export const dynamicParams = true;

export async function generateStaticParams() {
	if (!isStarterModuleEnabled("docs")) {
		return [];
	}

	return generateDocsStaticParams();
}

export async function generateMetadata(props: {
	params: Promise<{ mdxPath?: string[] }>;
}) {
	if (!isStarterModuleEnabled("docs")) {
		return buildDocsMetadata({
			metadata: {
				title: "Docs disabled",
				description:
					"This starter instance has the public docs module turned off.",
				robots: {
					index: false,
					follow: false,
				},
			},
		});
	}

	const { mdxPath } = await props.params;
	const metadata = await getDocsContentMetadata(mdxPath);
	if (!metadata) {
		notFound();
	}

	return buildDocsMetadata({ mdxPath, metadata });
}

export default async function DocsContentPage(props: {
	params: Promise<{ mdxPath?: string[] }>;
}) {
	if (!isStarterModuleEnabled("docs")) {
		return <DocsModuleDisabledState />;
	}

	const params = await props.params;
	const page = await getDocsContentPage(params.mdxPath);
	if (!page) {
		notFound();
	}

	const { Content, entry } = page;

	return (
		<DocsArticle entry={entry}>
			<Content />
		</DocsArticle>
	);
}
