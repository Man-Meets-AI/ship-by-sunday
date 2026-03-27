import type { ReactNode } from "react";

import { type HomePageCtaTarget } from "@/config/product";
import { BlogPostShell } from "@/features/blog/components/blog-post-shell";
import type { BlogTocEntry } from "@/features/blog/lib/blog-toc";
import type { BlogPostSummary } from "@/features/blog/server/blog-posts";

type BlogPostPageProps = {
	post: BlogPostSummary;
	toc: BlogTocEntry[];
	promoTarget: HomePageCtaTarget;
	children: ReactNode;
};

export function BlogPostPage({
	post,
	toc,
	promoTarget,
	children,
}: BlogPostPageProps) {
	return (
		<BlogPostShell post={post} toc={toc} promoTarget={promoTarget}>
			{children}
		</BlogPostShell>
	);
}
