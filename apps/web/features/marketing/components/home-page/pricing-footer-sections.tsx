import Link from "next/link";

import { productWordmarkFontClassName } from "@/components/product-brand";
import { routeConfig, type HomePageCtaTarget } from "@/config/product";
import type { HomePageContent } from "@/features/marketing/content/home";
import { blogDisplayConfig } from "@/features/starter/lib/starter-selectors";

import { MarketingThemeToggle } from "./home-hero-theme-toggle";
import { HomePagePrimaryCta } from "./home-page-primary-cta";
import {
	HomePageSectionOverline,
	homePageQuietSurfaceClassName,
	homePageSectionClassName,
} from "./home-page-primitives";
import { PricingIncludesList } from "./pricing-includes-list";

type FooterWordmark = HomePageContent["footerWordmark"];
type PricingSection = HomePageContent["pricingSection"];

export function PricingSectionBlock({
	pricingSection,
	primaryCtaTarget,
}: {
	pricingSection: PricingSection;
	primaryCtaTarget: HomePageCtaTarget;
}) {
	return (
		<section
			id="pricing"
			className={`grid gap-8 ${homePageSectionClassName} lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-12`}
		>
			<div className="space-y-5">
				<HomePageSectionOverline>
					{pricingSection.label}
				</HomePageSectionOverline>
				<div className="space-y-4">
					<h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
						{pricingSection.titleLead} {pricingSection.titleAccent}
					</h2>
					<p className="max-w-2xl text-pretty text-muted-foreground sm:text-lg">
						{pricingSection.intro}
					</p>
				</div>
				<p className="max-w-xl border-t border-border/60 pt-4 text-sm leading-relaxed text-muted-foreground">
					{pricingSection.guarantee}
				</p>
			</div>
			<div className={`space-y-6 p-5 sm:p-6 ${homePageQuietSurfaceClassName}`}>
				<div className="border-t border-border/60 pt-4">
					<p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
						{pricingSection.eyebrow}
					</p>
					<div className="mt-4 flex flex-wrap items-end justify-between gap-5">
						<p className="text-[clamp(4rem,9vw,6.5rem)] font-semibold tracking-tight tabular-nums">
							{pricingSection.priceDisplay}
						</p>
						<HomePagePrimaryCta
							target={primaryCtaTarget}
							label={pricingSection.ctaTitle}
							className="h-12 min-w-full px-6 text-base font-semibold sm:min-w-[16rem]"
						/>
					</div>
					<p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
						{pricingSection.trustLine}
					</p>
				</div>
				<div className="grid gap-6 border-t border-border/60 pt-4 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,0.72fr)]">
					<div className="space-y-4">
						<p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
							Included
						</p>
						<PricingIncludesList items={pricingSection.includes} />
					</div>
					<div className="rounded-[24px] border border-border/70 bg-background/80 p-4">
						<p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
							{pricingSection.bonus.label}
						</p>
						<p className="mt-2 text-lg font-semibold tracking-tight text-foreground">
							{pricingSection.bonus.title}
						</p>
						<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
							{pricingSection.bonus.description}
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}

export function FooterSection({
	footerWordmark,
}: {
	footerWordmark: FooterWordmark;
}) {
	return (
		<footer
			className="border-t border-border/60 py-8 sm:py-10"
			aria-label="Site footer"
		>
			<div className="flex items-center justify-between gap-4">
				<p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-muted-foreground">
					Light and dark stay first-class
				</p>
				<div className="inline-flex items-center gap-3 rounded-full border border-border/60 px-4 py-2">
					<span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
						Theme
					</span>
					<MarketingThemeToggle />
				</div>
			</div>
			<div className="flex justify-center px-2 pt-10 text-center sm:pt-12">
				<div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:items-end">
					<p
						className={`${productWordmarkFontClassName} text-balance text-[clamp(4.5rem,18vw,12rem)] font-normal uppercase leading-[0.82] tracking-[0.05em] text-foreground/90`}
					>
						{footerWordmark}
					</p>
					<Link
						href={routeConfig.blog}
						className="inline-flex h-10 items-center rounded-full border border-border/60 px-4 text-xs font-medium uppercase tracking-[0.24em] text-foreground/80 transition-colors hover:border-foreground/20 hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 sm:mb-4"
					>
						{blogDisplayConfig.footerLabel}
					</Link>
				</div>
			</div>
		</footer>
	);
}
