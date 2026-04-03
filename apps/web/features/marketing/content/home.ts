import { productConfig, routeConfig } from "@/config/product";
import {
	marketingDisplayConfig,
	workspaceDisplayConfig,
} from "@/features/starter/lib/starter-selectors";

const productName = productConfig.name;
const bonusName = productConfig.bonusName;

export const homePageContent = {
	assets: {
		socialProofImage: productConfig.images.founderProof,
	},
	hero: {
		docsLabel: marketingDisplayConfig.docsLabel,
		loginLabel: marketingDisplayConfig.loginLabel,
		headlineLead: "Ship a real product",
		headlineTailPrefix: "",
		headlineTailHover: "by Sunday",
		body: `The only system that teaches you how to ship a durable product from start to finish in one weekend. Oh, and it includes building you a ridiculous custom template from scratch based on what you want to build. We should charge more for this.`,
		primaryCta: marketingDisplayConfig.primaryCtaLabel,
		secondaryCta: {
			label: "See how Ship Blueprint works",
			href: routeConfig.systemHash,
		},
		eyebrow:
			"One-time payment. Lifetime access. Start the product intake immediately after checkout so the weekend starts with the real product constraints, not a blank chat.",
	},
	sprintPathSection: {
		label: "System",
		titlePrefix: "Most AI builds ",
		titleHighlight: "start with prompts.",
		intro:
			"The model is not the part that breaks first. The context is. Weekend AI builds drift because the product truth, scope, design direction, and launch claims live in scattered chats that go stale fast.",
		supportingPoints: [
			"Ship by Sunday captures the product truth first, then compiles contract-first docs packs for design, marketing, build execution, and prompting.",
			"The packs are file-based and agent-readable, so each tool works from the same scope, constraints, and claims instead of a stale chat summary.",
			"The same contract-first path feeds the starter system, so the repo, the docs, and the execution path stay aligned instead of drifting apart.",
		],
		valueFrame: "Most starters give you code. This gives you blueprint.",
		imageAlt:
			"Diagram showing a product definition turning into Design, Marketing, Build, and Prompt Packs plus a final Starter Snapshot",
	},
	socialProofSection: {
		label: "Built by someone who ships",
		intro:
			"This is not theory from the sidelines. It is a system shaped by years of shipping products, tools, and MVPs in public.",
		imageAlt: "Founder proof visual",
		imageCaption:
			"Built by someone who has moved from design to engineering to product and knows what it takes to turn rough ideas into shippable products.",
		github: {
			username: "ParkerRex",
			profileUrl: "https://github.com/ParkerRex",
			activityCaption:
				"commits this year. This system is built by someone who ships every day.",
		},
		stats: [
			{
				value: "$73M",
				label: "GMV scaled",
				description: "Delivery Dudes to a $23M acquisition",
			},
			{
				value: "100K",
				label: "Users in week one",
				description: "GPTs for Devs launch",
			},
		],
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
					"No. Ship by Sunday is a blueprint-first shipping system. The videos help you use it, and the starter repo is part of it, but the real product is the Ship Kit you leave with.",
			},
			{
				question: "What do I actually get at the end?",
				answer:
					"You leave with your product truth, the Agent-Ready Packs, and the Ship Kit: your Agent-First Starter Repo plus the generated design, marketing, build, and prompt materials.",
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
					"Technical builders and founder-operators who can get things working, but keep getting stuck between idea, prompts, code, and launch.",
			},
			{
				question: "Why not just use ChatGPT, Claude, or Codex directly?",
				answer:
					"You can. The problem is fragments. Ship Blueprint makes those tools work from one source of truth instead of stale chats and half-decisions.",
			},
			{
				question: "What happens right after I pay?",
				answer: `You go straight into the ${workspaceDisplayConfig.homeNoun} to lock the truth, compile the packs, and build your Ship Kit.`,
			},
		],
	},
	whatsInsideSection: {
		label: "By Sunday",
		title:
			"By Sunday, you leave with the product truth, the agent packs, and the starter path.",
		intro:
			"Enough clarity to build. Enough structure to hand off. No vague prompts, no half-decisions.",
		pillars: [
			{
				title: "The product truth",
				highlightBefore: "Lock ",
				highlight: "the right user, problem, scope, and promise",
				highlightAfter:
					" before code, so the build starts from something real.",
				supporting:
					"This is the clarity layer the rest of the weekend depends on.",
			},
			{
				title: "The packs",
				highlightBefore: "Leave with ",
				highlight: "Design, Marketing, Build, and Prompt Packs",
				highlightAfter:
					" that turn the same product truth into usable instructions.",
				supporting:
					"Each pack carries the context, constraints, and next actions that domain needs.",
			},
			{
				title: "The starter path",
				highlightBefore: "Review the ",
				highlight: "Starter Snapshot and starter system path",
				highlightAfter:
					" before execution, so you can verify the repo before handoff.",
				supporting:
					"This is a concrete build system, not random prompts and a hope-based plan.",
			},
		],
	},
	starterSystemSection: {
		title: "More than a starter. A system you can keep shipping from.",
		titleLines: [
			"More than a starter.",
			"A system you can",
			"keep shipping from.",
		],
		intro:
			"The blueprint gives the agents the truth. The starter gives that truth a real product shape: auth, billing, docs, protected workspace, and the seams to keep changing the product without losing the plot.",
		capabilities: [
			{
				title: "Product blueprint",
				description:
					"Start from a repo already shaped around your product, not a dead template you have to reinterpret every session.",
			},
			{
				title: "Built-in QA",
				description:
					"Smoke paths, QA prompts, and incident alerts are already in the repo, so shipping does not turn into guesswork the moment something breaks.",
			},
			{
				title: "Safer agent changes",
				description:
					"Guidance for Clerk, Convex, Stripe, Next.js, React, and Vercel helps agents make changes inside real constraints instead of blind file surgery.",
			},
		],
		supportSection: {
			title: "The support around the system",
			intro:
				"The starter is the core. You also get the guidance that helps you use it well under real weekend pressure.",
			items: [
				"Fast Pass Walkthroughs",
				"Guided Ship Path",
				"Product Sense Fundamentals",
			],
			bonus: {
				title: bonusName,
				description:
					"If product judgment is still the weak point, the included bonus strengthens the decisions behind the build without bloating the core offer.",
			},
		},
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
					"The Starter Snapshot gives you a final downloadable handoff that is easier to trust, review, and reuse than scattered prompt history.",
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
			"One payment for Ship Blueprint: the guided blueprint-first run, the Agent-Ready Packs, the Agent-First Starter Repo, and the guidance that keeps you shipping after the first weekend.",
		priceDisplay: productConfig.priceDisplay,
		eyebrow: "One-time payment. Lifetime access.",
		ctaTitle: "Get the system",
		trustLine: `After checkout, you go straight into the ${workspaceDisplayConfig.homeNoun} to lock the truth, compile the packs, and build your Ship Kit.`,
		includes: [
			"Guided product intake and review workspace",
			"Agent-Ready Packs",
			"Agent-First Starter Repo",
			"Fast Pass Walkthroughs",
			"Guided Ship Path",
		],
		bonus: {
			label: "Also included",
			title: `Also included: ${bonusName}`,
			description:
				"If product judgment is still the weak spot, this stays in the bundle without becoming the point of the offer.",
		},
		guarantee:
			"Complete the Product stage within 14 days. If you do not leave with a clearer product definition and tighter v1 scope, email us and we will refund you.",
	},
	footerWordmark: productName,
} as const;

export type HomePageContent = typeof homePageContent;
