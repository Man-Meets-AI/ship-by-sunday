import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { productWordmarkFontClassName } from "@/components/product-brand";
import { CheckoutButton } from "@/features/checkout/components/checkout-button";
import type { HomePageContent } from "@/features/marketing/content/home";

import { MarketingThemeToggle } from "./home-hero-theme-toggle";
import { PricingIncludesList } from "./pricing-includes-list";

type FooterWordmark = HomePageContent["footerWordmark"];
type PricingSection = HomePageContent["pricingSection"];

export function PricingSectionBlock({
	pricingSection,
}: {
	pricingSection: PricingSection;
}) {
	return (
		<div id="pricing" className="mx-auto max-w-lg py-10 sm:py-12">
			<div className="mb-6 space-y-2 text-center">
				<Badge variant="outline">{pricingSection.label}</Badge>
				<h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
					{pricingSection.titleLead}{" "}
					{pricingSection.titleAccent}
				</h2>
				<p className="text-muted-foreground sm:text-lg">
					{pricingSection.intro}
				</p>
			</div>

			<Card className="flex flex-col gap-6 p-5 sm:p-6">
				<div className="space-y-1">
					<p className="text-xs font-medium text-muted-foreground">
						{pricingSection.eyebrow}
					</p>
					<p className="text-5xl font-bold tracking-tight tabular-nums">
						{pricingSection.priceDisplay}
					</p>
				</div>

				<PricingIncludesList items={pricingSection.includes} />

				<div className="flex flex-col gap-3">
					<CheckoutButton
						label={pricingSection.ctaTitle}
						className="h-12 w-full text-base font-semibold"
					/>
					<p className="text-center text-sm text-muted-foreground">
						{pricingSection.trustLine}
					</p>
					<p className="text-center text-xs text-muted-foreground">
						{pricingSection.guarantee}
					</p>
				</div>
			</Card>
		</div>
	);
}

export function FooterSection({
	footerWordmark,
}: {
	footerWordmark: FooterWordmark;
}) {
	return (
		<footer className="border-t py-8 sm:py-10" aria-label="Site footer">
			<div className="flex justify-center">
				<div className="flex items-center gap-3 rounded-full border border-border/70 bg-background/80 px-4 py-2">
					<span className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
						Theme
					</span>
					<MarketingThemeToggle />
				</div>
			</div>
			<div className="flex justify-center px-2 pt-8 text-center sm:pt-10 md:pt-12">
				<p
					className={`${productWordmarkFontClassName} text-balance text-[clamp(4.5rem,18vw,12rem)] font-normal uppercase leading-[0.82] tracking-[0.05em] text-foreground/90`}
				>
					{footerWordmark}
				</p>
			</div>
		</footer>
	);
}
