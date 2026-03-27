import { ArrowUpRight } from "lucide-react";

import { type HomePageCtaTarget } from "@/config/product";
import { blogPromoContent } from "@/features/blog/content/blog";
import { HomePagePrimaryCta } from "@/features/marketing/components/home-page/home-page-primary-cta";

type BlogPostPromoProps = {
	target: HomePageCtaTarget;
};

export function BlogPostPromo({ target }: BlogPostPromoProps) {
	return (
		<section className="rounded-[32px] border border-border/70 bg-muted/20 p-6 sm:p-7">
			<div className="flex flex-wrap items-center gap-3">
				<span className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
					{blogPromoContent.eyebrow}
				</span>
				<ArrowUpRight className="size-4 text-muted-foreground" />
			</div>
			<div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
				<div className="space-y-3">
					<h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
						{blogPromoContent.title}
					</h2>
					<p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
						{blogPromoContent.body}
					</p>
				</div>
				<HomePagePrimaryCta
					target={target}
					label={blogPromoContent.ctaLabel}
					className="h-11 min-w-full px-5 text-sm font-semibold sm:min-w-[16rem]"
				/>
			</div>
		</section>
	);
}
