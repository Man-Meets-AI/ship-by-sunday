import Image from "next/image";

import type { HomePageContent } from "@/features/marketing/content/home";
import {
	publicDividerGridClassName,
	publicPrimaryActionClassName,
	PublicSurfaceCard,
} from "@/shared/ui/public-surface";

import { CheckoutButton } from "@/features/checkout/components/checkout-button";

import FAQAccordion from "../faq-accordion";
import { SectionFrame, SectionLabel } from "./section-shell";

type FAQSection = HomePageContent["faqSection"];
type FooterNav = HomePageContent["footerNav"];
type FooterWordmark = HomePageContent["footerWordmark"];
type PricingSection = HomePageContent["pricingSection"];
type ProofSection = HomePageContent["proofSection"];

export function ProofAndFaqSection({
	faqSection,
	proofImage,
	proofSection,
}: {
	faqSection: FAQSection;
	proofImage: HomePageContent["assets"]["proofImage"];
	proofSection: ProofSection;
}) {
	return (
		<>
			<div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
				<SectionFrame className="flex flex-col gap-6">
					<div className="border border-product-border/60 p-4">
						<SectionLabel>{proofSection.label}</SectionLabel>
						<div className="mt-4 space-y-[1px] bg-product-border/35">
							{proofSection.points.map((point) => (
								<div
									key={point}
									className="bg-product-surface px-4 py-4 text-base font-semibold leading-relaxed text-product-text sm:text-lg"
								>
									{point}
								</div>
							))}
						</div>
					</div>
					<p className="text-sm leading-relaxed text-product-muted sm:text-base">
						{proofSection.intro}
					</p>
				</SectionFrame>
				<SectionFrame className="flex flex-col gap-6">
					<div className="relative min-h-[24rem] overflow-hidden border border-product-border/60 bg-product-accent">
						<Image
							src={proofImage}
							alt={proofSection.imageAlt}
							fill
							className="object-cover opacity-90"
							sizes="(max-width: 1024px) 100vw, 40vw"
						/>
					</div>
					<p className="text-sm leading-relaxed text-product-muted sm:text-base">
						{proofSection.imageCaption}
					</p>
				</SectionFrame>
			</div>
			<div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
				<SectionFrame>
					<FAQAccordion items={faqSection.items} />
				</SectionFrame>
				<SectionFrame className="flex items-center justify-center">
					<div className="text-center">
						<SectionLabel>{faqSection.label}</SectionLabel>
						<h2 className="mt-3 font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
							{faqSection.titleLead}
							<span className="block">{faqSection.titleAccent}</span>
						</h2>
					</div>
				</SectionFrame>
			</div>
		</>
	);
}

export function PricingSectionBlock({
	pricingSection,
}: {
	pricingSection: PricingSection;
}) {
	return (
		<div id="pricing" className="grid gap-4 lg:grid-cols-[1fr_1.05fr]">
			<PublicSurfaceCard className="bg-product-chip px-6 py-8 text-product-text dark:bg-product-accent dark:text-product-bg">
				<SectionLabel>{pricingSection.label}</SectionLabel>
				<h2 className="mt-4 font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
					{pricingSection.titleLead}
					<span className="block">{pricingSection.titleAccent}</span>
				</h2>
				<p className="mt-4 max-w-md text-base leading-relaxed text-product-text/78 dark:text-product-bg/80 sm:text-lg">
					{pricingSection.intro}
				</p>
				<div className="mt-8 text-6xl font-semibold tracking-[-0.05em] sm:text-7xl">
					{pricingSection.priceDisplay}
				</div>
				<p className="mt-4 max-w-sm text-sm font-semibold uppercase tracking-[0.1em] text-product-muted dark:text-product-bg/80">
					{pricingSection.eyebrow}
				</p>
			</PublicSurfaceCard>
			<SectionFrame className="flex flex-col">
				<SectionLabel>{pricingSection.paymentLabel}</SectionLabel>
				<h2 className="mt-4 font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
					{pricingSection.ctaTitle}
				</h2>
				<div className={`mt-6 ${publicDividerGridClassName}`}>
					{pricingSection.includes.map((item) => (
						<div
							key={item}
							className="grid grid-cols-[56px_1fr] bg-product-surface"
						>
							<div className="grid place-items-center border-r border-product-border/60 text-2xl text-product-accent">
								✓
							</div>
							<div className="px-4 py-4 text-lg font-semibold text-product-text">
								{item}
							</div>
						</div>
					))}
				</div>
				<div className="mt-6 text-6xl font-semibold tracking-[-0.04em]">
					{pricingSection.priceDisplay}
				</div>
				<CheckoutButton
					label={pricingSection.ctaTitle}
					className={`${publicPrimaryActionClassName} mt-6`}
				/>
				<p className="mt-4 max-w-lg text-sm leading-relaxed text-product-muted sm:text-base">
					{pricingSection.trustLine}
				</p>
				<p className="mt-6 max-w-lg text-sm font-semibold uppercase leading-relaxed tracking-[0.08em] text-product-muted">
					{pricingSection.guarantee}
				</p>
			</SectionFrame>
		</div>
	);
}

export function FooterSection({
	footerNav,
	footerWordmark,
}: {
	footerNav: FooterNav;
	footerWordmark: FooterWordmark;
}) {
	return (
		<>
			<PublicSurfaceCard
				className={`${publicDividerGridClassName} sm:grid-cols-3`}
			>
				{footerNav.map((item) => (
					<div
						key={item}
						className="bg-product-surface px-5 py-5 text-sm font-bold uppercase tracking-[0.2em] text-product-muted"
					>
						{item}
					</div>
				))}
			</PublicSurfaceCard>
			<PublicSurfaceCard as="footer" className="px-5 py-10 text-center sm:px-8">
				<p className="font-display text-[3.4rem] uppercase leading-[0.82] tracking-[-0.05em] text-product-text sm:text-[9rem]">
					{footerWordmark}
				</p>
			</PublicSurfaceCard>
		</>
	);
}
