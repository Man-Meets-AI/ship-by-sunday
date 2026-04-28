import Link from "next/link";

import type { BlogTocEntry } from "@/app/blog/_lib/blog-toc";
import { cn } from "@/lib/utils";

type BlogPostTocProps = {
	items: BlogTocEntry[];
	postPath: string;
};

export function BlogPostToc({ items, postPath }: BlogPostTocProps) {
	if (items.length === 0) {
		return null;
	}

	return (
		<aside className="xl:sticky xl:top-8 xl:self-start">
			<div className="border-t border-border pt-4">
				<p className="text-sm font-medium text-foreground">Contents</p>
				<nav className="mt-5">
					<ol className="space-y-3">
						{items.map((item) => (
							<li key={item.id}>
								<Link
									href={`${postPath}#${item.id}`}
									className={cn(
										"block text-sm leading-relaxed text-foreground/60 transition-colors hover:text-foreground",
										item.depth === 3 && "pl-4 text-foreground/50",
									)}
								>
									{item.label}
								</Link>
							</li>
						))}
					</ol>
				</nav>
				<div className="mt-6 border-t border-border pt-4">
					<Link
						href="#top"
						className="text-sm text-foreground/60 transition-colors hover:text-foreground"
					>
						Back to top
					</Link>
				</div>
			</div>
		</aside>
	);
}
