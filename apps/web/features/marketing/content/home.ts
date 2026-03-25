import { productConfig } from "@/config/product";
import {
	marketingDisplayConfig,
	workspaceDisplayConfig,
} from "@/features/starter/lib/starter-selectors";

const productName = productConfig.name;
const bonusName = productConfig.bonusName;

export const homePageContent = {
	assets: {
		heroPreviewImage: productConfig.images.heroPreview,
		socialProofImage: productConfig.images.founderProof,
	},
	hero: {
		docsLabel: marketingDisplayConfig.docsLabel,
		loginLabel: marketingDisplayConfig.loginLabel,
		headlineLead: "Turn one product idea",
		headlineTailPrefix: "into ",
		headlineTailHover: "Agent-Ready Packs",
		body: `${productName} is an OpenAI-derived, OpenAI-aligned system that turns one product idea into Agent-Ready Packs for design, marketing, and build execution, then generates a Starter Snapshot.`,
		outcomesHeading: "What you actually get",
		outcomes: [
			"A Design Pack for UI direction and constraints",
			"A Marketing Pack for positioning and launch messaging",
			"A Build Pack for milestones, validation, and handoff",
			"A Prompt Pack for marketing, implementation, QA, and deploy",
			"A Starter Snapshot review download",
		],
		primaryCta: marketingDisplayConfig.primaryCtaLabel,
		eyebrow:
			"One-time payment. Lifetime access. Start the product intake immediately after checkout.",
		previewImageAlt: marketingDisplayConfig.previewImageAlt,
	},
	sprintPathSection: {
		label: "System",
		titlePrefix: "Agents need ",
		titleHighlight: "durable context.",
		intro:
			"Most builders do not stall because the model cannot code. They stall because product scope, design direction, marketing claims, and build decisions live in scattered tabs that go stale fast.",
		supportingPoints: [
			"Ship by Sunday captures the core facts once, then compiles domain-specific packs for design, marketing, build execution, and prompting.",
			"The packs are file-based and agent-readable, so you can reuse the same project context across tools instead of rewriting it every session.",
			"The final Starter Snapshot gives you one review download to inspect before you hand the work to an agent or teammate.",
		],
		valueFrame:
			"This is a shipping system for builders using agents. The output is durable execution context, not more scattered notes and one-off prompts.",
		imageLightSrc: "/agent-ready-packs-stack.svg",
		imageDarkSrc: "/agent-ready-packs-stack-dark.svg",
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
				value: "10+",
				label: "Years in product",
				description: "From design to engineering",
			},
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
			{
				value: "110+",
				label: "Students taught",
				description: "Through Vibe with AI",
			},
		],
		reachStats: [
			{
				value: "8+",
				label: "Years on YouTube",
				description: "Teaching product and AI building",
			},
			{
				value: "100s",
				label: "Builders coached",
				description: "Across paid sessions and product work",
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
				question: "Who is this for?",
				answer:
					"Builders who can already prototype or get things working, but keep getting stuck before they ship a real v1.",
			},
			{
				question: "What happens right after I pay?",
				answer: `If you are not signed in yet, you will sign in first. After Stripe checkout, you will land on the success page while access finalizes. As soon as it is ready, you will be sent into the ${workspaceDisplayConfig.homeNoun} to start the product intake.`,
			},
			{
				question: "Is this a coding course?",
				answer: `It includes walkthroughs, but ${productName} is not a course wrapper. It is a guided system that captures the right facts, compiles the packs, and helps you ship with better context.`,
			},
			{
				question: "What if I already know a lot of this?",
				answer: `Then the value is not more theory. The value is reusable context. ${productName} gives you one durable source of truth, domain-specific packs, and a tighter path from idea to execution.`,
			},
			{
				question: "What if I buy this and still do not finish?",
				answer:
					"The system is built to force clarity before code. If you complete the Product stage within 14 days and still do not leave with a clearer product definition and tighter v1 scope, email us and we will refund you.",
			},
			{
				question: "What kind of app is a good fit for this?",
				answer:
					"Scoped web apps, MVPs, narrow tools, and practical products are the best fit. It is not for giant multi-system startup ideas.",
			},
			{
				question: "How long do I get access?",
				answer: "Lifetime access. One payment, no subscription.",
			},
			{
				question: "Do I need product experience?",
				answer: `No. But if product judgment feels like your weak spot, ${bonusName} is included as a bonus.`,
			},
			{
				question: "Do I need to be good at design?",
				answer:
					"No. You need enough design direction to make a usable, coherent v1. The Design Pack is there to give you that direction without pretending you need to become a professional designer first.",
			},
			{
				question: "Why does the workspace matter?",
				answer: `Because scattered context kills momentum. ${productName} keeps product facts, pack generation, and review in one place so you are not juggling random tabs and half-decisions.`,
			},
			{
				question: "What are Agent-Ready Packs?",
				answer:
					"They are file-based packs for design, marketing, build execution, and prompting. Each pack gives an agent durable context in one domain instead of forcing you to restate the whole project every time.",
			},
			{
				question: "What is the Prompt Pack?",
				answer:
					"It is the set of ready-to-run prompts for marketing, implementation, QA, and deploy. You can paste them directly into your agent workflow instead of building that prompt stack from scratch.",
			},
			{
				question: "What is the Starter Snapshot?",
				answer:
					"It is the final review download. You get the compiled pack tree and the generated project snapshot in one bundle you can inspect, download, and hand off.",
			},
			{
				question: "What do the walkthroughs actually show?",
				answer:
					"They show the full pack system in action on a real build, so you can see how the intake, pack generation, and execution flow work together from start to finish.",
			},
			{
				question: "Do I have to use the same stack as the example build?",
				answer:
					"No. The example build shows the process in action. You can apply the same system to the stack that fits your app.",
			},
		],
	},
	whatsInsideSection: {
		label: "What's inside",
		title: "One intake, four packs, and a final Starter Snapshot.",
		intro:
			"The system captures your product facts once, compiles the packs, and gives you a clean review download instead of another pile of disconnected notes.",
		pillars: [
			{
				title: "One canonical product definition",
				highlightBefore: "Capture ",
				highlight: "the core facts once",
				highlightAfter:
					" so your product summary, user, problem, scope, and outcome stop drifting across docs, prompts, and half-finished plans.",
				supporting:
					"The packs compile from this shared source of truth instead of relying on scattered notes.",
				imagePlaceholder: "/placeholder-workshop.svg",
				imageAlt: "Product definition intake",
			},
			{
				title: "Four Agent-Ready Packs",
				highlightBefore: "Compile ",
				highlight: "Design, Marketing, Build, and Prompt Packs",
				highlightAfter:
					" from the same product definition so each domain gets the context, constraints, and next actions it actually needs.",
				supporting:
					"Each pack is file-based, domain-specific, and ready to hand to an agent or teammate.",
				imagePlaceholder: "/placeholder-workspace.svg",
				imageAlt: "Agent-ready packs overview",
			},
			{
				title: "Starter Snapshot review download",
				highlightBefore: "Finish with a ",
				highlight: "Starter Snapshot",
				highlightAfter:
					" that bundles the generated pack tree and project snapshot into one reviewable handoff you can inspect before execution.",
				supporting:
					"Walkthroughs and the PM bonus help you use the system well, but the deliverable is the compiled handoff itself.",
				imagePlaceholder: "/placeholder-template.svg",
				imageAlt: "Starter Snapshot download preview",
			},
		],
	},
	durabilitySection: {
		label: "Durability",
		title: "Agents will change. Your packs still work.",
		intro:
			"The goal is not to win one prompt session. The goal is to keep the project context reusable as models, tools, and teammates change around you.",
		items: [
			{
				title: "Stable facts first",
				description:
					"The system compiles from one shared product definition, so new tools inherit the same user, problem, scope, and outcome constraints instead of starting from a blank chat.",
			},
			{
				title: "File-based by design",
				description:
					"Each pack is real documentation, checklists, plans, and prompts you can reopen, diff, and hand to another agent later. The value survives beyond one session.",
			},
			{
				title: "One review handoff",
				description:
					"The Starter Snapshot gives you a final downloadable handoff that is easier to trust, review, and reuse than scattered prompt history.",
			},
		],
		closing:
			"When better models arrive, you rerun the system with better tools. You do not restart the project from zero.",
	},
	pricingSection: {
		label: productName,
		titleLead: "Turn one idea into",
		titleAccent: "Agent-Ready Packs",
		intro:
			"One payment for the intake, the compilation system, the walkthroughs, and the final Starter Snapshot.",
		priceDisplay: productConfig.priceDisplay,
		eyebrow: "One-time payment. Lifetime access. No subscription.",
		ctaTitle: "Get instant access",
		trustLine: `After checkout, your access finishes syncing and you go straight into the ${workspaceDisplayConfig.homeNoun} to start the intake and compile your packs.`,
		includes: [
			"Guided intake and review workspace",
			"Design Pack",
			"Marketing Pack",
			"Build Pack",
			"Prompt Pack",
			"Starter Snapshot download",
			"Walkthroughs showing the full system in action",
			`25-video ${bonusName} bonus`,
			"Lifetime access",
		],
		guarantee:
			"Complete the Product stage within 14 days. If you do not leave with a clearer product definition and tighter v1 scope, email us and we will refund you.",
	},
	footerWordmark: productName,
} as const;

export type HomePageContent = typeof homePageContent;
