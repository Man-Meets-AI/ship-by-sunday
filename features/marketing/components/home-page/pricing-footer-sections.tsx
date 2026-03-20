import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { CheckoutButton } from "@/features/checkout/components/checkout-button";
import type { HomePageContent } from "@/features/marketing/content/home";

import { PricingIncludesList } from "./pricing-includes-list";

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
					<Badge variant="outline">{pricingSection.label}</Badge>
					<h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
						{pricingSection.titleLead}
						<span className="block">{pricingSection.titleAccent}</span>
					</h2>
					<p className="max-w-md text-muted-foreground sm:text-lg">
						{pricingSection.intro}
					</p>
				</div>
				<Card>
					<CardContent className="space-y-2">
						<p className="text-xs font-medium text-muted-foreground">
							Investment
						</p>
						<p className="text-5xl font-bold tracking-tight tabular-nums sm:text-6xl">
							{pricingSection.priceDisplay}
						</p>
						<p className="text-sm text-muted-foreground">
							{pricingSection.eyebrow}
						</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<Badge variant="outline" className="w-fit">
						{pricingSection.paymentLabel}
					</Badge>
					<CardTitle className="text-xl font-semibold tracking-tight sm:text-2xl">
						{pricingSection.ctaTitle}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<PricingIncludesList items={pricingSection.includes} />
				</CardContent>
				<CardFooter className="flex-col items-stretch gap-5">
					<div>
						<p className="text-xs font-medium text-muted-foreground">
							Total due today
						</p>
						<p className="text-4xl font-bold tracking-tight tabular-nums sm:text-5xl">
							{pricingSection.priceDisplay}
						</p>
					</div>
					<CheckoutButton
						label={pricingSection.ctaTitle}
						className="h-12 w-full text-base font-semibold"
					/>
					<div className="space-y-3 text-muted-foreground">
						<p className="max-w-lg text-sm sm:text-base">
							{pricingSection.trustLine}
						</p>
						<p className="max-w-lg text-xs sm:text-sm">
							{pricingSection.guarantee}
						</p>
					</div>
				</CardFooter>
			</Card>
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
				className="flex flex-wrap justify-center gap-x-6 gap-y-3 border-t py-8 sm:gap-x-8 sm:py-10"
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
			<div className="flex justify-center px-2 py-10 text-center sm:py-14 md:py-16">
				<p className="text-balance text-4xl font-bold tracking-tight text-muted-foreground sm:text-5xl md:text-6xl">
					{footerWordmark}
				</p>
			</div>
		</>
	);
}
