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
		title: "Build the worker layer.",
		intro:
			"Start a decision from your phone, hand it to a trained worker role, and give agents enough product context to ship reviewed code.",
		primaryAction: {
			label: "Build the worker layer",
			href: routeConfig.pricingHash,
		},
		secondaryAction: {
			label: "See the loop",
			href: routeConfig.systemHash,
		},
		unlockNote:
			"Checkout opens saved setup, worker role packs, private videos, and the build actions.",
		previewNote:
			"Tune the worker preview. Checkout saves the context and opens the build path.",
		workspace: {
			title: "Worker layer preview",
			statusLabel: "Buyer preview",
			githubUsernameLabel: "Codebase GitHub username",
			githubUsernamePlaceholder: "parkerrex",
			githubUsernameHelp:
				"After checkout, this account receives the private starter repo and worker-layer setup.",
			tabs: [
				{
					id: "source",
					label: "Source",
					title: "Decision context",
					description:
						"Capture the product truth, operator taste, and next decision so every run starts from the same context.",
					items: [
						{
							label: "Product truth",
							detail: "Problem, promise, scope",
						},
						{
							label: "Operator taste",
							detail: "How you decide and review",
						},
						{
							label: "Next decision",
							detail: "Ready for the next loop",
						},
					],
				},
				{
					id: "channels",
					label: "Channels",
					title: "Phone to agent",
					description:
						"Send the same worker brief through Codex, Telegram, Discord, or a phone-started prompt without losing the thread.",
					items: [
						{
							label: "Codex dispatch",
							detail: "Agent run with repo context",
						},
						{
							label: "Telegram / Discord",
							detail: "Async loop handoff",
						},
						{
							label: "Worker prompt",
							detail: "One role, one outcome",
						},
					],
				},
				{
					id: "proof",
					label: "Proof",
					title: "Code shipping path",
					description:
						"Review the diff, browser proof, and next action before the loop compounds into your worker layer.",
					items: [
						{
							label: "Diff review",
							detail: "Meaningful code, not random edits",
						},
						{
							label: "Browser proof",
							detail: "Behavior checked before trust",
						},
						{
							label: "Next loop",
							detail: "Context feeds forward",
						},
					],
				},
			],
			checklist: [
				{
					id: "truth",
					label: "Product truth locked",
				},
				{
					id: "roles",
					label: "Worker roles trained",
				},
				{
					id: "channels",
					label: "Channel loop ready",
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
			"Start a decision from your phone, desk, Telegram, or Discord.",
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
					"Yes. Ship by Sunday teaches the code-side worker layer those channels can reuse.",
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
					"Dispatch the role through Codex, Telegram, Discord, or a phone-started prompt.",
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
