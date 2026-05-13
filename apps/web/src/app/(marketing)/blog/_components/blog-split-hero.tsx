import { BlogMediaFrame } from "@/app/(marketing)/blog/_components/blog-media-frame";

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
		<section className="grid gap-8 border-b border-border pb-10 sm:gap-10 sm:pb-12">
			<div className="space-y-6">
				<p className="text-sm font-medium text-foreground/60">{eyebrow}</p>
				<h2 className="max-w-3xl text-balance text-4xl font-medium leading-[0.95] tracking-normal text-foreground sm:text-5xl lg:text-6xl">
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
