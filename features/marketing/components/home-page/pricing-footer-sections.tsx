import { CheckoutButton } from "@/features/checkout/components/checkout-button";
import type { HomePageContent } from "@/features/marketing/content/home";

import { PricingIncludesList } from "./pricing-includes-list";
import { SectionFrame, SectionLabel } from "./section-shell";

type FooterNav = HomePageContent["footerNav"];
type FooterWordmark = HomePageContent["footerWordmark"];
type PricingSection = HomePageContent["pricingSection"];

export function PricingSectionBlock({
	pricingSection,
}: {
	pricingSection: PricingSection;
}) {
	return (
		<div
			id="pricing"
			className="grid gap-8 py-10 sm:gap-10 sm:py-12 lg:grid-cols-[1fr_1.05fr] lg:items-stretch"
		>
			<div className="flex flex-col gap-8 sm:gap-10">
				<div className="space-y-4">
					<SectionLabel>{pricingSection.label}</SectionLabel>
					<h2 className="font-marketing-display text-balance text-3xl uppercase tracking-marketing-section sm:text-5xl">
						{pricingSection.titleLead}
						<span className="block">{pricingSection.titleAccent}</span>
					</h2>
					<p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
						{pricingSection.intro}
					</p>
				</div>
				<div className="space-y-2 rounded-xl bg-muted/20 px-5 py-6 sm:px-6 sm:py-8">
					<p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
						Investment
					</p>
					<p className="font-marketing-display text-5xl font-semibold tracking-marketing-section sm:text-6xl">
						{pricingSection.priceDisplay}
					</p>
					<p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
						{pricingSection.eyebrow}
					</p>
				</div>
			</div>
			<SectionFrame className="gap-0 overflow-hidden p-0 shadow-md ring-1 ring-foreground/6">
				<div className="space-y-4 px-6 pt-6 sm:space-y-5 sm:px-8 sm:pt-8">
					<SectionLabel>{pricingSection.paymentLabel}</SectionLabel>
					<h2 className="font-marketing-display text-balance text-3xl uppercase tracking-marketing-section sm:text-5xl">
						{pricingSection.ctaTitle}
					</h2>
				</div>
				<div className="px-6 py-6 sm:px-8 sm:py-8">
					<PricingIncludesList items={pricingSection.includes} />
				</div>
				<div className="flex flex-col gap-5 border-t border-border/80 bg-muted/35 px-6 py-6 sm:gap-6 sm:px-8 sm:py-8">
					<div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
								Total due today
							</p>
							<p className="font-marketing-display text-4xl font-semibold tracking-marketing-section sm:text-5xl">
								{pricingSection.priceDisplay}
							</p>
						</div>
					</div>
					<CheckoutButton
						label={pricingSection.ctaTitle}
						className="h-12 w-full text-base font-semibold shadow-sm"
					/>
					<div className="space-y-3 text-muted-foreground">
						<p className="max-w-lg text-sm leading-relaxed sm:text-base">
							{pricingSection.trustLine}
						</p>
						<p className="max-w-lg text-xs font-medium uppercase leading-relaxed tracking-wide sm:text-sm">
							{pricingSection.guarantee}
						</p>
					</div>
				</div>
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
			<nav
				className="flex flex-wrap justify-center gap-x-6 gap-y-3 border-t border-border/30 py-8 sm:gap-x-8 sm:py-10"
				aria-label="Footer"
			>
				{footerNav.map((item) => (
					<span
						key={item}
						className="text-sm font-medium text-muted-foreground"
					>
						{item}
					</span>
				))}
			</nav>
			<div className="flex justify-center px-2 py-12 text-center sm:py-16 md:py-20">
				<p className="font-marketing-display text-balance text-5xl font-semibold uppercase tracking-marketing-section sm:text-7xl md:text-8xl lg:text-9xl">
					{footerWordmark}
				</p>
			</div>
		</>
	);
}
