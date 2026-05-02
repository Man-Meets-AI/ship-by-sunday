"use client";

import Link from "next/link";

import { routeConfig, type HomePageCtaTarget } from "@/config/product";
import { PromoBanner } from "@/app/_components/home-page/promo-banner";
import type { HomePageContent } from "@/app/_content/home-page";

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
					<div className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
						<div className="flex flex-col gap-3">
							<h2 className="flex flex-col gap-1 text-balance text-4xl font-semibold leading-[0.92] tracking-tight sm:text-5xl lg:text-7xl">
								<span>{pricingSection.titleLead}</span>
								<span className="text-foreground/90">
									{pricingSection.titleAccent}
								</span>
							</h2>
							<p className="max-w-xl text-pretty text-lg leading-snug text-muted-foreground">
								{pricingSection.intro}
							</p>
						</div>
					</div>
				</ScrollReveal>

				<ScrollReveal delay={0.15}>
					<div className="flex flex-col gap-8">
						<div className="flex flex-col gap-4">
							{pricingSection.offerBanner ? (
								<PromoBanner
									label={pricingSection.offerBanner.label}
									message={pricingSection.offerBanner.message}
									className="rounded-2xl border border-foreground/15 bg-foreground/5 px-4 py-3"
									contentClassName="justify-start text-left tracking-[0.12em]"
									messageClassName="text-sm tracking-normal text-foreground/80 normal-case"
								/>
							) : null}
							<div className="flex items-baseline gap-3">
								{pricingSection.originalPriceDisplay ? (
									<p className="text-2xl font-semibold text-muted-foreground line-through">
										{pricingSection.originalPriceDisplay}
									</p>
								) : null}
								<p className="font-marketing-display text-[clamp(5rem,15vw,10rem)] font-black leading-[0.85] tracking-tighter text-foreground">
									{pricingSection.offerPriceDisplay}
								</p>
								<span className="text-sm font-medium text-muted-foreground">
									USD one-time
								</span>
							</div>
						</div>

						<div className="space-y-4">
							<HomePagePrimaryCta
								target={primaryCtaTarget}
								label={pricingSection.ctaTitle}
								testId="pricing-primary-cta"
								className="h-16 min-w-full rounded-2xl text-lg font-bold shadow-2xl shadow-foreground/15 motion-safe:transition-all motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-foreground/25"
							/>
							<p className="text-center text-sm leading-7 text-muted-foreground">
								{pricingSection.trustLine}
							</p>
						</div>

						<div className="space-y-4 border-t border-border/40 pt-10">
							<PricingIncludesList items={pricingSection.includes} />
						</div>

						<div className="rounded-3xl border border-foreground/15 bg-foreground/5 p-6">
							<p className="text-xl font-semibold leading-tight tracking-tight text-foreground">
								{pricingSection.bonus.title}
							</p>
							<p className="mt-2 text-sm leading-snug text-muted-foreground">
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
							className="text-sm text-foreground underline-offset-4 transition-colors hover:underline"
						>
							Already bought? <span className="ml-1 font-medium">Sign in</span>
						</Link>
					</div>
				</ScrollReveal>
			</div>
		</footer>
	);
}
