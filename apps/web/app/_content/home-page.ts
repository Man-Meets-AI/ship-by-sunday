import {
	DEFAULT_DESIGN_PRESET_ID,
	designPresetDefinitions,
} from "@shipbysunday/blueprint-compiler";
import {
	blueprintFieldHelperText,
	blueprintFieldLabel,
	blueprintFieldPlaceholder,
	getBlueprintFieldScaleDefinition,
} from "@shipbysunday/blueprint-presentation";
import { productConfig, routeConfig } from "@/config/product";
import {
	marketingDisplayConfig,
	workspaceDisplayConfig,
} from "@/config/starter-selectors";
import { blueprintPageSections } from "@/lib/blueprint-flow/blueprint-page-sections";

const productName = productConfig.name;
const activePricingOffer = productConfig.activeOffer;
const promoBanner = activePricingOffer
	? {
			label: activePricingOffer.label,
			message: `${productConfig.checkoutPriceDisplay} Pilot Member price. FULL TURBO included.`,
		}
	: null;
const pricingOfferBanner = activePricingOffer
	? {
			label: activePricingOffer.label,
			message: `${productConfig.checkoutPriceDisplay} Pilot Member price. Auto-applied at checkout.`,
		}
	: null;

const interactiveBlueprintDemoSectionIds = [
	"foundation",
	"design",
	"pricing",
] as const;

type BlueprintDemoSectionStatus = "interactive" | "locked";

const productPreviewSections = blueprintPageSections.map((section) => ({
	id: section.id,
	label: section.label,
	description: section.description,
	status: (interactiveBlueprintDemoSectionIds.includes(
		section.id as (typeof interactiveBlueprintDemoSectionIds)[number],
	)
		? "interactive"
		: "locked") as BlueprintDemoSectionStatus,
}));

type ProductPreviewAccent = { light: string; dark: string };

const FALLBACK_ACCENT: ProductPreviewAccent = {
	light: "#71717A",
	dark: "#A1A1AA",
};

const productPreviewPresetAccentColors: Record<string, ProductPreviewAccent> = {
	vercel: { light: "#111111", dark: "#FAFAFA" },
	linear: { light: "#5E6AD2", dark: "#7C8AF7" },
	notion: { light: "#37352F", dark: "#E8E6E1" },
	stripe: { light: "#635BFF", dark: "#8E88FF" },
	supabase: { light: "#3FCF8E", dark: "#3FCF8E" },
	framer: { light: "#0099FF", dark: "#3FB6FF" },
	raycast: { light: "#FF6363", dark: "#FF8A8A" },
	cursor: { light: "#0DBC79", dark: "#22D38A" },
};

type ProductPreviewFontSpecimen = {
	family: string;
	fontStack: string;
	sample: string;
};

type ProductPreviewLogoDarkMode = "invert" | "preserve";

const productPreviewPresetLogoDarkModes: Record<
	string,
	ProductPreviewLogoDarkMode
> = {
	vercel: "invert",
	linear: "preserve",
	notion: "invert",
	stripe: "preserve",
	supabase: "preserve",
	framer: "invert",
	raycast: "invert",
	cursor: "invert",
};

const productPreviewPresetFontSpecimens: Record<
	string,
	ProductPreviewFontSpecimen
> = {
	vercel: {
		family: "Geist",
		fontStack:
			'"Geist", "Geist Sans", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
		sample: "Aa Bb Cc — 0123456789",
	},
	linear: {
		family: "Inter",
		fontStack:
			'"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
		sample: "Aa Bb Cc — 0123456789",
	},
	notion: {
		family: "Noto Serif",
		fontStack: '"Noto Serif", "Lyon", Georgia, "Times New Roman", serif',
		sample: "Aa Bb Cc — 0123456789",
	},
	stripe: {
		family: "Sohne / Inter",
		fontStack:
			'"Sohne", "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
		sample: "Aa Bb Cc — 0123456789",
	},
	supabase: {
		family: "Geist / Inter",
		fontStack:
			'"Geist", "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
		sample: "Aa Bb Cc — 0123456789",
	},
	framer: {
		family: "Figtree",
		fontStack:
			'"Figtree", "Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
		sample: "Aa Bb Cc — 0123456789",
	},
	raycast: {
		family: "Geist",
		fontStack:
			'"Geist", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
		sample: "Aa Bb Cc — 0123456789",
	},
	cursor: {
		family: "Geist",
		fontStack:
			'"Geist", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
		sample: "Aa Bb Cc — 0123456789",
	},
};

const FALLBACK_FONT_SPECIMEN: ProductPreviewFontSpecimen = {
	family: "Sans",
	fontStack: "ui-sans-serif, system-ui, sans-serif",
	sample: "Aa Bb Cc — 0123456789",
};

const productPreviewDesignPresets = designPresetDefinitions.map((preset) => {
	const accent = productPreviewPresetAccentColors[preset.id] ?? FALLBACK_ACCENT;
	const fontSpecimen =
		productPreviewPresetFontSpecimens[preset.id] ?? FALLBACK_FONT_SPECIMEN;
	const logoDarkMode: ProductPreviewLogoDarkMode =
		productPreviewPresetLogoDarkModes[preset.id] ?? "preserve";
	return {
		id: preset.id,
		label: preset.label,
		summary: preset.summary,
		category: preset.category,
		logoPath: preset.logoPath,
		logoDarkMode,
		previewImagePath: preset.previewImagePath,
		referenceUrl: preset.previewPageUrl,
		accentColor: accent.light,
		accentColorDark: accent.dark,
		fontSpecimen,
	};
});

const pricingModelScaleOptions =
	getBlueprintFieldScaleDefinition("pricing_model")?.options ?? [];
const productPreviewPricingModelOptions = pricingModelScaleOptions.map(
	(option) => ({
		value: option.value as "one_time" | "monthly" | "yearly",
		label: option.label,
		ariaLabel: option.ariaLabel,
	}),
);

if (productPreviewPricingModelOptions.length !== 3) {
	throw new Error(
		"Expected exactly three pricing model options for the homepage Blueprint demo",
	);
}

const productPreviewSection = {
	leverageHero: {
		headline: "Install leverage",
		sublineLead: "and",
		sublineBody: "the loop repeats",
		sublineEmphasis: "TOMORROW",
		optionGroupLabel: "Choose your starting point",
		defaultOptionId: "idea",
		options: [
			{
				id: "codebase",
				label: "I have a codebase already",
			},
			{
				id: "idea",
				label: "I have an idea for a product",
			},
		],
	},
	codebaseBranch: {
		shippieName: "Shippie",
		shippieImage: {
			src: "/landing-page/shippie-loop.png",
			alt: "Shippie",
		},
		intro:
			"We don't want to read your codebase. Thats for you and your team. We do want to start installing leverage in the form of a scan, audit & PR merge queue. You're going to work with Shippie. He's trained on every best practice under-the-sun from OpenAI. It's all he does.",
		auditLead: "You can read more about",
		auditLinkLabel: "the audit",
		auditHref: routeConfig.docs,
		auditBody:
			"if you want to, but its the fastest way for you to start getting real leverage in your codebase. End game is agentic loops, turn into true workers. So it's not just Shippie doing work. It's Shippie, and his friends. And eventually you making your own.",
		todoIntro: "So in order to make these workers personalized to you..",
		todoSetupLine: "we got a few to-dos.",
		todos: [
			"Connect ChatGPT (no claude, I know I know...)",
			"Let Shippie do his thing.",
			"Connect your GitHub",
			"PRs start happening",
		],
		privacyQuestion: "Wait. What? I thought you we'rent reading our code?",
		privacyAnswer:
			"Correct! By connecting ChatGPT, we use Codex's app server harness",
		auditList: {
			title: "The Audit.",
			items: [
				"DOCS Spine",
				"Exec Plans Loop",
				"Oxlint",
				"Oxfmt",
				"Design.md",
				"Agents.md",
				"Programs.md",
				"Linting md files",
				"Token efficient lookup",
				"Low Hanging Fruit `/goal`",
			],
		},
	},
	sections: productPreviewSections,
	foundation: {
		intro:
			"These three answers anchor every other section of the Blueprint. Two minutes is plenty.",
		fields: {
			productName: {
				key: "product_name" as const,
				label: blueprintFieldLabel("product_name"),
				placeholder: blueprintFieldPlaceholder("product_name") ?? "",
				helperText: blueprintFieldHelperText("product_name") ?? "",
			},
			productSummary: {
				key: "product_summary" as const,
				label: blueprintFieldLabel("product_summary"),
				placeholder: blueprintFieldPlaceholder("product_summary") ?? "",
				helperText: blueprintFieldHelperText("product_summary") ?? "",
			},
			primaryUser: {
				key: "primary_user" as const,
				label: blueprintFieldLabel("primary_user"),
				placeholder: blueprintFieldPlaceholder("primary_user") ?? "",
				helperText: blueprintFieldHelperText("primary_user") ?? "",
			},
		},
	},
	design: {
		intro:
			"Pick the brand DNA closest to what you want. Each preset maps to a real, public design system. You can fine-tune the theme grid in the workspace.",
		label: blueprintFieldLabel("design_preset_id"),
		helperText: blueprintFieldHelperText("design_preset_id") ?? "",
		defaultPresetId: DEFAULT_DESIGN_PRESET_ID,
		presets: productPreviewDesignPresets,
		previewLinkLabel: "View live reference",
		previewNote:
			"Color, style, and radius open in the workspace after checkout so you can stay close to the reference or push further.",
	},
	pricing: {
		intro:
			"Set what people will pay. You can change this later before you generate the repo.",
		modelLabel: blueprintFieldLabel("pricing_model"),
		modelOptions: productPreviewPricingModelOptions,
		defaultModel: "one_time" as const,
		defaultPrice: "29",
		priceHelperText: blueprintFieldHelperText("pricing") ?? "",
		pricePlaceholder: blueprintFieldPlaceholder("pricing") ?? "",
	},
	cta: {
		label: "Generate my codebase",
		lockedNote:
			"We'll save your draft, take you to Stripe, and bring you back to the workspace prefilled with these answers.",
	},
} as const;

export const homePageContent = {
	productPreviewSection,
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
		body: "Ship by Sunday gives your agents the worker layer around Codex: exec loops, role packets, channel handoffs, and QA that feeds the next run.",
		primaryCta: marketingDisplayConfig.primaryCtaLabel,
	},
	socialProofSection: {
		heading: {
			eyebrow: "Built BY",
			title: "PARKER, shipper of products,",
			tail: "teacher of AI.",
		},
		body: "Built from real UX, product, design, and engineering work, including startup scale to $73M/year and acquisition.",
		portrait: {
			src: "/founder-portrait.jpg",
			alt: "Founder portrait",
		},
	},
	programsSection: {
		title: "PROGRAMS.md",
		subtitle: "Ship By Sundays Sauce",
		speechBubble: "dang thats a lot of ideas.. and a lot of code.",
		headline: "PROGRAMS.md is not a bigger ExecPlan.",
		body: "It is the machine that turns a messy initiative into a sequence of executable ExecPlans.",
		explainers: [
			{
				title: "Research Passes",
				description:
					"Multiple angles on the same initiative before anyone commits to a plan.",
			},
			{
				title: "Normalize Pass",
				description:
					"Dedupes, reconciles, and turns scattered findings into one coherent track.",
			},
			{
				title: "Converged Decisions Packet",
				description:
					"Captures the actual choices: what we are doing, what we are not doing, and why.",
			},
			{
				title: "Dependency Graph",
				description:
					"Shows ordering, blockers, risky coupling, and which slices can move independently.",
			},
			{
				title: "ExecPlan Split Recommendation",
				description:
					'Converts "big t-shirt work" into bounded, shippable implementation slices.',
			},
			{
				title: "Planning Brief",
				description:
					"The handoff artifact. Each ExecPlan starts from a specific brief version, not vibes.",
			},
			{
				title: "Program Validator",
				description:
					"Keeps the packet honest: required files, lifecycle state, prompt contracts, and lintable structure.",
			},
			{
				title: "ExecPlan Loop",
				description:
					"Ship one slice, sync the Program, refresh the brief, repeat until the initiative is actually done.",
			},
		],
		pipeline: [
			"big messy set of ideas",
			"research passes",
			"normalize pass",
			"converged decisions packet",
			"dependency graph",
			"execplan split recommendation",
			"planning brief",
			"execplan loop",
		],
		loopSteps: ["write", "grill", "execute"],
		outcome: "validated shipping slices",
	},
	faqSection: {
		titleLead: "Common",
		titleAccent: "Questions",
		lead: "",
		items: [
			{
				question: "Is this another course or another starter?",
				answer:
					"No. It is a worker-layer system for exec loops: decisions, role briefs, agent runs, and QA.",
			},
			{
				question: "What do I actually get at the end?",
				answer:
					"Exec loops, worker role packets, channel handoff patterns, a QA path, and repo guidance your agents can reuse.",
			},
			{
				question: "Who is this for?",
				answer:
					"Technical founders who can get AI to code, but need phone-started loops and role-specific agents to ship work that converts.",
			},
			{
				question: "Why not just use ChatGPT, Claude, or Codex directly?",
				answer:
					"Use them. Ship by Sunday supplies the worker layer around them.",
			},
			{
				question:
					"Can this help with Telegram, Discord, or phone-started agent loops?",
				answer:
					"Yes. Ship by Sunday teaches the code-side worker layer those channels can reuse.",
			},
			{
				question: "What happens right after I pay?",
				answer: `You open the ${workspaceDisplayConfig.homeNoun}, lock the decisions, compile the packs, and start the loop.`,
			},
		],
	},
	execLoopSection: {
		title: "How Workers Work.",
		steps: [
			{
				label: "Shippie",
				description: "Gets your code branched, built, and merged.",
			},
			{
				label: "Healios",
				description: "Finds broken paths and fixes them fast.",
			},
			{
				label: "Goalie",
				description: "Guards scope and keeps the spec honest.",
			},
			{
				label: "Loopie",
				description: "Keeps exec loops queued and running.",
			},
		],
	},
	starterSystemSection: {
		heading: {
			ariaLabel: "A worker layer. Each hat, a trained role.",
			lead: "A worker layer.",
			detailLead: "each hat,",
			detailTail: "a trained role.",
		},
		capabilities: [
			{
				title: "Role packets",
				description:
					"Turn founder, product, growth, design, build, and QA hats into specific worker instructions.",
			},
			{
				title: "Async channels",
				description:
					"Phone prompts, Telegram, Discord, and Codex runs point at the same worker context.",
			},
			{
				title: "Code-side loop",
				description:
					"Agents ship against repo truth, not a blank chat or generic prompt stack.",
			},
			{
				title: "Proof path",
				description:
					"Every loop returns the diff, browser proof, risk notes, and the next decision.",
			},
		],
	},
	durabilitySection: {
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
	plansMdSection: {
		title: "PLANS.md",
		subtitleLead: "OpenAI’s",
		subtitleEmphasis: "WEAPON",
		subtitleTail: "of choice",
		callouts: [
			"Detailed instructions",
			"Persistent task memory",
			"Loopable execution path",
		],
		tagline: {
			lead: "Where ",
			emphasis: "vague",
			tail: " requests become executable software work.",
		},
		differentiators: [
			{
				title: "Persistent memory for long tasks",
				description:
					"The agent can return to the plan after context shifts, retries, or interruptions.",
			},
			{
				title: "Turns vague intent into executable steps",
				description:
					"Breaks the goal into concrete milestones instead of relying on one-shot prompting.",
			},
			{
				title: "Keeps scope from drifting",
				description:
					"Defines what is in-bounds, what is out-of-bounds, and what “done” means.",
			},
			{
				title: "A shared source of truth",
				description:
					"Human and AI can both inspect the same plan, update it, and hold work against it.",
			},
			{
				title: "Progress survives the chat",
				description:
					"Decisions, blockers, validation steps, and next actions stay written down.",
			},
			{
				title: "Built for iteration",
				description:
					"The agent can loop back, revise assumptions, and continue from the last known state.",
			},
			{
				title: "Forces verification",
				description:
					"Good plans include tests, checks, proof, and acceptance criteria before calling work finished.",
			},
			{
				title: "Compresses complexity",
				description:
					"Big ambiguous tasks become smaller, ordered, reviewable units.",
			},
			{
				title: "Reduces prompt re-explaining",
				description:
					"You do not have to restate the whole project every time the agent resumes.",
			},
			{
				title: "Makes autonomy safer",
				description:
					"The agent can work independently without freelancing beyond the agreed direction.",
			},
		],
		loop: {
			ideaLabel: "idea",
			writeLabel: "write",
			grillLabel: "grill",
			executeLabel: "execute",
			shipLabel: "ship",
		},
	},
	pricingSection: {
		headline: {
			prefix: "Ship a",
			rotatingPhrases: ["real product", "new worker"],
		},
		titleAccent: "by Sunday",
		priceDisplay: productConfig.checkoutPriceDisplay,
		originalPriceDisplay: activePricingOffer
			? productConfig.priceDisplay
			: null,
		offerPriceDisplay:
			activePricingOffer?.discountedPriceDisplay ??
			productConfig.checkoutPriceDisplay,
		offerBanner: pricingOfferBanner,
		ctaTitle: marketingDisplayConfig.primaryCtaLabel,
		trustLine: `After checkout, open the ${workspaceDisplayConfig.homeNoun}, lock the decisions, and build the first loop.`,
		includes: [
			"Exec loop setup",
			"Role-specific worker packets",
			"Phone, Telegram, and Discord handoff pattern",
			"Codex-ready code run path",
			"Review and QA path",
			"Fast Pass Walkthroughs",
		],
		bonus: {
			title: "FREE BONUS: FULL TURBO",
			description:
				"A 30-video workflow course included free for faster build reps after the sprint.",
		},
	},
	footerWordmark: productName,
} as const;

export type HomePageContent = typeof homePageContent;
