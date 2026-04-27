import type { ReactNode } from "react";

import { BlogMediaFrame } from "@/app/blog/_components/blog-media-frame";
import { cn } from "@/lib/utils";

type BlogSplitSectionProps = {
	orientation: "text-left" | "text-right";
	label: string;
	title: string;
	intro: string;
	mediaKind: "image" | "video";
	mediaSrc: string;
	mediaAlt: string;
	mediaPosterSrc?: string;
	mediaCaption?: string;
	children: ReactNode;
};

export function BlogSplitSection({
	orientation,
	label,
	title,
	intro,
	mediaKind,
	mediaSrc,
	mediaAlt,
	mediaPosterSrc,
	mediaCaption,
	children,
}: BlogSplitSectionProps) {
	const mediaBlock = (
		<div className="space-y-3">
			<BlogMediaFrame
				kind={mediaKind}
				src={mediaSrc}
				alt={mediaAlt}
				posterSrc={mediaPosterSrc}
			/>
			{mediaCaption ? (
				<p className="font-mono text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
					{mediaCaption}
				</p>
			) : null}
		</div>
	);

	const textBlock = (
		<div className="space-y-5">
			<div className="flex items-center gap-3">
				<span className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
					{label}
				</span>
				<span className="h-px flex-1 bg-border/70" />
			</div>
			<div className="space-y-4">
				<h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
					{title}
				</h2>
				<p className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
					{intro}
				</p>
			</div>
			<div className="space-y-4 text-base leading-relaxed text-foreground/88 sm:text-[1.05rem]">
				{children}
			</div>
		</div>
	);

	return (
		<section
			className={cn(
				"grid gap-8 border-t border-border/60 py-10 sm:gap-10 sm:py-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start",
				orientation === "text-right" && "lg:[&>*:first-child]:order-2",
			)}
		>
			{textBlock}
			{mediaBlock}
		</section>
	);
}
