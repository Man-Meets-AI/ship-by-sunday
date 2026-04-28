import { BlogMediaFrame } from "@/app/blog/_components/blog-media-frame";

type BlogSplitHeroProps = {
	eyebrow: string;
	title: string;
	intro: string;
	mediaKind: "image" | "video";
	mediaSrc: string;
	mediaAlt: string;
	mediaPosterSrc?: string;
};

export function BlogSplitHero({
	eyebrow,
	title,
	intro,
	mediaKind,
	mediaSrc,
	mediaAlt,
	mediaPosterSrc,
}: BlogSplitHeroProps) {
	return (
		<section className="grid gap-8 border-b border-border pb-10 sm:gap-10 sm:pb-12 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-end">
			<div className="space-y-6">
				<p className="text-sm font-medium text-foreground/60">{eyebrow}</p>
				<h2 className="max-w-3xl text-balance text-[clamp(2.75rem,6vw,5.75rem)] font-medium leading-[0.92] tracking-[-0.06em] text-foreground">
					{title}
				</h2>
				<p className="max-w-2xl text-pretty text-lg leading-8 text-foreground/70 sm:text-xl">
					{intro}
				</p>
			</div>
			<BlogMediaFrame
				kind={mediaKind}
				src={mediaSrc}
				alt={mediaAlt}
				posterSrc={mediaPosterSrc}
				priority
			/>
		</section>
	);
}
