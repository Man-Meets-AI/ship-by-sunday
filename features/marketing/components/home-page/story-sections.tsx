import Image from "next/image";

import type { HomePageContent } from "@/features/marketing/content/home";
import { publicDividerGridClassName } from "@/shared/ui/public-surface";

import { SectionFrame, SectionLabel } from "./section-shell";

type AudienceSection = HomePageContent["audienceSection"];
type MechanismSection = HomePageContent["mechanismSection"];
type OfferSection = HomePageContent["offerSection"];

export function MechanismStorySection({
	mechanismSection,
}: {
	mechanismSection: MechanismSection;
}) {
	return (
		<SectionFrame className="relative overflow-hidden">
			<SectionLabel>{mechanismSection.label}</SectionLabel>
			<div className="mt-3 max-w-4xl">
				<h2 className="font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
					{mechanismSection.title}
				</h2>
				<p className="mt-3 max-w-3xl text-pretty text-base font-medium leading-relaxed text-product-muted sm:text-xl">
					{mechanismSection.intro}
				</p>
			</div>
			<div className={`mt-8 ${publicDividerGridClassName} lg:grid-cols-3`}>
				{mechanismSection.cards.map((card) => (
					<article key={card.name} className="bg-product-surface p-5 sm:p-6">
						<p className="font-display text-[2.1rem] uppercase leading-none tracking-[-0.03em] sm:text-[2.8rem]">
							{card.name}
						</p>
						<p className="mt-5 text-base font-black uppercase leading-tight tracking-[0.04em] text-product-text sm:text-lg">
							{card.prompt}
						</p>
						<p className="mt-4 text-sm font-medium leading-relaxed text-product-muted sm:text-base">
							{card.description}
						</p>
					</article>
				))}
			</div>
			<p className="mt-6 max-w-3xl text-base font-semibold leading-relaxed text-product-muted sm:text-lg">
				{mechanismSection.footer}
			</p>
		</SectionFrame>
	);
}

export function AudienceFitSection({
	audienceSection,
}: {
	audienceSection: AudienceSection;
}) {
	return (
		<SectionFrame className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
			<div className="border border-product-border/60 p-5">
				<h2 className="font-display text-[2.6rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
					{audienceSection.titleLead}
					<span className="sbs-hero-outline block text-product-text sm:text-product-bg">
						{audienceSection.titleAccent}
					</span>
				</h2>
			</div>
			<div className="flex items-end border border-product-border/60 p-5">
				<p className="text-base leading-relaxed text-product-muted sm:text-lg">
					{audienceSection.intro}
				</p>
			</div>
			<div
				className={`${publicDividerGridClassName} lg:col-span-2 lg:grid-cols-2`}
			>
				{audienceSection.cards.map((card) => (
					<div key={card.title} className="bg-product-surface p-5">
						<p className="font-display text-[2rem] uppercase leading-[0.88] tracking-[-0.03em] sm:text-[2.8rem]">
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

export function OfferStackSection({
	missionImage,
	offerSection,
}: {
	missionImage: HomePageContent["assets"]["missionImage"];
	offerSection: OfferSection;
}) {
	return (
		<div className="grid gap-4 lg:grid-cols-[1.05fr_1fr]">
			<SectionFrame>
				<div className="flex items-end justify-between gap-4 border-b border-product-border/60 pb-4">
					<div>
						<SectionLabel>{offerSection.stackLabel}</SectionLabel>
						<h2 className="mt-3 font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
							{offerSection.stackTitle}
						</h2>
					</div>
					<span className="font-display text-3xl uppercase sm:text-4xl">
						{offerSection.items.length}
					</span>
				</div>
				<div className={`mt-4 ${publicDividerGridClassName}`}>
					{offerSection.items.map((item) => (
						<div key={item.name} className="bg-product-surface p-5">
							<p className="font-display text-[1.55rem] uppercase leading-none tracking-[0.03em] sm:text-[2.4rem]">
								{item.name}
							</p>
							<p className="mt-3 max-w-xl text-sm font-medium leading-relaxed text-product-muted sm:text-base">
								{item.description}
							</p>
						</div>
					))}
				</div>
			</SectionFrame>
			<SectionFrame className="flex flex-col gap-6">
				<div>
					<SectionLabel>{offerSection.insideLabel}</SectionLabel>
					<h2 className="mt-3 font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
						{offerSection.insideTitle}
					</h2>
					<p className="mt-4 max-w-xl text-base leading-relaxed text-product-muted sm:text-lg">
						{offerSection.insideIntro}
					</p>
				</div>
				<div className="relative min-h-[18rem] overflow-hidden border border-product-border/60 bg-product-accent">
					<Image
						src={missionImage}
						alt={offerSection.missionAlt}
						fill
						className="object-cover opacity-85"
						sizes="(max-width: 1024px) 100vw, 42vw"
					/>
				</div>
				<div className={`${publicDividerGridClassName} sm:grid-cols-2`}>
					{offerSection.workspacePreviews.map((preview) => (
						<div key={preview.name} className="bg-product-surface">
							<div className="relative min-h-[8rem] border-b border-product-border/60">
								<Image
									src={preview.src}
									alt={`${preview.name} workspace preview`}
									fill
									className="object-cover"
									sizes="(max-width: 640px) 100vw, 20vw"
								/>
							</div>
							<div className="p-4">
								<p className="font-display text-[1.6rem] uppercase leading-none tracking-[0.03em]">
									{preview.name}
								</p>
								<p className="mt-3 text-sm font-medium leading-relaxed text-product-muted">
									{preview.description}
								</p>
							</div>
						</div>
					))}
				</div>
			</SectionFrame>
		</div>
	);
}
