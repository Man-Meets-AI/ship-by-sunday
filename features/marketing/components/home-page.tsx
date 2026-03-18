import Image from "next/image";
import Link from "next/link";
import { CheckoutButton } from "@/features/checkout/components/checkout-button";
import { ProductBrand } from "@/shared/branding/product-brand";
import { homePageContent } from "@/features/marketing/content/home";
import { redirectEntitledHomeVisitor } from "@/features/course/access/server/course-access";
import {
	PublicPageFrame,
	PublicSurfaceCard,
	publicDividerGridClassName,
	publicPrimaryActionClassName,
	publicSecondaryActionClassName,
} from "@/shared/ui/public-surface";
import FAQAccordion from "./faq-accordion";

const {
	assets: { proofImage, missionImage },
	hero,
	outcomesSection,
	whyBuildersGetStuck,
	mechanismSection,
	sprintPathSection,
	processCallout,
	audienceSection,
	offerSection,
	proofSection,
	faqSection,
	pricingSection,
	footerNav,
	footerWordmark,
} = homePageContent;

function SectionFrame({
	id,
	className = "",
	children,
}: {
	id?: string;
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<PublicSurfaceCard
			id={id}
			className={`px-5 py-6 sm:px-8 sm:py-8 ${className}`}
		>
			{children}
		</PublicSurfaceCard>
	);
}

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<p className="font-sans text-xs font-bold uppercase tracking-[0.24em] text-product-muted">
			{children}
		</p>
	);
}

export default async function Page({
	searchParams,
}: {
	searchParams?: Promise<{ marketing?: string }>;
}) {
	const resolvedSearchParams = searchParams ? await searchParams : undefined;
	const allowMarketing = resolvedSearchParams?.marketing === "1";
	await redirectEntitledHomeVisitor({ allowMarketing });

	return (
		<PublicPageFrame>
			<PublicSurfaceCard className="px-4 py-4 sm:px-6 sm:py-5">
					<div className="mx-auto flex max-w-5xl flex-col items-center text-center">
						<div className="mb-4 flex w-full justify-end">
							<Link
								href="/sign-in"
								className="sbs-hover-lift sbs-press-feedback inline-flex rounded-none border border-product-border bg-product-surface px-4 py-2 font-display text-2xl uppercase tracking-[0.04em] text-product-text transition-colors hover:bg-product-surface-alt focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-product-accent"
							>
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
							<div className="flex flex-col items-stretch">
								<a
									href="#how-it-works"
									className={`${publicSecondaryActionClassName} min-w-full sm:min-w-72 sm:px-8`}
								>
									{hero.secondaryCta}
								</a>
								<div className="min-h-6" aria-hidden="true" />
							</div>
						</div>

						<p className="mt-5 text-sm font-semibold text-product-muted sm:text-base">
							{hero.eyebrow}
						</p>
					</div>
			</PublicSurfaceCard>

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
					<div className={`${publicDividerGridClassName} lg:col-span-2 lg:grid-cols-4`}>
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
					<div className={`${publicDividerGridClassName} lg:col-span-2 lg:grid-cols-4`}>
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

				<SectionFrame id="how-it-works" className="relative overflow-hidden">
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

				<SectionFrame id="system" className="relative overflow-hidden">
					<div className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-product-border/20 lg:block" />
					<SectionLabel>{sprintPathSection.label}</SectionLabel>
					<div className="mt-3 max-w-4xl">
						<h2 className="font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
							{sprintPathSection.title}
						</h2>
						<p className="mt-3 max-w-3xl text-pretty text-base font-medium leading-relaxed text-product-muted sm:text-xl">
							{sprintPathSection.intro}
						</p>
					</div>

					<div className={`mt-8 ${publicDividerGridClassName} lg:grid-cols-4`}>
						{sprintPathSection.blocks.map((block) => (
							<article
								key={block.name}
								className="group flex min-h-[18rem] flex-col justify-between bg-product-surface p-5 transition-colors duration-200 lg:hover:bg-product-accent lg:hover:text-product-bg"
							>
								<div className="flex items-center justify-between gap-3">
									<span className="font-display text-[2rem] uppercase leading-none transition-colors duration-200 sm:text-3xl lg:group-hover:text-product-bg">
										{block.name}
									</span>
									<span className="text-sm font-light text-product-muted transition-colors duration-200 lg:group-hover:text-product-bg/70">
										{block.eyebrow}
									</span>
								</div>

								<div className="mt-6 space-y-2 border-t border-product-border/30 pt-4 transition-colors duration-200 lg:border-transparent lg:pt-8 lg:group-hover:border-product-bg/25">
									<p className="font-sans text-base font-medium text-product-text transition-all duration-200 lg:translate-y-3 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-hover:text-product-bg">
										{block.hover[0]}
									</p>
									<p className="font-sans text-base font-medium text-product-text transition-all duration-200 lg:translate-y-3 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-hover:text-product-bg">
										{block.hover[1]}
									</p>
								</div>

								<p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-product-muted transition-colors duration-200 lg:group-hover:text-product-bg/60">
									{sprintPathSection.cardHint}
								</p>
							</article>
						))}
					</div>
				</SectionFrame>

				<PublicSurfaceCard className="bg-product-accent px-6 py-10 text-center text-product-bg">
					<h2 className="font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
						{processCallout.titleLead}
						<span className="block">{processCallout.titleAccent}</span>
					</h2>
					<p className="mx-auto mt-4 max-w-3xl text-pretty text-base leading-relaxed text-product-bg/80 sm:text-xl">
						{processCallout.body}
					</p>
				</PublicSurfaceCard>

				<div className="grid gap-4 lg:grid-cols-[320px_1fr]">
					<SectionFrame className="lg:sticky lg:top-4 lg:self-start">
						<SectionLabel>{sprintPathSection.deepDiveLabel}</SectionLabel>
						<h2 className="mt-4 font-display text-[2.8rem] uppercase leading-[0.82] tracking-[-0.04em] sm:text-[3.6rem]">
							{sprintPathSection.deepDiveTitle}
						</h2>
						<p className="mt-4 text-base leading-relaxed text-product-muted">
							{sprintPathSection.deepDiveIntro}
						</p>
					</SectionFrame>

					<div className={publicDividerGridClassName}>
						{sprintPathSection.blocks.map((block) => (
							<SectionFrame key={block.name} className="shadow-none">
								<div className="grid gap-6 lg:grid-cols-[180px_1fr]">
									<div className="border border-product-border/60 p-4">
										<p className="text-sm font-light text-product-muted">
											{block.eyebrow}
										</p>
										<h3 className="mt-2 font-display text-[2.8rem] uppercase leading-none tracking-[-0.04em]">
											{block.name}
										</h3>
									</div>
									<div>
										<p className="text-xl font-medium leading-tight text-product-text sm:text-4xl">
											{block.summary}
										</p>
										<p className="mt-4 max-w-3xl text-base leading-relaxed text-product-muted sm:text-lg">
											{block.description}
										</p>
										<div className="mt-6 border border-product-border/60">
											<div className="border-b border-product-border/60 px-4 py-3 text-xs font-bold uppercase tracking-[0.24em] text-product-muted">
												{sprintPathSection.outcomesLabel}
											</div>
											<div className="grid gap-[1px] bg-product-border/35 md:grid-cols-2">
												{block.artifact.map((item) => (
													<div
														key={item}
														className="bg-product-surface px-4 py-5 text-sm font-black uppercase tracking-[0.06em] text-product-text sm:text-base"
													>
														{item}
													</div>
												))}
											</div>
										</div>
									</div>
								</div>
							</SectionFrame>
						))}
					</div>
				</div>

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
					<div className={`${publicDividerGridClassName} lg:col-span-2 lg:grid-cols-2`}>
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

				<div id="pricing" className="grid gap-4 lg:grid-cols-[1fr_1.05fr]">
					<PublicSurfaceCard className="bg-product-accent px-6 py-8 text-product-bg">
						<SectionLabel>{pricingSection.label}</SectionLabel>
						<h2 className="mt-4 font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
							{pricingSection.titleLead}
							<span className="block">{pricingSection.titleAccent}</span>
						</h2>
						<p className="mt-4 max-w-md text-base leading-relaxed text-product-bg/80 sm:text-lg">
							{pricingSection.intro}
						</p>
						<div className="mt-8 text-6xl font-semibold tracking-[-0.05em] sm:text-7xl">
							{pricingSection.priceDisplay}
						</div>
						<p className="mt-4 max-w-sm text-sm font-semibold uppercase tracking-[0.1em] text-product-bg/80">
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
								<div key={item} className="grid grid-cols-[56px_1fr] bg-product-surface">
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

						<p className="mt-6 max-w-lg text-sm font-semibold uppercase leading-relaxed tracking-[0.08em] text-product-muted">
							{pricingSection.guarantee}
						</p>
					</SectionFrame>
				</div>

				<PublicSurfaceCard className={`${publicDividerGridClassName} sm:grid-cols-3`}>
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
		</PublicPageFrame>
	);
}
