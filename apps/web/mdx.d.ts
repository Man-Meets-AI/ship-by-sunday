declare module "*.mdx" {
	import type { ComponentType } from "react";

	const MDXContent: ComponentType<object>;
	export default MDXContent;
}
