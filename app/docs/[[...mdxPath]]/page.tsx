import { importPage } from "nextra/pages";

import {
	generateDocsStaticParams,
	getDocsPageSegments,
} from "@/features/docs/server/page-paths";
import { useMDXComponents as getMDXComponents } from "@/mdx-components";

const Wrapper = getMDXComponents().wrapper;

export const generateStaticParams = generateDocsStaticParams;

export async function generateMetadata(props: {
	params: Promise<{ mdxPath?: string[] }>;
}) {
	const { mdxPath } = await props.params;
	const { metadata } = await importPage(getDocsPageSegments(mdxPath));
	return metadata;
}

export default async function DocsContentPage(props: {
	params: Promise<{ mdxPath?: string[] }>;
}) {
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
