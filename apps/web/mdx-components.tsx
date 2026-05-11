import type {
	ComponentPropsWithoutRef,
	ComponentType,
	ReactElement,
	ReactNode,
} from "react";
import { createElement } from "react";
import Link from "next/link";

import { createPublicContentHeadingId } from "@/app/_content/public-content-heading-ids";

type MdxComponentMap = Record<string, ComponentType<object>>;

function getTextFromNode(node: ReactNode): string {
	if (typeof node === "string" || typeof node === "number") {
		return String(node);
	}
	if (Array.isArray(node)) {
		return node.map(getTextFromNode).join("");
	}
	if (
		node &&
		typeof node === "object" &&
		"props" in node &&
		typeof node.props === "object" &&
		node.props &&
		"children" in node.props
	) {
		return getTextFromNode(node.props.children as ReactNode);
	}

	return "";
}

function createHeadingComponent(tagName: "h2" | "h3" | "h4") {
	return function Heading({
		children,
		id,
		...props
	}: ComponentPropsWithoutRef<"h2">): ReactElement {
		const headingId =
			typeof id === "string" && id.trim() !== ""
				? id
				: createPublicContentHeadingId(getTextFromNode(children));

		return createElement(
			tagName,
			{ ...props, id: headingId || undefined },
			children,
		);
	};
}

const mdxComponents = {
	a: function MdxLink({
		href = "",
		children,
		...props
	}: ComponentPropsWithoutRef<"a">) {
		if (href.startsWith("/")) {
			return (
				<Link href={href} {...props}>
					{children}
				</Link>
			);
		}

		return (
			<a href={href} {...props}>
				{children}
			</a>
		);
	},
	h2: createHeadingComponent("h2"),
	h3: createHeadingComponent("h3"),
	h4: createHeadingComponent("h4"),
};

export function useMDXComponents(
	components?: MdxComponentMap,
): MdxComponentMap {
	return {
		...mdxComponents,
		...components,
	};
}
