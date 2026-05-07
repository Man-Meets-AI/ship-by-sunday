import {
	DEFAULT_DESIGN_PRESET_ID,
	designPresetDefinitions,
} from "@shipbysunday/codebase-compiler";
import {
	codebaseFieldHelperText,
	codebaseFieldLabel,
	codebaseFieldPlaceholder,
	getCodebaseFieldScaleDefinition,
} from "@shipbysunday/codebase-presentation";
import { productConfig } from "@/config/product";
import {
	marketingDisplayConfig,
	workspaceDisplayConfig,
} from "@/config/starter-selectors";
import { codebasePageSections } from "@/lib/codebase-flow/codebase-page-sections";

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

const interactiveCodebaseDemoSectionIds = [
	"foundation",
	"design",
	"pricing",
] as const;

type CodebaseDemoSectionStatus = "interactive" | "locked";

const productPreviewSections = codebasePageSections.map((section) => ({
	id: section.id,
	label: section.label,
	description: section.description,
	status: (interactiveCodebaseDemoSectionIds.includes(
		section.id as (typeof interactiveCodebaseDemoSectionIds)[number],
	)
		? "interactive"
		: "locked") as CodebaseDemoSectionStatus,
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
	getCodebaseFieldScaleDefinition("pricing_model")?.options ?? [];
const productPreviewPricingModelOptions = pricingModelScaleOptions.map(
	(option) => ({
		value: option.value as "one_time" | "monthly" | "yearly",
		label: option.label,
		ariaLabel: option.ariaLabel,
	}),
);

if (productPreviewPricingModelOptions.length !== 3) {
	throw new Error(
		"Expected exactly three pricing model options for the homepage Codebase demo",
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
			"Bring the app you already have. Ship by Sunday runs the private doctor pass through your local runner first: Shippie reads approved sync-safe reports, ranks the Top 9 findings, and keeps raw source, secrets, long logs, and Codex transcripts on your machine by default.",
		auditLead: "You can read more about",
		auditLinkLabel: "the audit",
		auditHref: "#doctor-pass-audit",
		auditBody:
			"if you want to, but the point is simple: diagnose the highest-leverage blocker, approve one bounded worker loop, and leave with proof or an honest blocked-proof report.",
		todoIntro: "To start the private doctor pass,",
		todoSetupLine: "we keep the setup concrete.",
		todos: [
			"Complete Machine Setup and Project Setup",
			"Pair the local runner inside your repo",
			"Approve the sync preview for Top 9 findings",
			"Choose the first recommended loop after diagnosis",
		],
		privacyQuestion: "Where does GitHub fit?",
		privacyAnswer:
			"Local mode does not push branches, open PRs, rerun CI, or share raw source. Concierge managed GitHub starts only after a separate visible consent packet names the repository, storage, PR authority, audit log, revocation, and proof boundaries.",
		auditList: {
			title: "The Doctor Pass.",
			items: [
				"Machine Setup",
				"Project Setup",
				"Local runner pairing",
				"Read-only probes",
				"Top 9 findings",
				"Sync preview approval",
				"First loop approval",
				"Proof or blocked proof",
				"Managed GitHub consent only",
				"Next recommendation",
			],
		},
		cta: {
			label: "Run my codebase doctor pass",
			note: "Checkout brings you back to the protected setup entry for a sync-safe doctor pass.",
		},
	},
	sections: productPreviewSections,
	foundation: {
		intro:
			"These three answers anchor every other section of the Codebase. Two minutes is plenty.",
		fields: {
			productName: {
				key: "product_name" as const,
				label: codebaseFieldLabel("product_name"),
				placeholder: codebaseFieldPlaceholder("product_name") ?? "",
				helperText: codebaseFieldHelperText("product_name") ?? "",
			},
			productSummary: {
				key: "product_summary" as const,
				label: codebaseFieldLabel("product_summary"),
				placeholder: codebaseFieldPlaceholder("product_summary") ?? "",
				helperText: codebaseFieldHelperText("product_summary") ?? "",
			},
			primaryUser: {
				key: "primary_user" as const,
				label: codebaseFieldLabel("primary_user"),
				placeholder: codebaseFieldPlaceholder("primary_user") ?? "",
				helperText: codebaseFieldHelperText("primary_user") ?? "",
			},
		},
	},
	design: {
		intro:
			"Pick the brand DNA closest to what you want. Each preset maps to a real, public design system. You can fine-tune the theme grid in the workspace.",
		label: codebaseFieldLabel("design_preset_id"),
		helperText: codebaseFieldHelperText("design_preset_id") ?? "",
		defaultPresetId: DEFAULT_DESIGN_PRESET_ID,
		presets: productPreviewDesignPresets,
		previewLinkLabel: "View live reference",
		previewNote:
			"Color, style, and radius open in the workspace after checkout so you can stay close to the reference or push further.",
	},
	pricing: {
		intro:
			"Set what people will pay. You can change this later before you generate the repo.",
		modelLabel: codebaseFieldLabel("pricing_model"),
		modelOptions: productPreviewPricingModelOptions,
		defaultModel: "one_time" as const,
		defaultPrice: "29",
		priceHelperText: codebaseFieldHelperText("pricing") ?? "",
		pricePlaceholder: codebaseFieldPlaceholder("pricing") ?? "",
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
		headlineLead: "Agent doctor",
		headlineTailPrefix: "for ",
		headlineTailHover: "web apps",
		body: "Ship by Sunday diagnoses blockers, ranks the highest-leverage fixes, runs the first approved AI worker loop, and ends with proof or a clear blocked-proof report.",
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
					"No. It is an agent doctor for web apps: diagnosis, ranked findings, a selected worker loop, and proof.",
			},
			{
				question: "What do I actually get at the end?",
				answer:
					"Generated-codebase buyers leave with a worker-ready repo. Existing-codebase buyers get a private doctor pass, Top 9 findings, one approved loop, proof or blocked proof, and the next recommendation.",
			},
			{
				question: "Who is this for?",
				answer:
					"Technical founders, indie SaaS builders, operators, and agencies who already use AI to code but need safer diagnosis, execution boundaries, and proof.",
			},
			{
				question: "Why not just use ChatGPT, Claude, or Codex directly?",
				answer:
					"Use them. Ship by Sunday supplies the local runner, workflow packets, consent boundaries, and proof path around them.",
			},
			{
				question: "Can this help my existing or broken app?",
				answer:
					"Yes. The existing-codebase path starts with a private local doctor pass and can route concrete failures into a read-only broken-app triage workflow before any patch is approved.",
			},
			{
				question: "What happens right after I pay?",
				answer: `You choose the right protected path: start from an idea in the ${workspaceDisplayConfig.homeNoun}, or bring an existing app into setup for the local doctor pass.`,
			},
		],
	},
	execLoopSection: {
		title: "How Workers Work.",
		steps: [
			{
				label: "Shippie",
				description: "Turns the diagnosis into one bounded loop with proof.",
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
					"The Ship by Sunday Codebase gives you one final downloadable handoff that is easier to trust, review, and reuse than scattered prompt history.",
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
			prefix: "Run the",
			rotatingPhrases: ["doctor pass", "first worker loop"],
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
		trustLine: `Start from an idea here. If you already have an app, choose the codebase path above for the protected doctor-pass setup.`,
		includes: [
			"Generated codebase or private local doctor pass",
			"Top 9 findings and first-loop recommendation",
			"One approved AI worker loop",
			"Proof or blocked-proof report",
			"Local privacy and sync-safe report boundaries",
			"Next recommendation after the loop",
		],
		bonus: {
			title: "FREE BONUS: FULL TURBO",
			description:
				"A 30-video workflow course included free for faster build reps after the sprint.",
		},
	},
	supportWidget: {
		launcherLabel: "Message Parker",
		panelTitle: "Message Parker",
		panelSubtitle: "Ask about fit, scope, or what to do next.",
		starterMessage:
			"Send a note here. Parker replies from Telegram and the thread stays on this page.",
		messagePlaceholder: "Type your question...",
		sendLabel: "Send",
		closeLabel: "Close support chat",
		fallbackLabel: "Open Telegram",
		directTelegramLabel: "Use Telegram directly",
		loadingLabel: "Loading conversation",
		sendingLabel: "Sending",
		deliveredLabel: "Delivered to Parker",
		failedLabel: "Parker may not have seen this.",
		closedLabel: "This thread is closed.",
	},
	footerWordmark: productName,
} as const;

export type HomePageContent = typeof homePageContent;
