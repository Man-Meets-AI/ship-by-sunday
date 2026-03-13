import Image from "next/image";
import Link from "next/link";
import { CheckoutButton } from "@/components/checkout-button";
import { redirectEntitledHomeVisitor } from "@/lib/server/course-access";
import FAQAccordion from "./faq-accordion";

const proofImage = "/founder-proof.jpg";
const missionImage = "/product/mission-bg.png";

const outcomes = [
	"A clear scoped product brief",
	"A build-ready screen plan",
	"A working deployed v1",
	"A live link you can share",
];

const reframeCards = [
	{
		title: "Code is faster than ever",
		description:
			"AI can generate far more code than most builders can reliably direct.",
	},
	{
		title: "Product judgment is still hard",
		description:
			"You still have to decide what to build first, what to cut, and what makes the v1 worth shipping.",
	},
	{
		title: "Design direction is still hard",
		description:
			"You still need enough structure on flows and screens to avoid building a confusing product.",
	},
	{
		title: "Scattered execution kills momentum",
		description:
			"Most unfinished projects die because the thinking is spread across too many tabs, docs, prompts, and half-decisions.",
	},
];

const trinityCards = [
	{
		name: "Product strategy",
		prompt: "What should I build first? What do I cut?",
		description:
			"Start with the user, the problem, and the tightest v1 you can actually finish.",
	},
	{
		name: "Design",
		prompt: "What should this feel like? What needs to exist on each screen?",
		description:
			"Map the flow, define the screens, and create enough direction that the build does not drift.",
	},
	{
		name: "Development",
		prompt: "How do I actually get this built and live without spiraling?",
		description:
			"Turn the plan into a working app, keep the core flow intact, and get it live without treating launch like a separate project.",
	},
];

const blocks = [
	{
		name: "CEO Block",
		eyebrow: "01",
		hover: ["Scope the right app", "Define the MVP clearly"],
		summary: "Make the right thing before you make the thing right.",
		description:
			"Most people fail early because they pick a weak problem, a vague user, or too much scope.",
		artifact: [
			"Clear problem and customer",
			"Tight MVP scope",
			"Core user flow defined",
			"One-page product brief",
		],
	},
	{
		name: "Design Block",
		eyebrow: "02",
		hover: ["Map the core flow", "Plan what gets built"],
		summary: "Turn the idea into something concrete enough to build.",
		description:
			"AI is fast, but it still needs direction. Map the flow, plan the screens, and define enough visual direction to build cleanly.",
		artifact: [
			"Screen map",
			"User journey",
			"Rough wireframes",
			"Build-ready spec",
		],
	},
	{
		name: "Build Block",
		eyebrow: "03",
		hover: ["Use AI to implement", "Get the v1 working"],
		summary: "Use AI to implement the product without getting lost.",
		description:
			"Set up the stack, brief the agent properly, and build the core flow without spiraling.",
		artifact: [
			"App running locally",
			"Core flow built",
			"Agent brief dialed in",
			"Main screens working",
		],
	},
	{
		name: "Ship Block",
		eyebrow: "04",
		hover: ["Deploy it live", "Leave with a real link"],
		summary: "Get it live, get it seen, and stop sitting on unfinished work.",
		description:
			"Most people never ship because launch feels like a separate project. Deploy the app, package it, and take the first step toward real feedback.",
		artifact: [
			"Live deployed app",
			"Shareable link",
			"Demo asset",
			"First launch plan",
		],
	},
];

const audienceCards = [
	{
		title: "You can already get things working",
		description:
			"You have enough fluency to prototype, test ideas, and get something moving.",
	},
	{
		title: "You keep ending up with rough demos instead of real products",
		description:
			"The problem is not starting. The problem is finishing something coherent enough to ship.",
	},
	{
		title: "You do not need more theory",
		description:
			"You need a cleaner process for scoping, designing, building, and deploying without getting lost in the middle.",
	},
	{
		title:
			"You need better product judgment, design direction, and execution structure",
		description:
			"That is the gap between a rough prototype and a real v1 people can actually use.",
	},
];

const offerGroups = [
	{
		name: "Ship by Sunday workspace",
		description:
			"Keeps product thinking, design direction, and build execution in one place.",
	},
	{
		name: "Guided weekend sprint",
		description:
			"The 4-block path that takes you from rough idea to shipped v1.",
	},
	{
		name: "On-demand walkthroughs + workbook",
		description:
			"Practical support, prompts, templates, and checklists that keep each block moving.",
	},
	{
		name: "Product Management for Beginners",
		description:
			"Included bonus for builders who do not trust their product judgment yet.",
	},
];

const workspacePreviews = [
	{
		name: "CEO Block",
		src: "/product/block-ceo.png",
		description: "Scope the right app before you start building.",
	},
	{
		name: "Design Block",
		src: "/product/block-design.png",
		description: "Turn the plan into screens, flows, and build direction.",
	},
	{
		name: "Build Block",
		src: "/product/block-build.png",
		description: "Keep the implementation focused on the real v1.",
	},
	{
		name: "Ship Block",
		src: "/product/block-ship.png",
		description: "Get it live and stop sitting on unfinished work.",
	},
];

const proofPoints = [
	"10 years in product, from design to engineering",
	"Scaled Delivery Dudes to $73M GMV and a $23M acquisition",
	"Built GPTs for Devs to 100K users in its first week",
	"Taught 110+ students through Vibe with AI",
];

const faqs = [
	{
		question: "Who is this for?",
		answer:
			"Builders who can already prototype or get things working, but keep getting stuck before they ship a real v1.",
	},
	{
		question: "Is this a coding course?",
		answer:
			"No. Coding is part of the process, but Ship by Sunday is really about getting product strategy, design, and development to work together so something real ships.",
	},
	{
		question: "Do I need product experience?",
		answer:
			"No. But if product judgment feels like your weak spot, Product Management for Beginners is included as a bonus.",
	},
	{
		question: "Do I need to be good at design?",
		answer:
			"No. You need enough design direction to make a usable, coherent v1. This is not about becoming a professional designer in a weekend.",
	},
	{
		question: "Why does the workspace matter?",
		answer:
			"Because scattered execution kills momentum. Ship by Sunday keeps product thinking, design direction, and build execution in one place so you are not juggling random tabs and half-decisions.",
	},
	{
		question: "What kind of app is a good fit for this?",
		answer:
			"Scoped web apps, MVPs, narrow tools, and practical products are the best fit. It is not for giant multi-system startup ideas.",
	},
];

const pricingIncludes = [
	"Ship by Sunday workspace",
	"4-block sprint",
	"On-demand walkthroughs",
	"Workbook + prompts",
	"Product Management for Beginners bonus",
	"Lifetime access",
];

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
								Log in
							</Link>
						</div>

						<div className="mb-5 flex w-full items-center justify-between gap-4 text-[11px] font-bold uppercase tracking-[0.26em] text-ink/65 sm:text-xs">
							<span>One weekend</span>
							<span className="font-display text-2xl tracking-[0.08em] text-ink">
								MMAI
							</span>
							<span>Prototype to v1</span>
						</div>

						<h1 className="font-display text-[3rem] uppercase leading-[0.84] tracking-[-0.04em] text-ink sm:text-[7rem] lg:text-[8.4rem]">
							Turn rough prototypes
							<span className="block text-ink sm:inline sm:pl-4 sm:text-white sm:[text-shadow:-2px_-2px_0_#111,2px_-2px_0_#111,-2px_2px_0_#111,2px_2px_0_#111]">
								into real v1s
							</span>
						</h1>

						<p className="mt-5 max-w-3xl text-pretty text-base font-medium leading-relaxed text-ink/80 sm:text-xl">
							Ship by Sunday is a software-guided weekend sprint for builders
							who can already prototype, but need product judgment, design
							direction, and execution structure to ship a real v1.
						</p>

						<div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
							<CheckoutButton
								label="Get instant access"
								className="sbs-hover-lift inline-flex min-w-full items-center justify-center border border-line bg-ink px-6 py-4 font-display text-[2rem] uppercase tracking-[0.04em] text-paper sm:min-w-72 sm:px-8 sm:text-3xl"
							/>
							<a
								href="#how-it-works"
								className="sbs-hover-lift sbs-press-feedback inline-flex min-w-full items-center justify-center border border-line bg-white px-6 py-4 font-display text-[2rem] uppercase tracking-[0.04em] text-ink sm:min-w-72 sm:px-8 sm:text-3xl"
							>
								See how it works
							</a>
						</div>

						<p className="mt-5 text-sm font-semibold text-ink/70 sm:text-base">
							Workspace + sprint + on-demand walkthroughs + lifetime access
						</p>
					</div>
				</section>

				<SectionFrame className="grid gap-4 lg:grid-cols-[2fr_1fr]">
					<div>
						<SectionLabel>Outcomes</SectionLabel>
						<h2 className="mt-3 font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
							By Sunday you&apos;ll have
						</h2>
					</div>
					<div className="flex items-end">
						<p className="max-w-sm text-sm font-semibold leading-relaxed text-ink/75 sm:text-base">
							Not more theory. Four concrete outputs you&apos;ll use
							immediately.
						</p>
					</div>
					<div className="grid gap-[1px] border border-line bg-line lg:col-span-2 lg:grid-cols-4">
						{outcomes.map((item) => (
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
						<SectionLabel>Why Builders Get Stuck</SectionLabel>
						<h2 className="mt-3 max-w-4xl font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
							Why builders who can already code still don&apos;t ship
						</h2>
					</div>
					<div className="flex items-end">
						<p className="max-w-md text-sm font-semibold leading-relaxed text-ink/75 sm:text-base">
							Development is no longer the main bottleneck. Product clarity and
							design clarity now matter more because code is faster and cheaper
							than ever.
						</p>
					</div>
					<div className="grid gap-[1px] border border-line bg-line lg:col-span-2 lg:grid-cols-4">
						{reframeCards.map((card) => (
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
					<SectionLabel>Mechanism</SectionLabel>
					<div className="mt-3 max-w-4xl">
						<h2 className="font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
							The Product Trinity
						</h2>
						<p className="mt-3 max-w-3xl text-pretty text-base font-medium leading-relaxed text-ink/75 sm:text-xl">
							Shipping is not just a coding problem. It is a coordination
							problem across product strategy, design, and development.
						</p>
					</div>

					<div className="mt-8 grid gap-[1px] border border-line bg-line lg:grid-cols-3">
						{trinityCards.map((card) => (
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
						Ship by Sunday gives you a workspace and sprint built to keep those
						three parts moving together.
					</p>
				</SectionFrame>

				<SectionFrame id="system" className="relative overflow-hidden">
					<div className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-line/15 lg:block" />
					<SectionLabel>Sprint Path</SectionLabel>
					<div className="mt-3 max-w-4xl">
						<h2 className="font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
							The 4-block path to a real v1
						</h2>
						<p className="mt-3 max-w-3xl text-pretty text-base font-medium leading-relaxed text-ink/75 sm:text-xl">
							The Product Trinity explains why people stay stuck. The 4-block
							sprint is how Ship by Sunday gets you unstuck.
						</p>
					</div>

					<div className="mt-8 grid gap-[1px] border border-line bg-line lg:grid-cols-4">
						{blocks.map((block) => (
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
									Hover or tap for the rest below
								</p>
							</article>
						))}
					</div>
				</SectionFrame>

				<section className="bg-accent px-6 py-10 text-center text-paper shadow-card">
					<h2 className="font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
						Not more content.
						<span className="block">A better process.</span>
					</h2>
					<p className="mx-auto mt-4 max-w-3xl text-pretty text-base leading-relaxed text-paper/80 sm:text-xl">
						Each block ends with a real artifact. You are not buying another
						theory library. You are buying a system for turning rough prototypes
						into something real.
					</p>
				</section>

				<div className="grid gap-4 lg:grid-cols-[320px_1fr]">
					<SectionFrame className="lg:sticky lg:top-4 lg:self-start">
						<SectionLabel>Block deep dive</SectionLabel>
						<h2 className="mt-4 font-display text-[2.8rem] uppercase leading-[0.82] tracking-[-0.04em] sm:text-[3.6rem]">
							The sprint
						</h2>
						<p className="mt-4 text-base leading-relaxed text-ink/75">
							The mechanism explains why builders get stuck. This section shows
							how the sprint actually gets them moving.
						</p>
					</SectionFrame>

					<div className="grid gap-[1px] border border-line bg-line">
						{blocks.map((block) => (
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
												Outcomes
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
							Built for builders
							<span className="block text-ink sm:text-white sm:[text-shadow:-2px_-2px_0_#111,2px_-2px_0_#111,-2px_2px_0_#111,2px_2px_0_#111]">
								who can already prototype
							</span>
						</h2>
					</div>
					<div className="flex items-end border border-line p-5">
						<p className="text-base leading-relaxed text-ink/75 sm:text-lg">
							Not for total beginners. Not for giant multi-system startup ideas.
						</p>
					</div>
					<div className="grid gap-[1px] border border-line bg-line lg:col-span-2 lg:grid-cols-2">
						{audienceCards.map((card) => (
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
								<SectionLabel>What you get</SectionLabel>
								<h2 className="mt-3 font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
									The stack
								</h2>
							</div>
							<span className="font-display text-3xl uppercase sm:text-4xl">
								{offerGroups.length}
							</span>
						</div>

						<div className="mt-4 grid gap-[1px] border border-line bg-line">
							{offerGroups.map((item) => (
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
							<SectionLabel>Inside Ship by Sunday</SectionLabel>
							<h2 className="mt-3 font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
								Everything under one roof
							</h2>
							<p className="mt-4 max-w-xl text-base leading-relaxed text-ink/75 sm:text-lg">
								You will not be juggling docs, prompts, templates, and random
								tabs. Ship by Sunday keeps product thinking, design direction,
								and build execution in one place.
							</p>
						</div>

						<div className="relative min-h-[18rem] overflow-hidden border border-line bg-ink">
							<Image
								src={missionImage}
								alt="Ship by Sunday workspace preview"
								fill
								className="object-cover opacity-85"
								sizes="(max-width: 1024px) 100vw, 42vw"
							/>
						</div>

						<div className="grid gap-[1px] border border-line bg-line sm:grid-cols-2">
							{workspacePreviews.map((preview) => (
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
							<SectionLabel>Built by someone who ships</SectionLabel>
							<div className="mt-4 space-y-[1px] bg-line">
								{proofPoints.map((point) => (
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
							This is not theory from the sidelines. It is a system shaped by
							years of shipping products, tools, and MVPs in public.
						</p>
					</SectionFrame>

					<SectionFrame className="flex flex-col gap-6">
						<div className="relative min-h-[24rem] overflow-hidden border border-line bg-ink">
							<Image
								src={proofImage}
								alt="Founder proof visual"
								fill
								className="object-cover opacity-90"
								sizes="(max-width: 1024px) 100vw, 40vw"
							/>
						</div>
						<p className="text-sm leading-relaxed text-ink/70 sm:text-base">
							Built by someone who has moved from design to engineering to
							product and knows what it takes to turn rough ideas into shippable
							products.
						</p>
					</SectionFrame>
				</div>

				<div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
					<SectionFrame>
						<FAQAccordion items={faqs} />
					</SectionFrame>

					<SectionFrame className="flex items-center justify-center">
						<div className="text-center">
							<SectionLabel>FAQ</SectionLabel>
							<h2 className="mt-3 font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
								Common
								<span className="block">Questions</span>
							</h2>
						</div>
					</SectionFrame>
				</div>

				<div id="pricing" className="grid gap-4 lg:grid-cols-[1fr_1.05fr]">
					<section className="border border-line bg-accent px-6 py-8 text-paper shadow-card">
						<SectionLabel>Ship by Sunday</SectionLabel>
						<h2 className="mt-4 font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
							Go from idea to v1
							<span className="block">this weekend</span>
						</h2>
						<p className="mt-4 max-w-md text-base leading-relaxed text-paper/80 sm:text-lg">
							A software-guided weekend sprint for builders who can already
							prototype, but need a better system to ship a real v1.
						</p>
						<div className="mt-8 text-6xl font-semibold tracking-[-0.05em] sm:text-7xl">
							$500
						</div>
						<p className="mt-4 max-w-sm text-sm font-semibold uppercase tracking-[0.1em] text-paper/80">
							Immediate access. No subscription. Lifetime access.
						</p>
					</section>

					<SectionFrame className="flex flex-col">
						<SectionLabel>One-time payment</SectionLabel>
						<h2 className="mt-4 font-display text-[2.7rem] uppercase leading-[0.84] tracking-[-0.04em] sm:text-[5rem]">
							Get instant access
						</h2>
						<div className="mt-6 grid gap-[1px] border border-line bg-line">
							{pricingIncludes.map((item) => (
								<div key={item} className="grid grid-cols-[56px_1fr] bg-white">
									<div className="grid place-items-center border-r border-line text-2xl">
										✓
									</div>
									<div className="px-4 py-4 text-lg font-semibold">{item}</div>
								</div>
							))}
						</div>

						<div className="mt-6 text-6xl font-semibold tracking-[-0.04em]">
							$500
						</div>

						<CheckoutButton
							label="Get instant access"
							className="sbs-hover-lift mt-6 inline-flex items-center justify-center border border-line bg-ink px-6 py-4 font-display text-[2rem] uppercase tracking-[0.04em] text-paper sm:text-3xl"
						/>

						<p className="mt-6 max-w-lg text-sm font-semibold uppercase leading-relaxed tracking-[0.08em] text-ink/70">
							Complete the CEO Block within 14 days. If you do not leave with a
							clear One-Page Product Brief and a tighter MVP scope, email us and
							we will refund you.
						</p>
					</SectionFrame>
				</div>

				<section className="grid gap-[1px] border border-line bg-line shadow-card sm:grid-cols-3">
					{[
						"Home",
						"Ship by Sunday",
						"The AI Primer",
						"Blog",
						"Shop",
						"Instagram",
					].map((item) => (
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
						Ship by Sunday
					</p>
				</footer>
			</div>
		</main>
	);
}
