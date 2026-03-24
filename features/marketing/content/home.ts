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
		proofImage: productConfig.images.founderProof,
	},
	hero: {
		docsLabel: marketingDisplayConfig.docsLabel,
		loginLabel: marketingDisplayConfig.loginLabel,
		headlineLead: "Go from app idea",
		headlineTailPrefix: "to live v1 ",
		headlineTailHover: "by Sunday",
		body: "One guided weekend sprint. Four blocks. One real outcome.",
		outcomesHeading: "You leave the weekend with",
		outcomes: [
			"A one-page product brief",
			"A screen-by-screen build plan",
			"A working first version",
			"A live link you can share",
		],
		primaryCta: marketingDisplayConfig.primaryCtaLabel,
		eyebrow:
			"One-time payment. Lifetime access. Start immediately after checkout.",
		previewImageAlt: marketingDisplayConfig.previewImageAlt,
	},
	sprintPathSection: {
		label: "Sprint Path",
		titlePrefix: "Coding is not ",
		titleHighlight: "the bottleneck.",
		intro:
			"Most builders do not get stuck because they cannot code. They get stuck because product scope, design direction, execution order, and shipping decisions all break down at once.",
		supportingPoints: [
			"We cover the full path: product thinking, design decisions, AI coding, and the final push to ship.",
			"You get the starter template, exact agent instructions, and the subagents and skills to move faster without guessing.",
			"Each block gives you a concrete output so you stop collecting ideas and start finishing the right version.",
		],
		valueFrame:
			"Think of it like a $2,500 product workshop, a build template, and a guided masterclass in product, design, and AI coding all in one.",
	},
	proofSection: {
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
				label: "Paid workshop members",
				description: "Weekly sessions with builders worldwide",
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
				answer: `If you are not signed in yet, you will sign in first. After Stripe checkout, you will land on the success page while access finalizes. As soon as it is ready, you will be sent into the ${workspaceDisplayConfig.homeNoun} to start the sprint.`,
			},
			{
				question: "Is this a coding course?",
				answer: `It includes walkthroughs, but ${productName} is not just a video course. It is a guided workspace built to help you scope, design, build, and ship a real v1.`,
			},
			{
				question: "What if I already know a lot of this?",
				answer: `Then the value is not more theory. The value is the structure. ${productName} gives you a clean sequence, concrete outputs, and a tighter path from idea to shipped version so you actually finish.`,
			},
			{
				question: "What if I buy this and still do not finish?",
				answer:
					"The sprint is built around four blocks and concrete outputs so you keep moving. If you complete the CEO Block within 14 days and do not leave with a clear One-Page Product Brief and tighter MVP scope, email us and we will refund you.",
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
					"No. You need enough design direction to make a usable, coherent v1. This is not about becoming a professional designer in a weekend.",
			},
			{
				question: "Why does the workspace matter?",
				answer: `Because scattered execution kills momentum. ${productName} keeps product thinking, design direction, and build execution in one place so you are not juggling random tabs and half-decisions.`,
			},
			{
				question: "What is the starter template?",
				answer:
					"It is a ready-to-use starting point inside the system that helps you skip blank-page paralysis and start moving immediately.",
			},
			{
				question: "What are the Codex instructions?",
				answer:
					"They are exact paste-ready instructions you can use to move through the design and build process faster without having to figure out every prompt from scratch.",
			},
			{
				question: "What do the walkthroughs actually show?",
				answer:
					"They show the full system in action on a real build, so you can see how the process works from start to finish instead of trying to piece it together yourself.",
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
		title: "A workshop, a workspace, and a starter template.",
		intro:
			"Three layers designed to get you from raw idea to live product without the usual scramble.",
		pillars: [
			{
				title: "29 guided lessons across 4 blocks",
				highlightBefore: "Walk through ",
				highlight: "29 guided lessons",
				highlightAfter:
					" organized into four progressive blocks: CEO, Design, Build, and Ship. Each block unlocks the next and ends with a concrete deliverable, not just another video to watch.",
				supporting:
					"Video walkthroughs, AI coach, checklists, and artifact capture at every step.",
				imagePlaceholder: "/placeholder-workshop.svg",
				imageAlt: "Workshop lesson interface",
			},
			{
				title: "Software-guided workspace with 30 modes",
				highlightBefore: "Work inside a ",
				highlight: "software-guided workspace",
				highlightAfter:
					" with 30 interactive workbench modes: guided forms, scoring tables, collector boards, sketch uploads, brief assemblers, and deploy handoffs. Real-time progress tracking keeps you moving.",
				supporting:
					"Every deliverable is captured as an artifact. No more scattered docs and half-decisions.",
				imagePlaceholder: "/placeholder-workspace.svg",
				imageAlt: "Workspace workbench interface",
			},
			{
				title: "Production-ready starter template",
				highlightBefore: "Clone a ",
				highlight: "production-ready template",
				highlightAfter:
					" wired with Next.js, Convex, Clerk, Stripe, and Vercel. Auth, database, payments, and deploy are already connected. Paste-ready Codex subagent instructions and skills handle the AI-assisted building.",
				supporting:
					"30+ pages of docs, GitHub starter repo with automated invite, and a 25-video PM bonus course included.",
				imagePlaceholder: "/placeholder-template.svg",
				imageAlt: "Starter template code and stack",
			},
		],
	},
	pricingSection: {
		label: productName,
		titleLead: "Go from idea to v1",
		titleAccent: "this weekend",
		intro: "A guided weekend sprint to scope, build, and ship your v1.",
		priceDisplay: productConfig.priceDisplay,
		eyebrow: "One-time payment. Lifetime access. No subscription.",
		ctaTitle: "Get instant access",
		trustLine: `After checkout, your access finishes syncing and you go straight into the ${workspaceDisplayConfig.homeNoun} to start.`,
		includes: [
			`${productName} guided workspace`,
			"4-block guided sprint",
			"Starter template",
			"Exact paste-ready Codex instructions",
			"30+ walkthroughs showing the full system in action",
			`25-video ${bonusName} bonus`,
			"Lifetime access",
		],
		guarantee:
			"Complete the CEO Block within 14 days. If you do not leave with a clear One-Page Product Brief and a tighter MVP scope, email us and we will refund you.",
	},
	footerWordmark: productName,
} as const;

export type HomePageContent = typeof homePageContent;
