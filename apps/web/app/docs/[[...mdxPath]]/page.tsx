import { importPage } from "nextra/pages";

import { buildDocsMetadata } from "@/features/docs/lib/docs-metadata";
import {
	generateDocsStaticParams,
	getDocsPageSegments,
} from "@/features/docs/server/page-paths";
import { DocsModuleDisabledState } from "@/features/starter/components/docs-module-disabled-state";
import { isStarterModuleEnabled } from "@/features/starter/lib/starter-selectors";
import { useMDXComponents as getMDXComponents } from "@/mdx-components";

const Wrapper = getMDXComponents().wrapper;

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
	const { metadata } = await importPage(getDocsPageSegments(mdxPath));
	return buildDocsMetadata({ mdxPath, metadata });
}

export default async function DocsContentPage(props: {
	params: Promise<{ mdxPath?: string[] }>;
}) {
	if (!isStarterModuleEnabled("docs")) {
		return <DocsModuleDisabledState />;
	}

	const params = await props.params;
	const {
		default: MDXContent,
		toc,
		metadata,
		sourceCode,
	} = await importPage(getDocsPageSegments(params.mdxPath));

	return (
		<Wrapper metadata={metadata} sourceCode={sourceCode} toc={toc}>
			<MDXContent {...props} params={params} />
		</Wrapper>
	);
}
