import Link from "next/link";

import { productWordmarkFontClassName } from "@/components/product-brand";
import { routeConfig, type HomePageCtaTarget } from "@/config/product";
import type { HomePageContent } from "@/features/marketing/content/home";
import { blogDisplayConfig } from "@/features/starter/lib/starter-selectors";

import { MarketingThemeToggle } from "./home-hero-theme-toggle";
import { HomePagePrimaryCta } from "./home-page-primary-cta";
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
		<section id="pricing" className="py-24 border-t border-border/40 lg:py-40">
			<div className="grid gap-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-24">
				<div className="space-y-12 lg:sticky lg:top-24 lg:h-fit">
					<div className="space-y-8">
						<p className="text-sm font-bold tracking-[0.2em] text-primary/80 uppercase">
							{pricingSection.label}
						</p>
						<h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-7xl">
							{pricingSection.titleLead}
							<span className="block text-primary/90">
								{pricingSection.titleAccent}
							</span>
						</h2>
						<p className="max-w-xl text-pretty text-xl leading-relaxed text-muted-foreground">
							{pricingSection.intro}
						</p>
					</div>

					<div className="rounded-3xl border border-border/40 bg-muted/20 p-8 shadow-sm">
						<p className="text-sm font-medium leading-relaxed text-muted-foreground italic">
							{pricingSection.guarantee}
						</p>
					</div>
				</div>
				<div className="flex flex-col gap-12">
					<div className="relative overflow-hidden rounded-[48px] border border-border/50 bg-background p-10 shadow-2xl transition-all duration-700 hover:shadow-primary/5 sm:p-16">
						<div className="absolute -right-20 -top-20 size-64 rounded-full bg-primary/5 blur-3xl transition-all duration-500 group-hover:bg-primary/10" />
						<div className="relative z-10 flex flex-col gap-12">
							<div className="space-y-2">
								<p className="text-sm font-bold uppercase tracking-widest text-primary/80">
									{pricingSection.eyebrow}
								</p>
								<div className="flex flex-wrap items-baseline gap-4">
									<p className="font-marketing-display text-[clamp(5rem,15vw,10rem)] font-black tracking-tighter text-foreground leading-[0.8]">
										{pricingSection.priceDisplay}
									</p>
									<span className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-4">
										USD One-Time
									</span>
								</div>
							</div>

							<div className="space-y-6">
								<HomePagePrimaryCta
									target={primaryCtaTarget}
									label={pricingSection.ctaTitle}
									className="h-20 min-w-full rounded-[24px] bg-foreground text-xl font-black text-background transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-primary/10"
								/>
								<p className="text-center text-base font-medium leading-relaxed text-muted-foreground">
									{pricingSection.trustLine}
								</p>
							</div>

							<div className="grid gap-12 border-t border-border/40 pt-12 lg:grid-cols-2">
								<div className="space-y-6">
									<p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/40">
										Included
									</p>
									<PricingIncludesList items={pricingSection.includes} />
								</div>
								<div className="rounded-3xl border border-primary/20 bg-primary/5 p-8">
									<p className="text-xs font-bold uppercase tracking-widest text-primary/70">
										{pricingSection.bonus.label}
									</p>
									<p className="mt-4 text-2xl font-bold tracking-tight text-foreground">
										{pricingSection.bonus.title}
									</p>
									<p className="mt-4 text-sm leading-relaxed text-muted-foreground">
										{pricingSection.bonus.description}
									</p>
								</div>
							</div>
						</div>
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
			className="py-20 lg:py-40 border-t border-border/40"
			aria-label="Site footer"
		>
			<div className="flex flex-col items-center gap-16">
				<div className="flex w-full items-center justify-between border-b border-border/40 pb-16">
					<div className="flex items-center gap-4">
						<div className="inline-flex items-center gap-3 rounded-full border border-border/40 bg-muted/20 px-4 py-2">
							<span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
								Display
							</span>
							<MarketingThemeToggle />
						</div>
					</div>
					<Link
						href={routeConfig.blog}
						className="inline-flex h-12 items-center rounded-full border border-border/40 bg-background px-6 text-sm font-bold tracking-wide text-foreground/80 transition-all hover:border-foreground/30 hover:text-foreground hover:shadow-sm"
					>
						{blogDisplayConfig.footerLabel}
					</Link>
				</div>

				<div className="w-full text-center">
					<p
						className={`${productWordmarkFontClassName} text-[clamp(4.5rem,18vw,14rem)] font-black uppercase leading-[0.8] tracking-tighter text-foreground/90 transition-all duration-700 hover:tracking-[-0.05em]`}
					>
						{footerWordmark}
					</p>
				</div>

				<p className="text-sm font-medium tracking-[0.3em] text-foreground/20 uppercase">
					One serious system for serious builders.
				</p>
			</div>
		</footer>
	);
}
