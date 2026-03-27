"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { productWordmarkFontClassName } from "@/components/product-brand";
import { routeConfig, type HomePageCtaTarget } from "@/config/product";
import type { HomePageContent } from "@/features/marketing/content/home";
import { blogDisplayConfig } from "@/features/starter/lib/starter-selectors";

import { MarketingThemeToggle } from "./home-hero-theme-toggle";
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
								<p className="font-marketing-display text-[clamp(5rem,15vw,10rem)] font-black leading-[0.85] tracking-tighter text-foreground">
									{pricingSection.priceDisplay}
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
								className="h-20 min-w-full rounded-2xl bg-foreground text-xl font-black text-background transition-transform hover:scale-[1.02] active:scale-[0.98]"
							/>
							<p className="text-center text-sm leading-7 text-muted-foreground">
								{pricingSection.trustLine}
							</p>
						</div>

						<div className="space-y-4 border-t border-border/40 pt-10">
							<PricingIncludesList items={pricingSection.includes} />
						</div>

						<div className="border-t border-border/40 pt-8">
							<p className="text-sm font-semibold text-foreground">
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
			className="border-t border-border/40 py-20 lg:py-40"
			aria-label="Site footer"
		>
			<div className="flex flex-col items-center gap-16">
				<ScrollReveal className="w-full">
					<div className="flex w-full items-center justify-between border-b border-border/40 pb-16">
						<div className="flex items-center gap-4">
							<MarketingThemeToggle />
						</div>
						<Link
							href={routeConfig.blog}
							className="inline-flex h-12 items-center rounded-full border border-border/40 bg-background px-6 text-sm font-bold text-foreground/80 transition-all hover:border-foreground/30 hover:text-foreground hover:shadow-sm"
						>
							{blogDisplayConfig.footerLabel}
						</Link>
					</div>
				</ScrollReveal>

				<div className="w-full text-center overflow-x-hidden">
					<motion.p
						className={`${productWordmarkFontClassName} [word-spacing:0.02em] text-[clamp(4.5rem,18vw,14rem)] font-black uppercase leading-[0.8] text-foreground/90 transition-colors duration-700 hover:text-foreground`}
						initial={{ opacity: 0, y: 12 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
						viewport={{ once: true, amount: 0.15 }}
					>
						{footerWordmark}
					</motion.p>
				</div>

				<ScrollReveal delay={0.2}>
					<p className="text-sm font-medium text-foreground/40">
						One serious system for serious builders.
					</p>
				</ScrollReveal>
			</div>
		</footer>
	);
}
