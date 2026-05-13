import type { PublicContentHeading } from "@/app/_content/public-content-inventory";

export type BlogTocEntry = {
	id: string;
	depth: PublicContentHeading["depth"];
	label: string;
};

export function normalizeBlogToc(
	headings: PublicContentHeading[],
): BlogTocEntry[] {
	return headings
		.map((heading) => ({
			id: heading.id,
			depth: heading.depth,
			label: heading.text.trim(),
		}))
		.filter((heading) => heading.label.length > 0);
}
