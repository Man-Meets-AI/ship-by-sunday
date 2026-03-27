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
				"space-y-6 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>blockquote]:border-l-2 [&>blockquote]:border-border/70 [&>blockquote]:pl-5 [&>blockquote]:text-lg [&>blockquote]:leading-relaxed [&>blockquote]:text-foreground/90 [&>h2]:mt-14 [&>h2]:scroll-mt-24 [&>h2]:text-balance [&>h2]:text-3xl [&>h2]:font-semibold [&>h2]:tracking-tight [&>h3]:mt-10 [&>h3]:scroll-mt-24 [&>h3]:text-2xl [&>h3]:font-semibold [&>hr]:my-12 [&>hr]:border-border/60 [&>p]:max-w-3xl [&>p]:text-pretty [&>p]:text-lg [&>p]:leading-relaxed [&>p]:text-foreground/88 [&>p>a]:underline [&>p>a]:decoration-border [&>p>a]:underline-offset-4 [&>ul]:max-w-3xl [&>ul]:space-y-3 [&>ul]:pl-6 [&>ul]:text-lg [&>ul]:leading-relaxed [&>ul]:text-foreground/88 [&>ul>li]:list-disc",
				className,
			)}
		>
			{children}
		</div>
	);
}
