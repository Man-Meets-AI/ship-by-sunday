import type { MDXComponents } from "nextra/mdx-components";
import { useMDXComponents as getThemeComponents } from "nextra-theme-docs";

export function useMDXComponents(components?: MDXComponents) {
	return components ? getThemeComponents(components) : getThemeComponents();
}
