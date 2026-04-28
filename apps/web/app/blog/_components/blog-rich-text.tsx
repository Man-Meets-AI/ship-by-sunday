import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type BlogRichTextProps = {
	children: ReactNode;
	className?: string;
};

export function BlogRichText({ children, className }: BlogRichTextProps) {
	return (
		<div
			className={cn(
				"space-y-7 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>blockquote]:max-w-3xl [&>blockquote]:border-l-2 [&>blockquote]:border-foreground [&>blockquote]:pl-5 [&>blockquote]:text-xl [&>blockquote]:leading-8 [&>blockquote]:text-foreground [&>h2]:mt-16 [&>h2]:max-w-4xl [&>h2]:scroll-mt-24 [&>h2]:text-balance [&>h2]:text-4xl [&>h2]:font-medium [&>h2]:leading-tight [&>h2]:tracking-[-0.04em] [&>h3]:mt-12 [&>h3]:max-w-3xl [&>h3]:scroll-mt-24 [&>h3]:text-2xl [&>h3]:font-medium [&>h3]:tracking-[-0.025em] [&>hr]:my-14 [&>hr]:border-border [&>p]:max-w-3xl [&>p]:text-pretty [&>p]:text-xl [&>p]:leading-9 [&>p]:text-foreground/80 [&>p>a]:underline [&>p>a]:decoration-foreground/35 [&>p>a]:underline-offset-4 [&>ul]:max-w-3xl [&>ul]:space-y-3 [&>ul]:pl-5 [&>ul]:text-xl [&>ul]:leading-9 [&>ul]:text-foreground/80 [&>ul>li]:list-disc",
				className,
			)}
		>
			{children}
		</div>
	);
}
