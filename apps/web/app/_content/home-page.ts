import { productConfig, routeConfig } from "@/config/product";
import {
	marketingDisplayConfig,
	workspaceDisplayConfig,
} from "@/config/starter-selectors";

const productName = productConfig.name;
const activePricingOffer = productConfig.activeOffer;
const promoBanner = activePricingOffer
	? {
			label: activePricingOffer.label,
			message: `Get ${productName} for ${productConfig.checkoutPriceDisplay} instead of ${productConfig.priceDisplay}. ${activePricingOffer.percentOff}% off auto-applied at checkout, plus FULL TURBO free.`,
		}
	: null;
const pricingOfferBanner = activePricingOffer
	? {
			label: activePricingOffer.label,
			message: `${activePricingOffer.percentOff}% off the ${productConfig.priceDisplay} list price. Auto-applied at checkout.`,
		}
	: null;

export const homePageContent = {
	assets: {
		socialProofImage: productConfig.images.founderProof,
	},
	hero: {
		docsLabel: marketingDisplayConfig.docsLabel,
		loginLabel: marketingDisplayConfig.loginLabel,
		promoBanner,
		headlineLead: "Ship codebases",
		headlineTailPrefix: "",
		headlineTailHover: "that convert",
		body: "Turn phone-started ideas, async agent loops, and messy AI output into worker-ready context: product truth, role-specific packs, and a starter path agents can use to ship meaningful code.",
		primaryCta: marketingDisplayConfig.primaryCtaLabel,
		secondaryCta: {
			label: "See the worker path",
			href: routeConfig.systemHash,
		},
		eyebrow:
			"One-time payment. Lifetime access. Build the worker layer first so every product, design, marketing, build, and QA role acts from the same decisions.",
	},
	sprintPathSection: {
		label: "System",
		titlePrefix: "Agents need ",
		titleHighlight: "worker context.",
		intro:
			"If you want to start work from your phone and let agents ship meaningful code, the risk is not whether a model can write code. It is whether every role knows your decisions, standards, constraints, conversion promise, and next action.",
		supportingPoints: [
			"Ship by Sunday turns your product judgment into role-specific worker packs for product, design, marketing, build, and prompting, so each hat gets explicit decisions instead of vague instructions.",
			"Those packs are file-based and agent-readable, so Codex, DM-started workflows, and AFK loops can reuse the same source of truth without rebuilding context from chat history.",
			"The starter path keeps code, docs, CTA claims, and review steps aligned, so agent changes can compound toward a product that ships and converts.",
		],
		valueFrame: "Most starters give you code. This trains the worker layer.",
		imageAlt:
			"Diagram showing a product definition turning into Design, Marketing, Build, and Prompt Packs plus a final Blueprint",
	},
	mechanismSection: {
		steps: [
			"Lock the Product Truth",
			"Generate the Agent-Ready Packs",
			"Build from the Ship Kit",
		],
		tagline: "One source of truth. No drift.",
	},
	socialProofSection: {
		label: "Built by someone who ships",
		headline: "Built by someone who has actually shipped products.",
		body: "Worked across UX, product, design, and engineering. Helped scale a startup to $73M/year. Stayed through acquisition. Ship by Sunday is new. The operating experience behind it is not.",
	},
	faqSection: {
		label: "FAQ",
		titleLead: "Common",
		titleAccent: "Questions",
		lead: "",
		items: [
			{
				question: "Is this another course or another starter?",
				answer:
					"No. Ship by Sunday is a blueprint-first shipping system. The videos help you use it, and the repo is part of it, but the real product is the Ship by Sunday Blueprint you leave with.",
			},
			{
				question: "What do I actually get at the end?",
				answer:
					"You leave with your product truth, the Agent-Ready Packs, and the Ship by Sunday Blueprint.",
			},
			{
				question: "I already have a starter. Why would I need this?",
				answer:
					"Because a starter without aligned context is still just code. Ship by Sunday gives your repo the packs and product truth that make AI useful instead of chaotic.",
			},
			{
				question: "Is this just more planning before coding?",
				answer:
					"No. It is the minimum brief required to stop re-explaining the product every time you touch AI. The point is to move faster on the right thing.",
			},
			{
				question: "Who is this for?",
				answer:
					"Technical founders and operators who can get AI to produce code, but need a durable worker layer for phone-started loops, role-specific agents, and codebases that have to convert.",
			},
			{
				question: "Why not just use ChatGPT, Claude, or Codex directly?",
				answer:
					"You can. Ship by Sunday is the worker layer around those tools: one product truth, role-specific packs, and a starter path that keeps the codebase aligned.",
			},
			{
				question:
					"Can this help with Telegram, Discord, or phone-started agent loops?",
				answer:
					"Yes, if you are wiring those loops yourself. Ship by Sunday gives the code-side context those loops need: worker roles, product truth, QA prompts, and repo guidance that agents can reuse.",
			},
			{
				question: "What happens right after I pay?",
				answer: `You go straight into the ${workspaceDisplayConfig.homeNoun} to lock the truth, compile the packs, and shape your Blueprint.`,
			},
		],
	},
	whatsInsideSection: {
		label: "By Sunday",
		title: "Build the worker layer.",
		intro:
			"Enough judgment to build. Enough structure to hand off. No vague prompts, no half-decisions.",
		pillars: [
			{
				title: "The product truth",
				highlightBefore: "Lock ",
				highlight:
					"the user, offer, scope, conversion promise, and constraints",
				highlightAfter:
					" before code, so the build starts from something real.",
				supporting:
					"This is the judgment layer every worker role needs before agents touch the repo.",
			},
			{
				title: "The worker roles",
				highlightBefore: "Leave with ",
				highlight: "Product, Design, Marketing, Build, Prompt, and QA Packs",
				highlightAfter: " that train each hat you wear at the computer.",
				supporting:
					"Each role gets the context, constraints, and next actions it needs instead of inheriting a stale chat summary.",
			},
			{
				title: "The execution path",
				highlightBefore: "Review the ",
				highlight: "starter path for Codex and async agent loops",
				highlightAfter:
					" so work can start from your phone and still land in a real repo.",
				supporting:
					"This is a concrete build system for meaningful code changes, not random prompts and a hope-based plan.",
			},
		],
	},
	starterSystemSection: {
		title: "A worker layer your agents can build from.",
		titleLines: ["A worker layer.", "Your agents can", "build from."],
		intro:
			"The blueprint gives every worker role the truth. The starter gives that truth a real product shape: auth, billing, docs, protected workspace, QA paths, and repo guidance for agents running while you are AFK.",
		capabilities: [
			{
				title: "Worker blueprint",
				description:
					"Start from a repo already shaped around your decisions, not a dead template you have to reinterpret every session.",
			},
			{
				title: "Role-specific packs",
				description:
					"Product, design, marketing, build, prompt, and QA packs give each worker role a clear operating brief.",
			},
			{
				title: "Safer agent changes",
				description:
					"Guidance for Clerk, Convex, Stripe, Next.js, React, and Vercel helps agents make changes inside real constraints instead of blind file surgery.",
			},
			{
				title: "Async-ready context",
				description:
					"Use the same source of truth from Codex, phone prompts, or your own Telegram and Discord relays without rebuilding the brief.",
			},
			{
				title: "Built-in QA",
				description:
					"Smoke paths, QA prompts, and incident alerts are already in the repo, so shipping does not turn into guesswork the moment something breaks.",
			},
			{
				title: "Conversion-aware starter",
				description:
					"The homepage, docs, checkout claims, and review path stay aligned to the promise you are trying to sell.",
			},
			{
				title: "Curated design direction",
				description:
					"Choose a design direction like Vercel, Linear, or Notion inside the blueprint flow, preview it, then customize the starter theme before generation.",
			},
		],
	},
	durabilitySection: {
		label: "Durability",
		title: "Ship by Sunday. Keep shipping on Monday.",
		intro:
			"The goal is not a one-night demo. The goal is a product you improve as models, tools, and agents change around you.",
		items: [
			{
				title: "Stable facts first",
				description:
					"The system compiles from one shared product definition, so new tools inherit the same user, problem, scope, and outcome constraints instead of starting from a blank chat.",
			},
			{
				title: "Starter system, not dead template",
				description:
					"The repo stays configurable and aligned to the same contract, so the next change starts from product truth instead of random edits inside a stale starter.",
			},
			{
				title: "One review handoff",
				description:
					"The Ship by Sunday Blueprint gives you one final downloadable handoff that is easier to trust, review, and reuse than scattered prompt history.",
			},
		],
		closing:
			"When better models arrive next month, you move faster. You do not restart the project from zero.",
	},
	pricingSection: {
		label: productName,
		titleLead: "Ship a real product",
		titleAccent: "by Sunday",
		intro:
			"One payment for the blueprint-first run that turns phone-started agent work into a reviewable codebase: product truth, worker roles, starter path, and QA prompts that keep the repo aligned.",
		priceDisplay: productConfig.checkoutPriceDisplay,
		originalPriceDisplay: activePricingOffer
			? productConfig.priceDisplay
			: null,
		offerPriceDisplay:
			activePricingOffer?.discountedPriceDisplay ??
			productConfig.checkoutPriceDisplay,
		offerBanner: pricingOfferBanner,
		eyebrow: "One-time payment. Lifetime access.",
		ctaTitle: "Get the blueprint",
		trustLine: `After checkout, you go straight into the ${workspaceDisplayConfig.homeNoun} to lock the truth, compile the packs, and shape your Blueprint.`,
		includes: [
			"Guided product intake and review workspace",
			"Agent-Ready Packs",
			"Worker-role setup for product, design, marketing, build, and QA",
			"Ship by Sunday Blueprint",
			"Fast Pass Walkthroughs",
			"Guided Ship Path",
			"Product Sense Fundamentals",
		],
		bonus: {
			label: "Additional bonus",
			title: "FREE BONUS: FULL TURBO",
			description:
				"Get FULL TURBO free with your purchase: a 30-video AI course that gives you the practical workflows, prompting patterns, and build reps to move faster after the weekend sprint.",
		},
	},
	footerWordmark: productName,
} as const;

export type HomePageContent = typeof homePageContent;
