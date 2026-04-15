"use client";

import Link from "next/link";

import { routeConfig, type HomePageCtaTarget } from "@/config/product";
import type { HomePageContent } from "@/features/marketing/content/home";

import { HomePagePrimaryCta } from "./home-page-primary-cta";
import { PricingIncludesList } from "./pricing-includes-list";
import { ScrollReveal } from "./scroll-reveal";

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
		<section id="pricing" className="border-t border-border/40 py-24 lg:py-40">
			<div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
				<ScrollReveal>
					<div className="space-y-10 lg:sticky lg:top-24 lg:h-fit">
						<div className="space-y-6">
							<h2 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-7xl">
								{pricingSection.titleLead}
								<span className="block text-primary/90">
									{pricingSection.titleAccent}
								</span>
							</h2>
							<p className="max-w-xl text-pretty text-lg leading-7 text-muted-foreground">
								{pricingSection.intro}
							</p>
						</div>

						<p className="max-w-md text-sm leading-7 text-muted-foreground/60 italic">
							{pricingSection.guarantee}
						</p>
					</div>
				</ScrollReveal>

				<ScrollReveal delay={0.15}>
					<div className="flex flex-col gap-10">
						<div className="space-y-3">
							<div className="flex items-baseline gap-3">
								<p className="text-2xl font-semibold text-muted-foreground line-through">
									{pricingSection.originalPriceDisplay}
								</p>
								<p className="font-marketing-display text-[clamp(5rem,15vw,10rem)] font-black leading-[0.85] tracking-tighter text-foreground">
									{pricingSection.offerPriceDisplay}
								</p>
								<span className="text-sm font-medium text-muted-foreground">
									USD one-time
								</span>
							</div>
							<p className="text-sm font-semibold tracking-wide text-primary uppercase">
								{pricingSection.offerLabel}
							</p>
						</div>

						<div className="space-y-4">
							<HomePagePrimaryCta
								target={primaryCtaTarget}
								label={pricingSection.ctaTitle}
								testId="pricing-primary-cta"
								className="h-20 min-w-full rounded-2xl bg-foreground text-xl font-black text-background transition-transform hover:scale-[1.02] active:scale-[0.98]"
							/>
							<p className="text-center text-sm leading-7 text-muted-foreground">
								{pricingSection.trustLine}
							</p>
						</div>

						<div className="space-y-4 border-t border-border/40 pt-10">
							<PricingIncludesList items={pricingSection.includes} />
						</div>

						<div className="rounded-3xl border border-primary/20 bg-primary/5 p-6">
							<p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
								{pricingSection.bonus.label}
							</p>
							<p className="mt-3 text-xl font-semibold tracking-tight text-foreground">
								{pricingSection.bonus.title}
							</p>
							<p className="mt-2 text-sm leading-7 text-muted-foreground">
								{pricingSection.bonus.description}
							</p>
						</div>
					</div>
				</ScrollReveal>
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
			className="border-t border-border/40 py-10"
			aria-label="Site footer"
		>
			<div className="flex flex-col items-center gap-6">
				<ScrollReveal className="w-full">
					<div className="flex w-full flex-col items-center justify-between gap-4 sm:flex-row">
						<p className="font-marketing-display text-lg font-semibold tracking-tight text-foreground">
							{footerWordmark}
						</p>
						<Link
							href={routeConfig.signIn}
							className="text-sm text-primary underline-offset-4 transition-colors hover:underline"
						>
							Already bought? <span className="ml-1 font-medium">Sign in</span>
						</Link>
					</div>
				</ScrollReveal>
			</div>
		</footer>
	);
}
