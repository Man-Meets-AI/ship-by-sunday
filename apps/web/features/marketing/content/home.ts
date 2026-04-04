import { productConfig } from "@/config/product";
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
		body: "Stop building from stale chats, prompts, and half-decisions. Ship by Sunday helps you lock the blueprint first so product, design, prompts, and code stay aligned while you build.",
		primaryCta: marketingDisplayConfig.primaryCtaLabel,
		secondaryCta: {
			label: "See what you leave with",
			href: "#deliverables",
		},
		eyebrow:
			"For people who\u2019ve tried building a web app with AI and ended up with something messy or unusable.",
	},
	sprintPathSection: {
		label: "System",
		titlePrefix: "Most AI builds ",
		titleHighlight: "start with prompts. That is why they drift.",
		intro:
			"When prompts lead, the product keeps changing. UI, code, and build logic stop matching. Then auth, payments, database, and environments show up, and the whole thing turns fragile.",
		supportingPoints: [
			"The product definition keeps moving.",
			"Prompts, UI, and code stop matching.",
			"Real product requirements break the build.",
		],
		valueFrame:
			"This is not a code-generation problem. It is a blueprint problem.",
		imageAlt:
			"Diagram showing a product definition turning into Design, Marketing, Build, and Prompt Packs plus a final Blueprint",
	},
	mechanismSection: {
		steps: [
			"Lock the Product Truth",
			"Generate the Agent-Ready Packs",
			"Build from the Ship by Sunday Blueprint",
		],
		tagline: "One source of truth. No drift.",
	},
	socialProofSection: {
		label: "Built by someone who ships",
		headline: "Built by someone who has actually shipped products.",
		body: "Worked across UX, product, design, and engineering. Helped scale a startup to $73M/year. Stayed through acquisition. Ship by Sunday is new. The operating experience behind it is not.",
		screenshots: [
			{
				src: "/screenshots/product-truth.png",
				alt: "Product Truth screenshot showing locked buyer, problem, scope, and constraints",
			},
			{
				src: "/screenshots/agent-ready-packs.png",
				alt: "Agent-Ready Packs screenshot showing design, marketing, build, and prompt packs",
			},
			{
				src: "/screenshots/blueprint.png",
				alt: "Ship by Sunday Blueprint screenshot showing the source of truth the repo builds from",
			},
		],
		github: {
			username: "ParkerRex",
			profileUrl: "https://github.com/ParkerRex",
			activityCaption:
				"commits this year. This system is built by someone who ships every day.",
		},
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
					"No. Ship by Sunday is a blueprint-first shipping system. The videos help you use it, and the repo is part of it, but the real product is the Blueprint you leave with.",
			},
			{
				question: "Who is this for?",
				answer:
					"Technical builders and founder-operators who have already tried building web apps with AI, can get code out of the tools, but keep ending up with messy or unusable results.",
			},
			{
				question: "What do I actually get at the end?",
				answer:
					"You leave with the Product Truth, the Agent-Ready Packs, and the Ship by Sunday Blueprint.",
			},
			{
				question: "I already have a starter. Why would I need this?",
				answer:
					"Because a starter without aligned context is still just code. The Blueprint gives your repo the packs and product truth that make AI useful instead of chaotic.",
			},
			{
				question: "Is this just more planning before coding?",
				answer:
					"No. The Blueprint is the minimum brief required to stop re-explaining the product every time you touch AI. The point is to move faster on the right thing.",
			},
			{
				question: "Why not just use ChatGPT, Claude, or Codex directly?",
				answer:
					"You can. The problem is fragments. The Blueprint makes those tools work from one source of truth instead of stale chats and half-decisions.",
			},
			{
				question: "What happens right after I pay?",
				answer: `You go straight into the ${workspaceDisplayConfig.homeNoun} to lock the truth, compile the packs, and shape your Blueprint.`,
			},
		],
	},
	whatsInsideSection: {
		label: "By Sunday",
		title:
			"By Sunday, you leave with the Product Truth, the Agent-Ready Packs, and the Ship by Sunday Blueprint.",
		intro:
			"Enough clarity to build. Enough structure to hand off. No vague prompts, no half-decisions.",
		pillars: [
			{
				title: "Product Truth",
				highlightBefore: "",
				highlight: "The buyer, problem, scope, and constraints",
				highlightAfter: " locked before the build drifts.",
				supporting:
					"This is the clarity layer the rest of the weekend depends on.",
			},
			{
				title: "Agent-Ready Packs",
				highlightBefore: "",
				highlight: "The design, build, marketing, and prompt context",
				highlightAfter: " that make AI useful instead of chaotic.",
				supporting:
					"Each pack carries the context, constraints, and next actions that domain needs.",
			},
			{
				title: "Ship by Sunday Blueprint",
				highlightBefore: "",
				highlight: "The source of truth",
				highlightAfter: " the repo can actually build from.",
				supporting: "One deliverable that ties everything together.",
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
				description: "So the build does not drift.",
			},
			{
				title: "Built-in QA",
				description: "So the app still works when the pieces connect.",
			},
			{
				title: "Saved agent changes",
				description: "So new prompts do not quietly rewrite the product.",
			},
		],
		supportSection: {
			title: "Support around the system",
			intro:
				"You also get workshops, a clear path to ask questions, and beginner-safe product management guidance when scope decisions get messy.",
			items: [
				"Fast Pass Walkthroughs",
				"Guided Ship Path",
				"Product Sense Fundamentals",
			],
			bonus: {
				title: bonusName,
				description:
					"If product judgment is still the weak spot, this stays in the bundle without becoming the point of the offer.",
			},
		},
	},
	durabilitySection: {
		label: "Durability",
		title: "Ship by Sunday. Keep shipping on Monday.",
		intro:
			"This is not a binge-and-forget course. Once you have the Product Truth, the Packs, and the Blueprint, you can reuse the system for the next feature, next product, or next workflow problem.",
		items: [
			{
				title: "Reuse the blueprint",
				description:
					"The same product definition feeds the next feature without starting from a blank chat.",
			},
			{
				title: "Extend without starting over",
				description:
					"The repo stays aligned to the same contract, so changes build on product truth instead of scattered edits.",
			},
			{
				title: "Keep one source of truth",
				description:
					"When better models arrive next month, you move faster. You do not restart the project from zero.",
			},
		],
		closing: "",
	},
	pricingSection: {
		label: productName,
		titleLead: "Ship a clean, coherent",
		titleAccent: "web app v1 by Sunday",
		intro:
			"Get the system that helps you lock the Product Truth, generate the Agent-Ready Packs, and build from one Blueprint instead of stale prompts and half-decisions.",
		priceDisplay: productConfig.priceDisplay,
		eyebrow: "One-time payment. Lifetime access.",
		ctaTitle: "Get Ship by Sunday",
		trustLine: "Go straight into the workspace.",
		includes: [
			"Guided product intake and review workspace",
			"Agent-Ready Packs",
			"Ship by Sunday Blueprint",
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
