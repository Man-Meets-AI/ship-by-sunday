import Image from "next/image";
import Link from "next/link";
import { CheckoutButton } from "@/features/checkout/components/checkout-button";
import { ProductBrand } from "@/shared/branding/product-brand";
import { homePageContent } from "@/features/marketing/content/home";
import { redirectEntitledHomeVisitor } from "@/features/course/access/server/course-access";
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
		<section
			id={id}
			className={`border border-line bg-white px-5 py-6 shadow-card sm:px-8 sm:py-8 ${className}`}
		>
			{children}
		</section>
	);
}

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<p className="font-sans text-xs font-bold uppercase tracking-[0.24em] text-ink/70">
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
		<main className="bg-paper text-ink">
			<div className="mx-auto flex min-h-screen max-w-[1280px] flex-col gap-4 px-3 py-3 sm:px-5 sm:py-5">
				<section className="border border-line bg-white px-4 py-4 shadow-card sm:px-6 sm:py-5">
					<div className="mx-auto flex max-w-5xl flex-col items-center text-center">
						<div className="mb-4 flex w-full justify-end">
							<Link
								href="/sign-in"
								className="sbs-hover-lift sbs-press-feedback inline-flex border border-line bg-white px-4 py-2 font-display text-2xl uppercase tracking-[0.04em] text-ink"
							>
								{hero.loginLabel}
							</Link>
						</div>

						<div className="mb-5 flex w-full items-center justify-between gap-4 text-[11px] font-bold uppercase tracking-[0.26em] text-ink/65 sm:text-xs">
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

						<h1 className="font-display text-[3rem] uppercase leading-[0.84] tracking-[-0.04em] text-ink sm:text-[7rem] lg:text-[8.4rem]">
							{hero.headlineLead}{" "}
							<span className="sbs-hero-outline block text-ink sm:inline sm:pl-4 sm:text-white">
								{hero.headlineAccent}
							</span>
						</h1>

						<p className="mt-5 max-w-3xl text-pretty text-base font-medium leading-relaxed text-ink/80 sm:text-xl">
							{hero.body}
						</p>

						<div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
							<CheckoutButton
								label={hero.primaryCta}
								className="sbs-hover-lift inline-flex min-w-full items-center justify-center border border-line bg-ink px-6 py-4 font-display text-[2rem] uppercase tracking-[0.04em] text-paper sm:min-w-72 sm:px-8 sm:text-3xl"
							/>
							<a
								href="#how-it-works"
								className="sbs-hover-lift sbs-press-feedback inline-flex min-w-full items-center justify-center border border-line bg-white px-6 py-4 font-display text-[2rem] uppercase tracking-[0.04em] text-ink sm:min-w-72 sm:px-8 sm:text-3xl"
							>
								{hero.secondaryCta}
							</a>
						</div>

						<p className="mt-5 text-sm font-semibold text-ink/70 sm:text-base">
							{hero.eyebrow}
						</p>
					</div>
				</section>

				<SectionFrame className="grid gap-4 lg:grid-cols-[2fr_1fr]">
					<div>
						<SectionLabel>{outcomesSection.label}</SectionLabel>
						<h2 className="mt-3 font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
							{outcomesSection.title}
						</h2>
					</div>
					<div className="flex items-end">
						<p className="max-w-sm text-sm font-semibold leading-relaxed text-ink/75 sm:text-base">
							{outcomesSection.intro}
						</p>
					</div>
					<div className="grid gap-[1px] border border-line bg-line lg:col-span-2 lg:grid-cols-4">
						{outcomesSection.items.map((item) => (
							<div
								key={item}
								className="flex min-h-40 items-end bg-white p-5 font-sans text-lg font-semibold uppercase leading-tight tracking-[0.02em]"
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
						<p className="max-w-md text-sm font-semibold leading-relaxed text-ink/75 sm:text-base">
							{whyBuildersGetStuck.intro}
						</p>
					</div>
					<div className="grid gap-[1px] border border-line bg-line lg:col-span-2 lg:grid-cols-4">
						{whyBuildersGetStuck.cards.map((card) => (
							<div key={card.title} className="bg-white p-5">
								<p className="font-display text-[1.7rem] uppercase leading-[0.9] tracking-[-0.03em] sm:text-[2.2rem]">
									{card.title}
								</p>
								<p className="mt-4 text-sm font-medium leading-relaxed text-ink/75 sm:text-base">
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
						<p className="mt-3 max-w-3xl text-pretty text-base font-medium leading-relaxed text-ink/75 sm:text-xl">
							{mechanismSection.intro}
						</p>
					</div>

					<div className="mt-8 grid gap-[1px] border border-line bg-line lg:grid-cols-3">
						{mechanismSection.cards.map((card) => (
							<article key={card.name} className="bg-white p-5 sm:p-6">
								<p className="font-display text-[2.1rem] uppercase leading-none tracking-[-0.03em] sm:text-[2.8rem]">
									{card.name}
								</p>
								<p className="mt-5 text-base font-black uppercase leading-tight tracking-[0.04em] text-ink/85 sm:text-lg">
									{card.prompt}
								</p>
								<p className="mt-4 text-sm font-medium leading-relaxed text-ink/75 sm:text-base">
									{card.description}
								</p>
							</article>
						))}
					</div>

					<p className="mt-6 max-w-3xl text-base font-semibold leading-relaxed text-ink/80 sm:text-lg">
						{mechanismSection.footer}
					</p>
				</SectionFrame>

				<SectionFrame id="system" className="relative overflow-hidden">
					<div className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-line/15 lg:block" />
					<SectionLabel>{sprintPathSection.label}</SectionLabel>
					<div className="mt-3 max-w-4xl">
						<h2 className="font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
							{sprintPathSection.title}
						</h2>
						<p className="mt-3 max-w-3xl text-pretty text-base font-medium leading-relaxed text-ink/75 sm:text-xl">
							{sprintPathSection.intro}
						</p>
					</div>

					<div className="mt-8 grid gap-[1px] border border-line bg-line lg:grid-cols-4">
						{sprintPathSection.blocks.map((block) => (
							<article
								key={block.name}
								className="group flex min-h-[18rem] flex-col justify-between bg-white p-5 transition-colors duration-200 lg:hover:bg-ink lg:hover:text-paper"
							>
								<div className="flex items-center justify-between gap-3">
									<span className="font-display text-[2rem] uppercase leading-none transition-colors duration-200 sm:text-3xl lg:group-hover:text-paper">
										{block.name}
									</span>
									<span className="text-sm font-light text-ink/60 transition-colors duration-200 lg:group-hover:text-paper/65">
										{block.eyebrow}
									</span>
								</div>

								<div className="mt-6 space-y-2 border-t border-line/25 pt-4 transition-colors duration-200 lg:border-transparent lg:pt-8 lg:group-hover:border-paper/25">
									<p className="font-sans text-base font-medium text-ink/85 transition-all duration-200 lg:translate-y-3 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-hover:text-paper">
										{block.hover[0]}
									</p>
									<p className="font-sans text-base font-medium text-ink/85 transition-all duration-200 lg:translate-y-3 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 lg:group-hover:text-paper">
										{block.hover[1]}
									</p>
								</div>

								<p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-ink/45 transition-colors duration-200 lg:group-hover:text-paper/55">
									{sprintPathSection.cardHint}
								</p>
							</article>
						))}
					</div>
				</SectionFrame>

				<section className="bg-accent px-6 py-10 text-center text-paper shadow-card">
					<h2 className="font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
						{processCallout.titleLead}
						<span className="block">{processCallout.titleAccent}</span>
					</h2>
					<p className="mx-auto mt-4 max-w-3xl text-pretty text-base leading-relaxed text-paper/80 sm:text-xl">
						{processCallout.body}
					</p>
				</section>

				<div className="grid gap-4 lg:grid-cols-[320px_1fr]">
					<SectionFrame className="lg:sticky lg:top-4 lg:self-start">
						<SectionLabel>{sprintPathSection.deepDiveLabel}</SectionLabel>
						<h2 className="mt-4 font-display text-[2.8rem] uppercase leading-[0.82] tracking-[-0.04em] sm:text-[3.6rem]">
							{sprintPathSection.deepDiveTitle}
						</h2>
						<p className="mt-4 text-base leading-relaxed text-ink/75">
							{sprintPathSection.deepDiveIntro}
						</p>
					</SectionFrame>

					<div className="grid gap-[1px] border border-line bg-line">
						{sprintPathSection.blocks.map((block) => (
							<SectionFrame key={block.name} className="shadow-none">
								<div className="grid gap-6 lg:grid-cols-[180px_1fr]">
									<div className="border border-line p-4">
										<p className="text-sm font-light text-ink/50">
											{block.eyebrow}
										</p>
										<h3 className="mt-2 font-display text-[2.8rem] uppercase leading-none tracking-[-0.04em]">
											{block.name}
										</h3>
									</div>
									<div>
										<p className="text-xl font-medium leading-tight text-ink sm:text-4xl">
											{block.summary}
										</p>
										<p className="mt-4 max-w-3xl text-base leading-relaxed text-ink/75 sm:text-lg">
											{block.description}
										</p>
										<div className="mt-6 border border-line">
											<div className="border-b border-line px-4 py-3 text-xs font-bold uppercase tracking-[0.24em] text-ink/55">
												{sprintPathSection.outcomesLabel}
											</div>
											<div className="grid gap-[1px] bg-line md:grid-cols-2">
												{block.artifact.map((item) => (
													<div
														key={item}
														className="bg-white px-4 py-5 text-sm font-black uppercase tracking-[0.06em] sm:text-base"
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
					<div className="border border-line p-5">
						<h2 className="font-display text-[2.6rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
							{audienceSection.titleLead}
							<span className="sbs-hero-outline block text-ink sm:text-white">
								{audienceSection.titleAccent}
							</span>
						</h2>
					</div>
					<div className="flex items-end border border-line p-5">
						<p className="text-base leading-relaxed text-ink/75 sm:text-lg">
							{audienceSection.intro}
						</p>
					</div>
					<div className="grid gap-[1px] border border-line bg-line lg:col-span-2 lg:grid-cols-2">
						{audienceSection.cards.map((card) => (
							<div key={card.title} className="bg-white p-5">
								<p className="font-display text-[2rem] uppercase leading-[0.88] tracking-[-0.03em] sm:text-[2.8rem]">
									{card.title}
								</p>
								<p className="mt-4 text-sm font-medium leading-relaxed text-ink/75 sm:text-base">
									{card.description}
								</p>
							</div>
						))}
					</div>
				</SectionFrame>

				<div className="grid gap-4 lg:grid-cols-[1.05fr_1fr]">
					<SectionFrame>
						<div className="flex items-end justify-between gap-4 border-b border-line pb-4">
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

						<div className="mt-4 grid gap-[1px] border border-line bg-line">
							{offerSection.items.map((item) => (
								<div key={item.name} className="bg-white p-5">
									<p className="font-display text-[1.55rem] uppercase leading-none tracking-[0.03em] sm:text-[2.4rem]">
										{item.name}
									</p>
									<p className="mt-3 max-w-xl text-sm font-medium leading-relaxed text-ink/75 sm:text-base">
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
							<p className="mt-4 max-w-xl text-base leading-relaxed text-ink/75 sm:text-lg">
								{offerSection.insideIntro}
							</p>
						</div>

						<div className="relative min-h-[18rem] overflow-hidden border border-line bg-ink">
							<Image
								src={missionImage}
								alt={offerSection.missionAlt}
								fill
								className="object-cover opacity-85"
								sizes="(max-width: 1024px) 100vw, 42vw"
							/>
						</div>

						<div className="grid gap-[1px] border border-line bg-line sm:grid-cols-2">
							{offerSection.workspacePreviews.map((preview) => (
								<div key={preview.name} className="bg-white">
									<div className="relative min-h-[8rem] border-b border-line">
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
										<p className="mt-3 text-sm font-medium leading-relaxed text-ink/75">
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
						<div className="border border-line p-4">
							<SectionLabel>{proofSection.label}</SectionLabel>
							<div className="mt-4 space-y-[1px] bg-line">
								{proofSection.points.map((point) => (
									<div
										key={point}
										className="bg-white px-4 py-4 text-base font-semibold leading-relaxed sm:text-lg"
									>
										{point}
									</div>
								))}
							</div>
						</div>
						<p className="text-sm leading-relaxed text-ink/70 sm:text-base">
							{proofSection.intro}
						</p>
					</SectionFrame>

					<SectionFrame className="flex flex-col gap-6">
						<div className="relative min-h-[24rem] overflow-hidden border border-line bg-ink">
							<Image
								src={proofImage}
								alt={proofSection.imageAlt}
								fill
								className="object-cover opacity-90"
								sizes="(max-width: 1024px) 100vw, 40vw"
							/>
						</div>
						<p className="text-sm leading-relaxed text-ink/70 sm:text-base">
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
					<section className="border border-line bg-accent px-6 py-8 text-paper shadow-card">
						<SectionLabel>{pricingSection.label}</SectionLabel>
						<h2 className="mt-4 font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
							{pricingSection.titleLead}
							<span className="block">{pricingSection.titleAccent}</span>
						</h2>
						<p className="mt-4 max-w-md text-base leading-relaxed text-paper/80 sm:text-lg">
							{pricingSection.intro}
						</p>
						<div className="mt-8 text-6xl font-semibold tracking-[-0.05em] sm:text-7xl">
							{pricingSection.priceDisplay}
						</div>
						<p className="mt-4 max-w-sm text-sm font-semibold uppercase tracking-[0.1em] text-paper/80">
							{pricingSection.eyebrow}
						</p>
					</section>

					<SectionFrame className="flex flex-col">
						<SectionLabel>{pricingSection.paymentLabel}</SectionLabel>
						<h2 className="mt-4 font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
							{pricingSection.ctaTitle}
						</h2>
						<div className="mt-6 grid gap-[1px] border border-line bg-line">
							{pricingSection.includes.map((item) => (
								<div key={item} className="grid grid-cols-[56px_1fr] bg-white">
									<div className="grid place-items-center border-r border-line text-2xl">
										✓
									</div>
									<div className="px-4 py-4 text-lg font-semibold">{item}</div>
								</div>
							))}
						</div>

						<div className="mt-6 text-6xl font-semibold tracking-[-0.04em]">
							{pricingSection.priceDisplay}
						</div>

						<CheckoutButton
							label={pricingSection.ctaTitle}
							className="sbs-hover-lift mt-6 inline-flex items-center justify-center border border-line bg-ink px-6 py-4 font-display text-[2rem] uppercase tracking-[0.04em] text-paper sm:text-3xl"
						/>

						<p className="mt-6 max-w-lg text-sm font-semibold uppercase leading-relaxed tracking-[0.08em] text-ink/70">
							{pricingSection.guarantee}
						</p>
					</SectionFrame>
				</div>

				<section className="grid gap-[1px] border border-line bg-line shadow-card sm:grid-cols-3">
					{footerNav.map((item) => (
						<div
							key={item}
							className="bg-white px-5 py-5 text-sm font-bold uppercase tracking-[0.2em] text-ink/75"
						>
							{item}
						</div>
					))}
				</section>

				<footer className="border border-line bg-white px-5 py-10 text-center shadow-card sm:px-8">
					<p className="font-display text-[3.4rem] uppercase leading-[0.82] tracking-[-0.05em] text-ink sm:text-[9rem]">
						{footerWordmark}
					</p>
				</footer>
			</div>
		</main>
	);
}
