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
		<section className="grid gap-8 border-t border-border/60 py-10 sm:gap-10 sm:py-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
			<div className="space-y-6">
				<div className="flex items-center gap-3">
					<span className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
						{eyebrow}
					</span>
					<span className="h-px flex-1 bg-border/70" />
				</div>
				<h2 className="font-marketing-display tracking-marketing-section text-balance text-[clamp(3.4rem,8vw,6.4rem)] font-normal uppercase leading-[0.9] text-foreground">
					{title}
				</h2>
				<p className="max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
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
