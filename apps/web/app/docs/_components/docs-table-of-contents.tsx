import type { PublicContentHeading } from "@/app/_content/public-content-inventory";

export function DocsTableOfContents({
	headings,
}: {
	headings: PublicContentHeading[];
}) {
	if (headings.length === 0) {
		return null;
	}

	return (
		<nav className="sbs-docs-toc" aria-label="On this page">
			<p className="sbs-docs-toc-title">On this page</p>
			<ol>
				{headings.map((heading) => (
					<li
						key={heading.id}
						className={`sbs-docs-toc-depth-${heading.depth}`}
					>
						<a href={`#${heading.id}`}>{heading.text}</a>
					</li>
				))}
			</ol>
		</nav>
	);
}
