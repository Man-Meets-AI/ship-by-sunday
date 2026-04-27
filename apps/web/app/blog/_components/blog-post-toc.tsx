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
			<div className="rounded-[28px] border border-border/70 bg-background/75 p-5 backdrop-blur-sm">
				<p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
					Contents
				</p>
				<nav className="mt-5">
					<ol className="space-y-3">
						{items.map((item) => (
							<li key={item.id}>
								<Link
									href={`${postPath}#${item.id}`}
									className={cn(
										"block text-sm leading-relaxed text-foreground/78 transition-colors hover:text-foreground",
										item.depth === 3 && "pl-4 text-muted-foreground",
									)}
								>
									{item.label}
								</Link>
							</li>
						))}
					</ol>
				</nav>
				<div className="mt-6 border-t border-border/60 pt-4">
					<Link
						href="#top"
						className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
					>
						Back to top
					</Link>
				</div>
			</div>
		</aside>
	);
}
