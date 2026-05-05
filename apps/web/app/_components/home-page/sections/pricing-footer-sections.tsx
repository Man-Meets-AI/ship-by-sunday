"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { routeConfig, type HomePageCtaTarget } from "@/config/product";
import { PromoBanner } from "@/app/_components/home-page/promo-banner";
import { ThemeToggleButton } from "@/app/_components/theme-toggle-button";
import type { HomePageContent } from "@/app/_content/home-page";

import { HomePagePrimaryCta } from "./home-page-primary-cta";
import { PricingIncludesList } from "./pricing-includes-list";
import { ScrollReveal } from "./scroll-reveal";

const ROTATION_INTERVAL_MS = 2800;

function RotatingPricingHeadline({
	headline,
	accent,
}: {
	headline: PricingSection["headline"];
	accent: string;
}) {
	const [index, setIndex] = useState(0);
	const reducedMotion = useReducedMotion() ?? false;
	const phrases = headline.rotatingPhrases;

	useEffect(() => {
		if (reducedMotion || phrases.length <= 1) {
			return;
		}

		const id = setInterval(
			() => setIndex((i) => (i + 1) % phrases.length),
			ROTATION_INTERVAL_MS,
		);
		return () => clearInterval(id);
	}, [phrases.length, reducedMotion]);

	const phrase = phrases[index] ?? phrases[0] ?? "";
	const phraseNode = reducedMotion ? (
		<span className="inline">{phrase}</span>
	) : (
		<AnimatePresence mode="wait">
			<motion.span
				key={phrase}
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.3, ease: "easeInOut" }}
				className="inline"
			>
				{phrase}
			</motion.span>
		</AnimatePresence>
	);

	return (
		<h2
			aria-label={`${headline.prefix} ${phrase} ${accent}`}
			className="leading-none"
		>
			<span className="block font-heading-serif text-4xl font-normal italic leading-[0.9] sm:text-5xl lg:text-7xl">
				{headline.prefix}
			</span>
			<span className="block font-heading-serif text-4xl font-normal italic leading-[0.9] sm:text-5xl lg:text-7xl">
				{phraseNode}
			</span>
			<span className="block font-home-inter mt-1 text-xl font-normal text-foreground/70 sm:text-2xl lg:text-3xl">
				{accent}
			</span>
		</h2>
	);
}

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
							<RotatingPricingHeadline
								headline={pricingSection.headline}
								accent={pricingSection.titleAccent}
							/>
						</div>
					</div>
				</ScrollReveal>

				<ScrollReveal delay={0.15}>
					<div className="flex flex-col gap-8">
						<div className="flex flex-col gap-4">
							{pricingSection.offerBanner ? (
								<div className="relative">
									<PromoBanner
										label={pricingSection.offerBanner.label}
										message={pricingSection.offerBanner.message}
										className="rounded-2xl border border-foreground/15 bg-foreground/5 px-4 py-3"
										contentClassName="justify-start text-left tracking-[0.12em]"
										messageClassName="text-sm tracking-normal text-foreground/80 normal-case"
									/>
									<Image
										src="/landing-page/pilot-member.png"
										alt="Pilot member mascot"
										width={52}
										height={52}
										className="absolute right-0 bottom-full translate-y-2 drop-shadow-md"
									/>
								</div>
							) : null}
							<div className="flex items-baseline gap-3">
								{pricingSection.originalPriceDisplay ? (
									<p className="text-2xl font-semibold text-muted-foreground line-through">
										{pricingSection.originalPriceDisplay}
									</p>
								) : null}
								<p className="font-number text-[clamp(5rem,15vw,10rem)] font-bold leading-[0.85] tracking-tighter text-foreground">
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
						<p className="font-product-wordmark text-lg font-normal tracking-wide text-foreground uppercase">
							{footerWordmark}
						</p>
						<div className="flex items-center gap-3">
							<Link
								href={routeConfig.signIn}
								className="text-sm text-foreground underline-offset-4 transition-colors hover:underline"
							>
								Pilot Members Only
							</Link>
							<ThemeToggleButton className="border-border/40 bg-transparent text-muted-foreground/60 hover:text-foreground" />
						</div>
					</div>
				</ScrollReveal>
			</div>
		</footer>
	);
}
