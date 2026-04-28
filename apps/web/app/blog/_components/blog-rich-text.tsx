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
				"space-y-7 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&>blockquote]:max-w-3xl [&>blockquote]:border-l-2 [&>blockquote]:border-foreground [&>blockquote]:pl-5 [&>blockquote]:text-lg [&>blockquote]:leading-8 [&>blockquote]:text-foreground sm:[&>blockquote]:text-xl [&>h2]:mt-14 [&>h2]:max-w-3xl [&>h2]:scroll-mt-24 [&>h2]:text-balance [&>h2]:text-3xl [&>h2]:font-medium [&>h2]:leading-tight [&>h2]:tracking-normal sm:[&>h2]:text-4xl [&>h3]:mt-10 [&>h3]:max-w-3xl [&>h3]:scroll-mt-24 [&>h3]:text-2xl [&>h3]:font-medium [&>h3]:tracking-normal [&>hr]:my-14 [&>hr]:border-border [&>p]:max-w-3xl [&>p]:text-pretty [&>p]:text-lg [&>p]:leading-8 [&>p]:text-foreground/80 sm:[&>p]:text-xl sm:[&>p]:leading-9 [&>p>a]:underline [&>p>a]:decoration-foreground/35 [&>p>a]:underline-offset-4 [&>ul]:max-w-3xl [&>ul]:space-y-3 [&>ul]:pl-5 [&>ul]:text-lg [&>ul]:leading-8 [&>ul]:text-foreground/80 sm:[&>ul]:text-xl sm:[&>ul]:leading-9 [&>ul>li]:list-disc",
				className,
			)}
		>
			{children}
		</div>
	);
}
