import { type HomePageCtaTarget } from "@/config/product";
import { blogPromoContent } from "@/app/(marketing)/blog/_content/blog";
import { HomePagePrimaryCta } from "@/app/_components/home-page/sections/home-page-primary-cta";

type BlogPostPromoProps = {
	target: HomePageCtaTarget;
};

export function BlogPostPromo({ target }: BlogPostPromoProps) {
	return (
		<section className="border-t border-border pt-8">
			<p className="text-sm font-medium text-foreground/60">
				{blogPromoContent.eyebrow}
			</p>
			<div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
				<div className="space-y-3">
					<h2 className="max-w-3xl text-balance text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
						{blogPromoContent.title}
					</h2>
					<p className="max-w-2xl text-pretty text-base leading-7 text-foreground/70">
						{blogPromoContent.body}
					</p>
				</div>
				<HomePagePrimaryCta
					target={target}
					label={blogPromoContent.ctaLabel}
					className="h-11 min-w-full rounded-none px-5 text-sm font-semibold sm:min-w-[16rem]"
				/>
			</div>
		</section>
	);
}
