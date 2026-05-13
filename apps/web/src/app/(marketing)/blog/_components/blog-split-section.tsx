import type { ReactNode } from "react";

import { BlogMediaFrame } from "@/app/(marketing)/blog/_components/blog-media-frame";

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
				<p className="text-sm leading-6 text-foreground/60">{mediaCaption}</p>
			) : null}
		</div>
	);

	const textBlock = (
		<div className="space-y-5">
			<p className="text-sm font-medium text-foreground/60">{label}</p>
			<div className="space-y-4">
				<h2 className="max-w-3xl text-balance text-3xl font-medium leading-tight tracking-normal text-foreground sm:text-4xl">
					{title}
				</h2>
				<p className="max-w-2xl text-pretty text-lg leading-8 text-foreground/70">
					{intro}
				</p>
			</div>
			<div className="space-y-4 text-base leading-7 text-foreground/80 sm:text-lg sm:leading-8">
				{children}
			</div>
		</div>
	);

	return (
		<section className="grid gap-8 border-t border-border py-10 sm:gap-10 sm:py-12">
			{textBlock}
			{mediaBlock}
		</section>
	);
}
