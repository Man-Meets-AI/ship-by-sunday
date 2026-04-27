import type { BlogPostSummary } from "@/app/blog/_server/blog-posts";
import {
	getBlogIndexStructuredData,
	getBlogPostStructuredData,
} from "@/app/blog/_lib/blog-structured-data";

function createStructuredDataMarkup(payload: string) {
	return `<script type="application/ld+json">${payload}</script>`;
}

export function BlogIndexStructuredData({
	posts,
}: {
	posts: BlogPostSummary[];
}) {
	return (
		<div
			dangerouslySetInnerHTML={{
				__html: createStructuredDataMarkup(getBlogIndexStructuredData(posts)),
			}}
		/>
	);
}

export function BlogPostStructuredData({ post }: { post: BlogPostSummary }) {
	return (
		<div
			dangerouslySetInnerHTML={{
				__html: createStructuredDataMarkup(getBlogPostStructuredData(post)),
			}}
		/>
	);
}
