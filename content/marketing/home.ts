import { productConfig } from "@/config/product";

const productName = productConfig.name;
const bonusName = productConfig.bonusName;

export const homePageContent = {
	assets: {
		proofImage: productConfig.images.founderProof,
		missionImage: productConfig.images.missionPreview,
	},
	hero: {
		loginLabel: "Log in",
		topBarStart: "One weekend",
		topBarMark: productConfig.shortMark,
		topBarEnd: "Prototype to v1",
		headlineLead: "Turn rough prototypes",
		headlineAccent: "into real v1s",
		body: `${productName} is a guided workspace for builders who can already prototype, but need a clearer system to actually ship. You get a starter template, exact paste-ready Codex instructions, and 30+ walkthroughs showing the full system in action so you can go from idea to real v1 this weekend.`,
		primaryCta: "Get instant access",
		secondaryCta: "See how it works",
		eyebrow:
			"Guided workspace + starter template + exact paste-ready Codex instructions + 30+ walkthroughs",
	},
	outcomesSection: {
		label: "Outcomes",
		title: "By Sunday you'll have",
		intro: "Not more theory. Four concrete outputs you'll use immediately.",
		items: [
			"A clear scoped product brief",
			"A build-ready screen plan",
			"A working deployed v1",
			"A live link you can share",
		],
	},
	whyBuildersGetStuck: {
		label: "Why Builders Get Stuck",
		title: "Why builders who can already code still don't ship",
		intro:
			"Development is no longer the main bottleneck. Product clarity and design clarity now matter more because code is faster and cheaper than ever.",
		cards: [
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
		],
	},
	mechanismSection: {
		label: "Mechanism",
		title: "The Product Trinity",
		intro:
			"Shipping is not just a coding problem. It is a coordination problem across product strategy, design, and development.",
		footer: `${productName} gives you a workspace and sprint built to keep those three parts moving together.`,
		cards: [
			{
				name: "Product strategy",
				prompt: "What should I build first? What do I cut?",
				description:
					"Start with the user, the problem, and the tightest v1 you can actually finish.",
			},
			{
				name: "Design",
				prompt:
					"What should this feel like? What needs to exist on each screen?",
				description:
					"Map the flow, define the screens, and create enough direction that the build does not drift.",
			},
			{
				name: "Development",
				prompt: "How do I actually get this built and live without spiraling?",
				description:
					"Turn the plan into a working app, keep the core flow intact, and get it live without treating launch like a separate project.",
			},
		],
	},
	sprintPathSection: {
		label: "Sprint Path",
		title: "The 4-block path to a real v1",
		intro: `The Product Trinity explains why people stay stuck. The 4-block sprint is how ${productName} gets you unstuck.`,
		cardHint: "Hover or tap for the rest below",
		deepDiveLabel: "Block deep dive",
		deepDiveTitle: "The sprint",
		deepDiveIntro:
			"The mechanism explains why builders get stuck. This section shows how the sprint actually gets them moving.",
		outcomesLabel: "Outcomes",
		blocks: [
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
				summary:
					"Get it live, get it seen, and stop sitting on unfinished work.",
				description:
					"Most people never ship because launch feels like a separate project. Deploy the app, package it, and take the first step toward real feedback.",
				artifact: [
					"Live deployed app",
					"Shareable link",
					"Demo asset",
					"First launch plan",
				],
			},
		],
	},
	processCallout: {
		titleLead: "Not another course.",
		titleAccent: "A system you open and follow.",
		body: "Each block ends with a real artifact. You are not bouncing between random docs, prompts, and tabs. You are inside a guided workspace, following a structured path, and building something real.",
	},
	audienceSection: {
		titleLead: "Built for builders",
		titleAccent: "who can already prototype",
		intro: "Not for total beginners. Not for giant multi-system startup ideas.",
		cards: [
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
		],
	},
	offerSection: {
		stackLabel: "What you get",
		stackTitle: "The stack",
		insideLabel: `Inside ${productName}`,
		insideTitle: "Everything under one roof",
		insideIntro:
			"Everything is built to reduce friction. Instead of piecing together advice from scattered videos, notes, and prompts, you get one guided workspace that keeps product thinking, design direction, and execution moving together.",
		missionAlt: `${productName} workspace preview`,
		items: [
			{
				name: `${productName} guided workspace`,
				description:
					"A guided workspace that walks you through the sprint from rough idea to shipped v1.",
			},
			{
				name: "4-block guided sprint",
				description:
					"A clear path for scoping, designing, building, and shipping without losing momentum in the middle.",
			},
			{
				name: "Starter template",
				description:
					"A ready-to-use starting point so you are never stuck staring at a blank screen.",
			},
			{
				name: "Exact paste-ready Codex instructions",
				description:
					"Use the exact instructions you need to move fast in Figma and in the build without overthinking prompts.",
			},
			{
				name: "30+ walkthroughs showing the full system in action",
				description:
					"Watch the entire process used on a real build from first scope to live deployment.",
			},
			{
				name: bonusName,
				description:
					"A 25-video bonus course for builders who want stronger product judgment while they ship.",
			},
		],
		workspacePreviews: [
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
		],
	},
	proofSection: {
		label: "Built by someone who ships",
		intro:
			"This is not theory from the sidelines. It is a system shaped by years of shipping products, tools, and MVPs in public.",
		imageAlt: "Founder proof visual",
		imageCaption:
			"Built by someone who has moved from design to engineering to product and knows what it takes to turn rough ideas into shippable products.",
		points: [
			"10 years in product, from design to engineering",
			"Scaled Delivery Dudes to $73M GMV and a $23M acquisition",
			"Built GPTs for Devs to 100K users in its first week",
			"Taught 110+ students through Vibe with AI",
		],
	},
	faqSection: {
		label: "FAQ",
		titleLead: "Common",
		titleAccent: "Questions",
		items: [
			{
				question: "Who is this for?",
				answer:
					"Builders who can already prototype or get things working, but keep getting stuck before they ship a real v1.",
			},
			{
				question: "Is this a coding course?",
				answer: `It includes walkthroughs, but ${productName} is not just a video course. It is a guided workspace built to help you scope, design, build, and ship a real v1.`,
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
				question: "What kind of app is a good fit for this?",
				answer:
					"Scoped web apps, MVPs, narrow tools, and practical products are the best fit. It is not for giant multi-system startup ideas.",
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
	pricingSection: {
		label: productName,
		titleLead: "Go from idea to v1",
		titleAccent: "this weekend",
		intro:
			"A guided workspace, starter template, exact paste-ready Codex instructions, and 30+ walkthroughs showing the full system in action. Everything you need to go from rough prototype to shipped v1 this weekend.",
		priceDisplay: productConfig.priceDisplay,
		eyebrow: "Immediate access. No subscription. Lifetime access.",
		paymentLabel: "One-time payment",
		ctaTitle: "Get instant access",
		includes: [
			`${productName} guided workspace`,
			"4-block guided sprint",
			"Starter template",
			"Exact paste-ready Codex instructions",
			"30+ walkthroughs showing the full system in action",
			"25-video Product Management for Beginners bonus",
			"Lifetime access",
		],
		guarantee:
			"Complete the CEO Block within 14 days. If you do not leave with a clear One-Page Product Brief and a tighter MVP scope, email us and we will refund you.",
	},
	footerNav: [
		"Home",
		productName,
		"The AI Primer",
		"Blog",
		"Shop",
		"Instagram",
	],
	footerWordmark: productName,
} as const;
