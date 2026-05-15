import type { ReactNode } from "react";

import type { DocsContentEntry } from "@/app/_content/public-content-inventory";
import { DocsTableOfContents } from "@/app/(marketing)/docs/_components/docs-table-of-contents";

export function DocsArticle({
	entry,
	children,
}: {
	entry: DocsContentEntry;
	children: ReactNode;
}) {
	return (
		<div className="sbs-docs-page">
			<article
				className="sbs-docs-article sbs-docs-prose"
				aria-label={entry.title}
			>
				{children}
			</article>
			<DocsTableOfContents headings={entry.headings} />
		</div>
	);
}
