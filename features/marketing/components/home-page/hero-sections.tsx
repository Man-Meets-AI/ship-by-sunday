import Link from "next/link";

import { routeConfig } from "@/config/product";
import { CheckoutButton } from "@/features/checkout/components/checkout-button";
import type { HomePageContent } from "@/features/marketing/content/home";
import { ProductBrand } from "@/shared/branding/product-brand";
import {
	publicDividerGridClassName,
	publicNavActionClassName,
	publicPrimaryActionClassName,
	publicSecondaryActionClassName,
	PublicSurfaceCard,
} from "@/shared/ui/public-surface";

import { SectionFrame, SectionLabel } from "./section-shell";

type Hero = HomePageContent["hero"];
type Outcomes = HomePageContent["outcomesSection"];
type WhyBuildersGetStuck = HomePageContent["whyBuildersGetStuck"];

export function HomeHeroSection({ hero }: { hero: Hero }) {
	return (
		<PublicSurfaceCard className="px-4 py-4 sm:px-6 sm:py-5">
			<div className="mx-auto flex max-w-5xl flex-col items-center text-center">
				<div className="mb-4 flex w-full justify-end gap-2">
					<Link href={routeConfig.docs} className={publicNavActionClassName}>
						{hero.docsLabel}
					</Link>
					<Link href={routeConfig.signIn} className={publicNavActionClassName}>
						{hero.loginLabel}
					</Link>
				</div>
				<div className="mb-5 flex w-full items-center justify-between gap-4 text-[11px] font-bold uppercase tracking-[0.26em] text-product-muted sm:text-xs">
					<span>{hero.topBarStart}</span>
					<ProductBrand
						href="/"
						priority
						showLabel={false}
						imageSize={44}
						className="justify-center"
						imageClassName="rounded-xl"
					/>
					<span>{hero.topBarEnd}</span>
				</div>
				<h1 className="font-display text-[3rem] uppercase leading-[0.84] tracking-[-0.04em] text-product-text sm:text-[7rem] lg:text-[8.4rem]">
					{hero.headlineLead}{" "}
					<span className="sbs-hero-outline block text-product-text sm:inline sm:pl-4 sm:text-product-bg">
						{hero.headlineAccent}
					</span>
				</h1>
				<p className="mt-5 max-w-3xl text-pretty text-base font-medium leading-relaxed text-product-muted sm:text-xl">
					{hero.body}
				</p>
				<div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
					<CheckoutButton
						label={hero.primaryCta}
						className={`${publicPrimaryActionClassName} min-w-full sm:min-w-72 sm:px-8`}
					/>
					<a
						href="#system"
						className={`${publicSecondaryActionClassName} min-w-full sm:min-w-72 sm:px-8`}
					>
						{hero.secondaryCta}
					</a>
				</div>
				<p className="mt-5 text-sm font-semibold text-product-muted sm:text-base">
					{hero.eyebrow}
				</p>
			</div>
		</PublicSurfaceCard>
	);
}

export function OutcomesSection({
	outcomesSection,
}: {
	outcomesSection: Outcomes;
}) {
	return (
		<SectionFrame className="grid gap-4 lg:grid-cols-[2fr_1fr]">
			<div>
				<SectionLabel>{outcomesSection.label}</SectionLabel>
				<h2 className="mt-3 font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
					{outcomesSection.title}
				</h2>
			</div>
			<div className="flex items-end">
				<p className="max-w-sm text-sm font-semibold leading-relaxed text-product-muted sm:text-base">
					{outcomesSection.intro}
				</p>
			</div>
			<div
				className={`${publicDividerGridClassName} lg:col-span-2 lg:grid-cols-4`}
			>
				{outcomesSection.items.map((item) => (
					<div
						key={item}
						className="flex min-h-40 items-end bg-product-surface p-5 font-sans text-lg font-semibold uppercase leading-tight tracking-[0.02em] text-product-text"
					>
						{item}
					</div>
				))}
			</div>
		</SectionFrame>
	);
}

export function WhyBuildersGetStuckSection({
	whyBuildersGetStuck,
}: {
	whyBuildersGetStuck: WhyBuildersGetStuck;
}) {
	return (
		<SectionFrame className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
			<div>
				<SectionLabel>{whyBuildersGetStuck.label}</SectionLabel>
				<h2 className="mt-3 max-w-4xl font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
					{whyBuildersGetStuck.title}
				</h2>
			</div>
			<div className="flex items-end">
				<p className="max-w-md text-sm font-semibold leading-relaxed text-product-muted sm:text-base">
					{whyBuildersGetStuck.intro}
				</p>
			</div>
			<div
				className={`${publicDividerGridClassName} lg:col-span-2 lg:grid-cols-4`}
			>
				{whyBuildersGetStuck.cards.map((card) => (
					<div key={card.title} className="bg-product-surface p-5">
						<p className="font-display text-[1.7rem] uppercase leading-[0.9] tracking-[-0.03em] sm:text-[2.2rem]">
							{card.title}
						</p>
						<p className="mt-4 text-sm font-medium leading-relaxed text-product-muted sm:text-base">
							{card.description}
						</p>
					</div>
				))}
			</div>
		</SectionFrame>
	);
}
