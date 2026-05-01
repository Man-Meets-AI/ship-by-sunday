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
			message: `${productConfig.checkoutPriceDisplay} early member price. FULL TURBO included.`,
		}
	: null;
const pricingOfferBanner = activePricingOffer
	? {
			label: activePricingOffer.label,
			message: `${productConfig.checkoutPriceDisplay} early member price. Auto-applied at checkout.`,
		}
	: null;

export const homePageContent = {
	productPreviewSection: {
		kicker: productName,
		title: "Set up the repo.",
		intro:
			"Play with the setup workspace customers land in after checkout: repo invite, Codex loop, video path, and QA.",
		primaryAction: {
			label: "Build the repo",
			href: routeConfig.settings,
		},
		secondaryAction: {
			label: "Watch setup video",
			href: "/lesson/welcome-to-ship-by-sunday",
		},
		unlockNote:
			"Checkout unlocks saved setup, private videos, and the build actions.",
		workspace: {
			title: "Starter repo setup",
			statusLabel: "Preview mode",
			githubUsernameLabel: "GitHub username",
			githubUsernamePlaceholder: "parkerrex",
			githubUsernameHelp:
				"This is where the private starter repo invite gets sent after checkout.",
			tabs: [
				{
					id: "repo",
					label: "Repo",
					title: "Repo access",
					description:
						"Save the GitHub account that should receive the private starter repo.",
					items: ["GitHub username", "Invite status", "Starter repo link"],
				},
				{
					id: "codex",
					label: "Codex",
					title: "Codex loop",
					description:
						"Connect your subscription and send worker briefs through the same context.",
					items: ["Account connection", "Rate-limit check", "Worker prompt"],
				},
				{
					id: "qa",
					label: "QA",
					title: "QA path",
					description:
						"Review the diff, proof, and next action before the loop compounds.",
					items: ["Diff review", "Browser proof", "Next loop"],
				},
			],
			checklist: [
				{
					id: "truth",
					label: "Product truth locked",
				},
				{
					id: "repo",
					label: "Repo invite ready",
				},
				{
					id: "codex",
					label: "Codex loop connected",
				},
				{
					id: "qa",
					label: "QA path attached",
				},
			],
		},
	},
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
		body: "Exec loops turn your decisions into worker briefs agents can run from Codex, Telegram, Discord, or your phone.",
		primaryCta: marketingDisplayConfig.primaryCtaLabel,
		secondaryCta: {
			label: "See the loop",
			href: routeConfig.systemHash,
		},
		eyebrow:
			"One payment. One worker layer. Product, design, marketing, build, and QA stay aligned.",
	},
	sprintPathSection: {
		label: "System",
		titlePrefix: "Exec loops make ",
		titleHighlight: "agents useful.",
		intro:
			"An exec loop is the repeatable path from decision to agent run to QA to the next decision.",
		supportingPoints: [
			"Decide what should happen.",
			"Package the decision for the right worker role.",
			"Run the agent, review the change, and feed the result back into the system.",
		],
		valueFrame: "Most starters give you code. Exec loops make it compound.",
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
		body: "Built from real UX, product, design, and engineering work, including startup scale to $73M/year and acquisition.",
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
					"No. It is a worker-layer system for exec loops: decisions, role briefs, agent runs, and QA.",
			},
			{
				question: "What do I actually get at the end?",
				answer:
					"Worker packs, a QA path, and repo guidance your agents can reuse.",
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
					"Yes, if you wire the loops. This gives them code-side context to reuse.",
			},
			{
				question: "What happens right after I pay?",
				answer: `You open the ${workspaceDisplayConfig.homeNoun}, lock the decisions, compile the packs, and start the loop.`,
			},
		],
	},
	execLoopSection: {
		label: "Exec loop",
		title: "How the loop works.",
		intro:
			"One loop moves a decision into shipped code. The next loop starts smarter.",
		steps: [
			{
				label: "Decide",
				description: "Name the outcome, constraint, and conversion claim.",
			},
			{
				label: "Brief",
				description: "Turn it into a worker pack for one role.",
			},
			{
				label: "Run",
				description:
					"Send the agent through Codex, Telegram, Discord, or phone.",
			},
			{
				label: "Review",
				description: "Check the diff, QA path, and update the worker layer.",
			},
		],
	},
	starterSystemSection: {
		title: "A worker layer your agents can build from.",
		titleLines: ["A worker layer.", "Your agents can", "build from."],
		intro:
			"Decisions become role briefs. Role briefs become agent runs. Agent runs become reviewed product changes.",
		capabilities: [
			{
				title: "Worker packs",
				description: "Clear briefs for each role you need agents to play.",
			},
			{
				title: "Async channels",
				description:
					"Codex, phone prompts, Telegram, and Discord share context.",
			},
			{
				title: "QA path",
				description: "Every loop ends with review, proof, and next action.",
			},
			{
				title: "Conversion-aware repo",
				description:
					"Homepage, docs, checkout, and review stay tied to the offer.",
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
			"One payment for the worker layer: exec loops, role packs, starter path, and QA prompts for a reviewable codebase.",
		priceDisplay: productConfig.checkoutPriceDisplay,
		originalPriceDisplay: activePricingOffer
			? productConfig.priceDisplay
			: null,
		offerPriceDisplay:
			activePricingOffer?.discountedPriceDisplay ??
			productConfig.checkoutPriceDisplay,
		offerBanner: pricingOfferBanner,
		eyebrow: "One-time payment. Lifetime access.",
		ctaTitle: marketingDisplayConfig.primaryCtaLabel,
		trustLine: `After checkout, open the ${workspaceDisplayConfig.homeNoun}, lock the decisions, and build the first loop.`,
		includes: [
			"Exec loop setup",
			"Agent-ready worker packs",
			"Review and QA path",
			"Guided Ship Path",
			"Fast Pass Walkthroughs",
		],
		bonus: {
			label: "Additional bonus",
			title: "FREE BONUS: FULL TURBO",
			description:
				"A 30-video workflow course included free for faster build reps after the sprint.",
		},
	},
	footerWordmark: productName,
} as const;

export type HomePageContent = typeof homePageContent;
