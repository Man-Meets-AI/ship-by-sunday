import { isValidElement, type ReactNode } from "react";

import type { Heading } from "nextra";

export type BlogTocEntry = {
	id: string;
	depth: Heading["depth"];
	label: string;
};

function getNodeText(node: ReactNode): string {
	if (typeof node === "string" || typeof node === "number") {
		return String(node);
	}

	if (Array.isArray(node)) {
		return node.map(getNodeText).join("");
	}

	if (isValidElement<{ children?: ReactNode }>(node)) {
		return getNodeText(node.props.children);
	}

	return "";
}

export function normalizeBlogToc(toc: Heading[]): BlogTocEntry[] {
	return toc
		.map((heading) => ({
			id: heading.id,
			depth: heading.depth,
			label: getNodeText(heading.value).trim(),
		}))
		.filter((heading) => heading.label.length > 0);
}
