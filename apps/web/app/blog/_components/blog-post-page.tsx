import type { ReactNode } from "react";

import { type HomePageCtaTarget } from "@/config/product";
import { BlogPostShell } from "@/app/blog/_components/blog-post-shell";
import type { BlogTocEntry } from "@/app/blog/_lib/blog-toc";
import type { BlogPostSummary } from "@/app/blog/_server/blog-posts";

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
