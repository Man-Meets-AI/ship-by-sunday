import { productConfig, routeConfig } from "@/config/product";
import type { LessonConfig } from "@/features/course/lesson/model/contracts";
import { createVideoLesson } from "@/features/course/lesson/model/video-lesson-factory";
import {
	BRAND_KIT_ACCENT_HEX_FIELD_ID,
	BRAND_KIT_APP_NAME_FIELD_ID,
	BRAND_KIT_ARTIFACT_CHECKLIST_FIELD_ID,
	BRAND_KIT_ARTIFACT_CHECKLIST_OPTIONS,
	BRAND_KIT_DOMAIN_FIELD_ID,
	BRAND_KIT_ICON_UPLOAD_FIELD_ID,
	BRAND_KIT_INITIALS_FIELD_ID,
	BRAND_KIT_NAMING_FIELD_ID,
	BRAND_KIT_PRIMARY_HEX_FIELD_ID,
	BRAND_KIT_WORDMARK_UPLOAD_FIELD_ID,
} from "@/features/course/lesson/workbench/modes/brand-kit/brand-kit-constants";
import {
	BUILD_PRODUCT_ITERATION_FIELD_IDS,
	BUILD_PRODUCT_ITERATION_SETUP_CHECKLIST_OPTIONS,
} from "@/features/course/lesson/workbench/modes/build-product-iteration/build-product-iteration-constants";
import {
	CHECKOUT_QA_BROWSER_FIELD_ID,
	CHECKOUT_QA_CURRENT_STEP_FIELD_ID,
	CHECKOUT_QA_LAST_ISSUE_FIELD_ID,
	CHECKOUT_QA_PREFLIGHT_FIELD_ID,
	CHECKOUT_QA_PREFLIGHT_OPTIONS,
	CHECKOUT_QA_PROMPT_FIELD_ID,
	CHECKOUT_QA_REPORT_FIELD_ID,
	CHECKOUT_QA_SCENARIO_FIELD_ID,
} from "@/features/course/lesson/workbench/modes/checkout-qa-loop/checkout-qa-loop-constants";
import {
	CODEX_MARKETING_SITE_FIELD_IDS,
	CODEX_MARKETING_WORKFLOW_CHECKLIST_OPTIONS,
} from "@/features/course/lesson/workbench/modes/codex-marketing-site/codex-marketing-site-constants";
import {
	CORE_UX_BUILD_FIELD_IDS,
	CORE_UX_BUILD_HANDOFF_CHECKLIST_OPTIONS,
	CORE_UX_BUILD_ONBOARDING_CHECKLIST_OPTIONS,
} from "@/features/course/lesson/workbench/modes/core-ux-build/core-ux-build-constants";
import {
	CORE_UX_PLAN_FIELD_IDS,
	CORE_UX_PLAN_WORKFLOW_CHECKLIST_OPTIONS,
} from "@/features/course/lesson/workbench/modes/core-ux-plan-flow/core-ux-plan-flow-constants";
import { FRESH_TEMPLATE_PLAN_FIELD_IDS } from "@/features/course/lesson/workbench/modes/fresh-template-plan/fresh-template-plan-constants";
import {
	DEPLOY_DOMAIN_FIELD_ID,
	DEPLOY_PRODUCT_NAME_FIELD_ID,
	DEPLOY_STEP_OPTIONS,
	DEPLOY_STEPS_FIELD_ID,
	DEPLOY_SUCCESS_FIELD_ID,
	DEPLOY_SUCCESS_OPTIONS,
} from "@/features/course/lesson/workbench/modes/production-deploy-handoff/production-deploy-handoff-constants";

export const buildLessons = [
	createVideoLesson({
		id: "3.0",
		slug: "03-00-build-kickoff",
		order: 12,
		block: "BUILD",
		title: "Build Kickoff",
		shortTitle: "Kickoff",
		prevLessonId: "2.2",
		nextLessonId: "3.1",
		workbench: "build_setup_launchpad",
		pinnedArtifacts: [
			"core_flow_sketch_state",
			"outcome_statement",
			"user_statement",
		],
		intro:
			"Clone the Ship by Sunday Starter into a named product folder, fill dev and prod env files, run the preview, and line up your day-one strategy notes for the next lesson.",
		helperText:
			"Setup handoff—not a build lesson. Use the checklist and links on screen.",
		lessonMeta: {
			runtimeLabel: "~2 min video + setup",
			goal: "Local starter running with env keys in place; strategy artifacts ready to reference.",
			purpose:
				"Surface template, accounts, env files, and clone commands in one place before you edit the marketing page.",
		},
		teachingPoints: [
			"Name the product folder before you clone so paths stay consistent.",
			"Keep dev keys in `.env.local` and production keys in `.env.production`—do not mix them.",
			"Success for this step is a running default starter page, not custom marketing copy.",
		],
		actionJobNow:
			"Clone the template, paste Convex / Clerk / Stripe keys, run the dev server, confirm the default page loads.",
		actionTimebox: "15–25 minutes",
		actionComeBackWith:
			"Initialized repo, completed env files, running local preview, strategy notes visible.",
		workbenchPrompt:
			"Work top to bottom: template → folder name → commands → checklist → env tabs.",
		workbenchEmptyState:
			"Complete each checklist line when it is true on your machine.",
		objectiveTitle: "Build 3.0 — Starter setup handoff",
		winCondition:
			"Product folder named, setup checklist complete, env keys captured, server running.",
		checklist: [
			"Watch the kickoff",
			"Finish clone, env, and checklist on screen",
			"Continue to Iterate with AI",
		],
		workbenchFields: [
			{
				id: "build_product_folder_name",
				label: "Product folder name",
				kind: "text",
				required: true,
				placeholder: "e.g. my-saas-name",
				helpText:
					"Use a short folder name with no spaces—this is the directory you clone into.",
			},
			{
				id: "build_setup_prereqs",
				label: "Setup checklist",
				kind: "checklist",
				required: true,
				options: [
					"Created the product folder on disk",
					"Cloned or initialized the starter repo into that folder",
					"Opened `.env.local` in the editor",
					"Opened `.env.production` in the editor",
					"Opened Convex (dashboard) for keys",
					"Opened Clerk for keys",
					"Opened Stripe for keys",
					"Pasted keys into the right env files",
					"Ran the dev server / local preview",
				],
			},
		],
		workbenchSections: [
			{
				id: "setup_launchpad",
				title: "Starter setup",
				layout: "stack",
				fieldIds: ["build_product_folder_name", "build_setup_prereqs"],
				completionLabel: "Setup checklist complete",
			},
		],
	}),
	createVideoLesson({
		id: "3.1",
		slug: "03-01-ai-product-iteration",
		order: 13,
		block: "BUILD",
		title: "Iterate the product with AI",
		shortTitle: "AI iteration",
		prevLessonId: "3.0",
		nextLessonId: "3.2",
		workbench: "build_product_iteration",
		artifact: {
			key: "build_product_iteration_outputs",
			label: "Brand + posts bundle",
			type: "mixed",
			required: true,
		},
		intro:
			"Walk through how the instructor iterates with AI: talk UI changes, run the app, capture screenshots and errors, gate work on the right accounts, paste one ChatGPT prompt, and save brand instructions plus a first batch of posts.",
		helperText:
			"Use Setup for accounts and checkboxes, Iteration workflow for the compressed loop, Outputs for the prompt and saved artifacts.",
		lessonMeta: {
			runtimeLabel: "~4 min video + outputs",
			goal: "Linked product + ChatGPT paths, saved brand instructions, starter idea, and draft posts.",
			purpose:
				"Make the paid product account and ChatGPT account explicit, surface the screenshot-first debug habit, and capture the missing ChatGPT response as durable fields.",
		},
		teachingPoints: [
			"Paid template access is not the same login as this website—unlock it before treating the product as unblocked.",
			"Screenshots and error text beat long explanations when you are debugging with AI.",
			"Save ChatGPT’s response as brand strategy + brand design instructions before you generate posts.",
		],
		actionJobNow:
			"Complete the setup checklist, run the ChatGPT prompt, paste outputs, and capture starter idea + posts.",
		actionTimebox: "25–45 minutes",
		actionComeBackWith:
			"Brand strategy instructions, brand design instructions, one starter idea, and a first batch of posts.",
		workbenchPrompt:
			"Work through Setup, skim Iteration workflow, then fill Outputs when each block is real.",
		workbenchEmptyState: "Start on the Setup tab and check off what is true.",
		objectiveTitle: "Build 3.1 — Iterate with AI",
		winCondition:
			"Setup checklist done; brand strategy + design instructions saved; starter idea chosen; posts drafted.",
		checklist: [
			"Watch the walkthrough",
			"Finish setup + outputs tabs",
			"Continue to Map the repo",
		],
		workbenchFields: [
			{
				id: BUILD_PRODUCT_ITERATION_FIELD_IDS.setupChecklist,
				label: "Setup checklist",
				kind: "checklist",
				required: true,
				taskLabel: "Setup steps complete",
				options: [...BUILD_PRODUCT_ITERATION_SETUP_CHECKLIST_OPTIONS],
			},
			{
				id: BUILD_PRODUCT_ITERATION_FIELD_IDS.brandStrategy,
				label: "Brand strategy instructions",
				kind: "textarea",
				required: true,
				rows: 7,
				placeholder:
					"Paste or distill the ## Brand strategy instructions section…",
			},
			{
				id: BUILD_PRODUCT_ITERATION_FIELD_IDS.brandDesign,
				label: "Brand design instructions",
				kind: "textarea",
				required: true,
				rows: 7,
				placeholder:
					"Paste or distill the ## Brand design instructions section…",
			},
			{
				id: BUILD_PRODUCT_ITERATION_FIELD_IDS.starterIdea,
				label: "Selected starter idea",
				kind: "textarea",
				required: true,
				rows: 4,
				placeholder: "The single angle or hook you will test first…",
			},
			{
				id: BUILD_PRODUCT_ITERATION_FIELD_IDS.generatedPosts,
				label: "Generated posts (v1 batch)",
				kind: "textarea",
				required: true,
				rows: 10,
				placeholder: "Paste your first batch of posts from ChatGPT…",
			},
		],
		workbenchSections: [
			{
				id: "product_iteration_setup",
				title: "Setup",
				layout: "stack",
				fieldIds: [BUILD_PRODUCT_ITERATION_FIELD_IDS.setupChecklist],
				completionLabel: "Setup checklist complete",
			},
			{
				id: "product_iteration_outputs",
				title: "Outputs",
				layout: "stack",
				fieldIds: [
					BUILD_PRODUCT_ITERATION_FIELD_IDS.brandStrategy,
					BUILD_PRODUCT_ITERATION_FIELD_IDS.brandDesign,
					BUILD_PRODUCT_ITERATION_FIELD_IDS.starterIdea,
					BUILD_PRODUCT_ITERATION_FIELD_IDS.generatedPosts,
				],
				completionLabel: "Brand artifacts + posts captured",
			},
		],
	}),
	createVideoLesson({
		id: "3.2",
		slug: "03-02-map-the-repo-and-starter",
		order: 14,
		block: "BUILD",
		title: "Map the Repo and Starter",
		shortTitle: "Repo",
		prevLessonId: "3.1",
		nextLessonId: "3.3",
		workbench: "repo_map_orientation",
		checklist: [
			"Watch the repo walkthrough",
			"Skim the project map and commands tabs",
		],
		teachingPoints: [
			"Match the folder names you hear to this explorer layout.",
			"Treat `.env` as secrets—never paste keys into chat or commits.",
			"Use this screen as reference; you do not need to memorize every path.",
		],
		helperText:
			"Orientation only: map the starter in VS Code and skim where scripts and providers connect.",
		winCondition:
			"You know where routes, UI, backend, secrets, and scripts live in the starter.",
		intro:
			"Ground yourself in the starter the same way you would scan a new repo in VS Code—folders, env files, and the scripts you will run all week.",
		lessonMeta: {
			runtimeLabel: "~5 min + skim",
			goal: "See how the starter is organized before you wire providers in the next lessons.",
			purpose:
				"In-product cheat sheet for app/, components/, convex/, env files, AGENTS.md, and package scripts—lightweight reference, not a build step.",
		},
		actionJobNow:
			"Watch the walkthrough and skim the Project map and Commands tabs.",
		actionTimebox: "5–10 minutes",
		actionComeBackWith:
			"You know where pages, shared UI, Convex, secrets, agent notes, and npm scripts live.",
		workbenchPrompt:
			"Use Project map and Commands while you follow along in the editor.",
		workbenchEmptyState:
			"Open the Project map tab and mirror it in your file explorer.",
		coachResources: [
			{
				id: "repo_map_tool_overview_video",
				label: "Tool overview video",
				href: productConfig.bonusPlaylistUrl,
				kind: "external",
			},
			{
				id: "repo_map_setup_guide",
				label: "Step-by-step setup guide",
				href: `${routeConfig.docs}/local-setup`,
				kind: "internal",
			},
		],
	}),
	createVideoLesson({
		id: "3.3",
		slug: "03-03-provider-setup",
		order: 15,
		block: "BUILD",
		title: "Provider Setup",
		shortTitle: "Providers",
		prevLessonId: "3.2",
		nextLessonId: "3.4",
	}),
	createVideoLesson({
		id: "3.4",
		slug: "03-04-wire-db-auth-and-payments",
		order: 16,
		block: "BUILD",
		title: "Wire DB, Auth, and Payments",
		shortTitle: "Integrations",
		prevLessonId: "3.3",
		nextLessonId: "3.5",
	}),
	createVideoLesson({
		id: "3.5",
		slug: "03-05-codex-marketing-site",
		order: 17,
		block: "BUILD",
		title: "Codex Marketing Site",
		shortTitle: "Marketing Site",
		prevLessonId: "3.4",
		nextLessonId: "3.6",
		workbench: "codex_marketing_site",
		pinnedArtifacts: [
			"core_flow_sketch_state",
			"outcome_statement",
			"user_statement",
		],
		artifact: {
			key: "codex_marketing_site_workspace",
			label: "Marketing site copy + brief",
			type: "mixed",
			required: true,
		},
		intro:
			"Turn your CEO offer inputs into one reusable ChatGPT prompt, draft landing-page copy for your marketing site, refine it conversationally (not plan mode), optionally borrow visual cues from a reference URL, then commit and push.",
		helperText:
			"Dependencies first, then brief + copy tabs, workflow checklist, and command snippets. Pinned cards show your earlier user, outcome, and flow notes.",
		lessonMeta: {
			runtimeLabel: "~5 min video + copy pass",
			goal: "Reusable prompt saved, brief filled, first-pass landing copy in all sections, optional style URL, changes committed and pushed.",
			purpose:
				"Keep the lesson lightweight: one prompt, one copy pass, optional style reference, explicit git loop—without previewing the next lesson’s UX build.",
		},
		teachingPoints: [
			"Copy the base prompt once, then fill the brief from your pinned artifacts—do not re-explain problem/pain/frequency in prose elsewhere.",
			"Ask for a pass first; refine in chat. Skip plan mode for this exercise.",
			"Treat commit + push as part of the outcome, not an afterthought.",
		],
		actionJobNow:
			"Copy the template prompt, run it with your brief, paste outputs into each copy tab, then commit and push the marketing page.",
		actionTimebox: "30–50 minutes",
		actionComeBackWith:
			"Saved prompt, completed brief, filled copy sections, optional style URL, repo updated on remote.",
		workbenchPrompt:
			"Work top to bottom: dependencies → alert → prompt card → brief → copy tabs → style URL → workflow → commands.",
		workbenchEmptyState:
			"Start with dependencies and your pinned strategy artifacts.",
		objectiveTitle: "Build 3.5 — Codex marketing site",
		winCondition:
			"Brief + all copy fields done, workflow checklist complete, marketing changes committed and pushed.",
		checklist: [
			"Watch the walkthrough",
			"Save prompt + brief + copy sections on screen",
			"Commit and push marketing site updates",
			"Continue to Sandbox boot",
		],
		workbenchFields: [
			{
				id: CODEX_MARKETING_SITE_FIELD_IDS.savedPrompt,
				label: "Your reusable marketing-site prompt",
				kind: "textarea",
				required: true,
				rows: 12,
				placeholder:
					"Paste the instructor template, then edit with your product specifics…",
			},
			{
				id: CODEX_MARKETING_SITE_FIELD_IDS.product,
				label: "Product (one line)",
				kind: "text",
				required: true,
				placeholder: "What you are shipping (e.g. Figma plugin name + job)",
			},
			{
				id: CODEX_MARKETING_SITE_FIELD_IDS.audience,
				label: "Audience / ICP",
				kind: "text",
				required: true,
				placeholder: "Who it is for",
			},
			{
				id: CODEX_MARKETING_SITE_FIELD_IDS.problem,
				label: "Problem",
				kind: "textarea",
				required: true,
				rows: 3,
				placeholder: "The situation they are in",
			},
			{
				id: CODEX_MARKETING_SITE_FIELD_IDS.pain,
				label: "Pain",
				kind: "textarea",
				required: true,
				rows: 3,
				placeholder: "What hurts—emotionally or practically",
			},
			{
				id: CODEX_MARKETING_SITE_FIELD_IDS.frequency,
				label: "Frequency",
				kind: "text",
				required: true,
				placeholder: "How often it shows up",
			},
			{
				id: CODEX_MARKETING_SITE_FIELD_IDS.whyMatters,
				label: "Why it matters",
				kind: "textarea",
				required: true,
				rows: 3,
				placeholder: "Stakes if they do nothing",
			},
			{
				id: CODEX_MARKETING_SITE_FIELD_IDS.outcome,
				label: "Outcome",
				kind: "text",
				required: true,
				placeholder: "What “fixed” looks like",
			},
			{
				id: CODEX_MARKETING_SITE_FIELD_IDS.capability,
				label: "Product capability",
				kind: "textarea",
				required: true,
				rows: 3,
				placeholder: "What the product actually does (concrete)",
			},
			{
				id: CODEX_MARKETING_SITE_FIELD_IDS.copyEyebrow,
				label: "Eyebrow",
				kind: "textarea",
				required: true,
				rows: 2,
				placeholder: "Paste or draft the eyebrow line…",
			},
			{
				id: CODEX_MARKETING_SITE_FIELD_IDS.copySubheader,
				label: "Subheader",
				kind: "textarea",
				required: true,
				rows: 4,
				placeholder: "Supporting line under the headline…",
			},
			{
				id: CODEX_MARKETING_SITE_FIELD_IDS.copyPrimaryCta,
				label: "Primary CTA",
				kind: "textarea",
				required: true,
				rows: 2,
				placeholder: "Button or link label + microcopy if needed",
			},
			{
				id: CODEX_MARKETING_SITE_FIELD_IDS.copySecondaryCta,
				label: "Secondary CTA",
				kind: "textarea",
				required: true,
				rows: 2,
				placeholder: "Lower-commitment action",
			},
			{
				id: CODEX_MARKETING_SITE_FIELD_IDS.copyPromise,
				label: "Promise line",
				kind: "textarea",
				required: true,
				rows: 3,
				placeholder: "Clear promise tied to the outcome",
			},
			{
				id: CODEX_MARKETING_SITE_FIELD_IDS.copyHighlights,
				label: "Highlights",
				kind: "textarea",
				required: true,
				rows: 6,
				placeholder: "Bullets—max five concrete capabilities",
			},
			{
				id: CODEX_MARKETING_SITE_FIELD_IDS.copyFaq,
				label: "FAQ / comparison notes",
				kind: "textarea",
				required: true,
				rows: 6,
				placeholder: "Short Q&A or vs. alternatives",
			},
			{
				id: CODEX_MARKETING_SITE_FIELD_IDS.styleReferenceUrl,
				label: "Style reference URL (optional)",
				kind: "url",
				required: false,
				placeholder: "https://…",
				helpText:
					"Paste any site whose typography or palette you want to echo—borrow direction, do not copy assets.",
			},
			{
				id: CODEX_MARKETING_SITE_FIELD_IDS.workflow,
				label: "Workflow checklist",
				kind: "checklist",
				required: true,
				taskLabel: "Workflow complete",
				options: [...CODEX_MARKETING_WORKFLOW_CHECKLIST_OPTIONS],
			},
		],
		workbenchSections: [
			{
				id: "codex_marketing_brief",
				title: "Offer brief + prompt",
				layout: "stack",
				fieldIds: [
					CODEX_MARKETING_SITE_FIELD_IDS.savedPrompt,
					CODEX_MARKETING_SITE_FIELD_IDS.product,
					CODEX_MARKETING_SITE_FIELD_IDS.audience,
					CODEX_MARKETING_SITE_FIELD_IDS.problem,
					CODEX_MARKETING_SITE_FIELD_IDS.pain,
					CODEX_MARKETING_SITE_FIELD_IDS.frequency,
					CODEX_MARKETING_SITE_FIELD_IDS.whyMatters,
					CODEX_MARKETING_SITE_FIELD_IDS.outcome,
					CODEX_MARKETING_SITE_FIELD_IDS.capability,
				],
				completionLabel: "Brief captured",
			},
			{
				id: "codex_marketing_landing_copy",
				title: "Landing page copy",
				layout: "stack",
				fieldIds: [
					CODEX_MARKETING_SITE_FIELD_IDS.copyEyebrow,
					CODEX_MARKETING_SITE_FIELD_IDS.copySubheader,
					CODEX_MARKETING_SITE_FIELD_IDS.copyPrimaryCta,
					CODEX_MARKETING_SITE_FIELD_IDS.copySecondaryCta,
					CODEX_MARKETING_SITE_FIELD_IDS.copyPromise,
					CODEX_MARKETING_SITE_FIELD_IDS.copyHighlights,
					CODEX_MARKETING_SITE_FIELD_IDS.copyFaq,
				],
				completionLabel: "Copy sections filled",
			},
			{
				id: "codex_marketing_ship",
				title: "Style + ship",
				layout: "stack",
				fieldIds: [
					CODEX_MARKETING_SITE_FIELD_IDS.styleReferenceUrl,
					CODEX_MARKETING_SITE_FIELD_IDS.workflow,
				],
				completionLabel: "Ship loop done",
			},
		],
	}),
	createVideoLesson({
		id: "3.6",
		slug: "03-06-switch-to-sandbox-and-boot-local",
		order: 18,
		block: "BUILD",
		title: "Switch to Sandbox and Boot Local",
		shortTitle: "Sandbox",
		prevLessonId: "3.5",
		nextLessonId: "3.7",
	}),
	createVideoLesson({
		id: "3.7",
		slug: "03-07-read-and-execute-ai-plans",
		order: 19,
		block: "BUILD",
		title: "Read and Execute AI Plans",
		shortTitle: "AI Plans",
		prevLessonId: "3.6",
		nextLessonId: "3.8",
		workbench: "fresh_template_plan",
		intro:
			"Get a solid fresh-template plan from Codex before you write code—using Plan mode or a manual planning thread, with reasoning depth and an optional local reference repo path.",
		helperText:
			"Assemble and copy one prompt on this screen. Deep service setup comes in later lessons.",
		lessonMeta: {
			runtimeLabel: "~3 min video + prompt pass",
			goal: "A reviewed implementation plan for a fresh template—not shipped code.",
			purpose:
				"Make Plan mode vs manual planning visible, and capture stack context without turning this lesson into setup.",
		},
		teachingPoints: [
			"Plan first: no implementation until you approve the plan with your agent.",
			"Raise reasoning depth when architecture or tradeoffs are fuzzy; keep it lower for straightforward templates.",
			"Clarity beats perfect prompt formatting—one honest paragraph often wins.",
		],
		actionJobNow:
			"Fill the planning prompt, set reasoning depth, optionally add a reference path, copy into Codex, and keep the returned plan.",
		actionTimebox: "15–25 minutes",
		actionComeBackWith:
			"Assembled prompt, chosen reasoning level, optional reference path, and Codex’s plan text.",
		workbenchPrompt:
			"Use tabs for Plan mode vs manual, tune reasoning and stack flags, then copy the assembled prompt.",
		workbenchEmptyState:
			"Confirm the prompt body, set reasoning depth, optionally paste a reference path, and copy.",
		objectiveTitle: "Build 3.7 — Plan before coding",
		winCondition:
			"Video complete, planning prompt saved, reasoning depth chosen, assembled prompt ready to paste.",
		checklist: [
			"Watch the lesson",
			"Confirm planning prompt and reasoning depth",
			"Copy the assembled prompt into Codex (capture the plan if you want)",
		],
		workbenchSections: [
			{
				id: "fresh_plan_workflow",
				title: "Planning prompt",
				fieldIds: [
					FRESH_TEMPLATE_PLAN_FIELD_IDS.manualPrompt,
					FRESH_TEMPLATE_PLAN_FIELD_IDS.reasoning,
					FRESH_TEMPLATE_PLAN_FIELD_IDS.referencePath,
					FRESH_TEMPLATE_PLAN_FIELD_IDS.includeConvex,
					FRESH_TEMPLATE_PLAN_FIELD_IDS.includeNextjs,
					FRESH_TEMPLATE_PLAN_FIELD_IDS.includeClerk,
					FRESH_TEMPLATE_PLAN_FIELD_IDS.includeStripe,
					FRESH_TEMPLATE_PLAN_FIELD_IDS.stackOther,
				],
				completionLabel: "Prompt ready",
			},
			{
				id: "fresh_plan_capture",
				title: "Codex response",
				fieldIds: [FRESH_TEMPLATE_PLAN_FIELD_IDS.codexOutput],
				completionLabel: "Plan notes (optional)",
			},
		],
		workbenchFields: [
			{
				id: FRESH_TEMPLATE_PLAN_FIELD_IDS.manualPrompt,
				label: "Manual planning prompt",
				kind: "textarea",
				required: true,
				rows: 5,
			},
			{
				id: FRESH_TEMPLATE_PLAN_FIELD_IDS.reasoning,
				label: "Reasoning depth",
				kind: "text",
				required: true,
			},
			{
				id: FRESH_TEMPLATE_PLAN_FIELD_IDS.referencePath,
				label: "Reference codebase path",
				kind: "text",
				required: false,
				placeholder: "Paste local path from Finder",
			},
			{
				id: FRESH_TEMPLATE_PLAN_FIELD_IDS.includeConvex,
				label: "Include Convex",
				kind: "toggle",
				required: false,
			},
			{
				id: FRESH_TEMPLATE_PLAN_FIELD_IDS.includeNextjs,
				label: "Include Next.js",
				kind: "toggle",
				required: false,
			},
			{
				id: FRESH_TEMPLATE_PLAN_FIELD_IDS.includeClerk,
				label: "Include Clerk",
				kind: "toggle",
				required: false,
			},
			{
				id: FRESH_TEMPLATE_PLAN_FIELD_IDS.includeStripe,
				label: "Include Stripe",
				kind: "toggle",
				required: false,
			},
			{
				id: FRESH_TEMPLATE_PLAN_FIELD_IDS.stackOther,
				label: "Other stack notes",
				kind: "text",
				required: false,
				placeholder: "Other pieces of the puzzle",
			},
			{
				id: FRESH_TEMPLATE_PLAN_FIELD_IDS.codexOutput,
				label: "Codex plan",
				kind: "textarea",
				required: false,
				rows: 6,
			},
		],
	}),
	createVideoLesson({
		id: "3.8",
		slug: "03-08-build-setting-up-slices",
		order: 20,
		block: "BUILD",
		title: "Build Setting Up Slices",
		shortTitle: "Slices",
		prevLessonId: "3.7",
		nextLessonId: "3.9",
	}),
	createVideoLesson({
		id: "3.9",
		slug: "03-09-implement-the-first-slice",
		order: 21,
		block: "BUILD",
		title: "Implement the First Slice",
		shortTitle: "First Slice",
		prevLessonId: "3.8",
		nextLessonId: "3.10",
		workbench: "brand_kit_workbench",
		intro:
			"Fast brand setup before you build: working name, Figma logo export, favicons, one primary and one accent color, Stripe branding, and a domain—lightweight starter kit, not a full branding workshop.",
		helperText:
			"Use the checklist and inputs on screen; open tools from the resource buttons when you need them.",
		lessonMeta: {
			runtimeLabel: "Video + brand starter kit",
			goal: "Leave with a usable starter brand kit: name, domain, 500×500 icon PNG, wordmark, favicon pack, hex colors, and Stripe branding configured.",
			purpose:
				"Capture decisions on-screen so you ship assets instead of only watching a branding walkthrough.",
		},
		teachingPoints: [
			"Export one square 500×500 PNG for the app icon, then run it through favicon.io.",
			"Stripe Settings → Business → Branding should match what you show on the site.",
			"Stop at two hex codes (primary + accent) for this pass—skip endless palette exploration.",
		],
		actionJobNow:
			"Fill brand inputs, run the naming exercise, complete the artifact checklist, and wire Stripe + domain.",
		actionTimebox: "20–45 minutes",
		actionComeBackWith:
			"Working name, domain, icon PNG, favicon bundle, hex colors, and Stripe branding updated.",
		workbenchPrompt:
			"Treat this screen as the asset checklist—check items only when the file or setting is really done.",
		workbenchEmptyState:
			"Start with Brand inputs and the naming exercise, then work the checklist top to bottom.",
		objectiveTitle: "Build 3.9 — Brand starter kit",
		winCondition:
			"Brand inputs saved, naming notes captured, every checklist line checked, and video complete.",
		checklist: [
			"Watch the lesson",
			"Save brand inputs and naming notes",
			"Complete the artifact checklist",
		],
		workbenchFields: [
			{
				id: BRAND_KIT_APP_NAME_FIELD_ID,
				label: "App name",
				kind: "text",
				required: true,
				placeholder: "Working product name",
			},
			{
				id: BRAND_KIT_INITIALS_FIELD_ID,
				label: "Initials",
				kind: "text",
				required: true,
				placeholder: "e.g. SBS",
				helpText: "Short mark for the icon or compact UI.",
			},
			{
				id: BRAND_KIT_DOMAIN_FIELD_ID,
				label: "Domain",
				kind: "text",
				required: true,
				placeholder: "example.com",
			},
			{
				id: BRAND_KIT_PRIMARY_HEX_FIELD_ID,
				label: "Primary hex",
				kind: "text",
				required: true,
				placeholder: "#1a1a1a",
				helpText: "Primary brand color as #RRGGBB.",
			},
			{
				id: BRAND_KIT_ACCENT_HEX_FIELD_ID,
				label: "Accent hex",
				kind: "text",
				required: true,
				placeholder: "#6366f1",
				helpText: "One accent only for this pass (#RRGGBB).",
			},
			{
				id: BRAND_KIT_NAMING_FIELD_ID,
				label: "Naming exercise",
				kind: "textarea",
				required: true,
				rows: 6,
				placeholder:
					"List candidate words, constraints, and the working name you chose…",
			},
			{
				id: BRAND_KIT_ICON_UPLOAD_FIELD_ID,
				label: "Icon upload (optional)",
				kind: "image_upload",
				required: false,
				helpText:
					"Optional: attach your 500×500 PNG to preview next to the wordmark.",
			},
			{
				id: BRAND_KIT_WORDMARK_UPLOAD_FIELD_ID,
				label: "Wordmark upload (optional)",
				kind: "image_upload",
				required: false,
				helpText: "Optional: header/wordmark image for the preview card.",
			},
			{
				id: BRAND_KIT_ARTIFACT_CHECKLIST_FIELD_ID,
				label: "Brand kit checklist",
				kind: "checklist",
				required: true,
				taskLabel: "Brand kit checklist complete",
				options: [...BRAND_KIT_ARTIFACT_CHECKLIST_OPTIONS],
			},
		],
	}),
	createVideoLesson({
		id: "3.10",
		slug: "03-10-build-core-ux-plan-flow",
		order: 22,
		block: "BUILD",
		title: "Build Core UX Plan Flow",
		shortTitle: "UX Plan",
		prevLessonId: "3.9",
		nextLessonId: "3.11",
		workbench: "core_ux_plan_flow",
		fieldShapeVersion: 2,
		intro:
			"Turn a rough build idea into a safer v1 plan: trigger Codex planning mode, answer clarifying questions, inspect recommendation details, choose answers, then submit a concrete plan with slices, affected areas, risks, and dependencies.",
		helperText:
			"Use Instructor example vs Your version tabs, then fill the plan brief and checklist—same flow works from a sketch photo if that is all you have.",
		lessonMeta: {
			runtimeLabel: "Video + planning workbench",
			goal: "Leave with clarifying decisions captured, a reviewed v1 plan brief, and the exact planning trigger you can reuse.",
			purpose:
				"Make the workflow visible on-screen—commands, example rationale, your answers, compact plan snapshot—without relying on vague video callbacks.",
		},
		teachingPoints: [
			"Planning mode is the PM move: force scope questions before code; the architect move is reading why each default exists before you accept it.",
			"Use Shift+Tab (or the fallback prompt) so Codex asks clarifying questions instead of jumping straight to implementation.",
			"Expand each recommendation, choose answers deliberately, generate the plan, then confirm slices, codebase areas, risks, and dependencies in writing.",
		],
		actionJobNow:
			"Run planning mode, mirror the clarifying questions for your build, fill the plan brief, and tick the workflow checklist when each step is true.",
		actionTimebox: "25–45 minutes",
		actionComeBackWith:
			"Reusable trigger + fallback prompt, your clarifying answers, an approved v1 plan brief, and a completed on-screen checklist.",
		workbenchPrompt:
			"Tabs → Your version for your answers; expand Full plan brief for slices and dependencies; finish with the workflow checklist.",
		workbenchEmptyState:
			"Start with Commands, skim Instructor example, then capture your version and plan brief.",
		objectiveTitle: "Build 3.10 — Core UX plan flow",
		winCondition:
			"Clarifying answers and plan brief saved, workflow checklist complete, and you can name your install path and buyer-facing promise.",
		checklist: [
			"Watch the lesson",
			"Capture clarifying answers and plan brief on screen",
			"Complete the workflow checklist",
		],
		workbenchFields: [
			{
				id: CORE_UX_PLAN_FIELD_IDS.rawBuildIdea,
				label: "Rough build idea (optional)",
				kind: "textarea",
				required: false,
				rows: 4,
				placeholder:
					"One paragraph or bullet sketch—whiteboard photo counts; planning mode will still ask clarifying questions.",
			},
			{
				id: CORE_UX_PLAN_FIELD_IDS.releaseDistribution,
				label: "Release distribution (your build)",
				kind: "text",
				required: true,
				placeholder: "e.g. web-led install, app store first, …",
			},
			{
				id: CORE_UX_PLAN_FIELD_IDS.localBridge,
				label: "Local Codex bridge (your build)",
				kind: "text",
				required: true,
				placeholder: "e.g. keep the bridge, cut for v1, …",
			},
			{
				id: CORE_UX_PLAN_FIELD_IDS.buyerAiPromise,
				label: "Buyer-facing AI promise (your build)",
				kind: "textarea",
				required: true,
				rows: 3,
				placeholder:
					"What you actually ship vs imply (e.g. bring your own ChatGPT).",
			},
			{
				id: CORE_UX_PLAN_FIELD_IDS.installDestination,
				label: "After purchase, where do buyers install? (your build)",
				kind: "text",
				required: true,
				placeholder: "e.g. community listing, email instructions, in-app …",
			},
			{
				id: CORE_UX_PLAN_FIELD_IDS.planSlices,
				label: "Slices (v1 plan)",
				kind: "textarea",
				required: true,
				rows: 4,
				placeholder: "Ordered chunks of work for this pass.",
			},
			{
				id: CORE_UX_PLAN_FIELD_IDS.planAffectedAreas,
				label: "Affected codebase areas",
				kind: "textarea",
				required: true,
				rows: 3,
				placeholder: "Packages, routes, Convex, Stripe, auth, …",
			},
			{
				id: CORE_UX_PLAN_FIELD_IDS.planRisks,
				label: "Risks",
				kind: "textarea",
				required: true,
				rows: 3,
				placeholder: "Scope, quality, dependency, or timeline risks.",
			},
			{
				id: CORE_UX_PLAN_FIELD_IDS.planDependencies,
				label: "Dependencies",
				kind: "textarea",
				required: true,
				rows: 3,
				placeholder: "Services, keys, data, prior lessons, teammates, …",
			},
			{
				id: CORE_UX_PLAN_FIELD_IDS.workflowChecklist,
				label: "Workflow checklist",
				kind: "checklist",
				required: true,
				taskLabel: "Planning workflow complete",
				options: [...CORE_UX_PLAN_WORKFLOW_CHECKLIST_OPTIONS],
			},
		],
	}),
	createVideoLesson({
		id: "3.11",
		slug: "03-11-core-ux-build",
		order: 23,
		block: "BUILD",
		title: "Core UX Build",
		shortTitle: "UX Build",
		prevLessonId: "3.10",
		nextLessonId: "3.12",
		workbench: "core_ux_build",
		fieldShapeVersion: 2,
		intro:
			"First-use flow for a BYO-AI content app: three fast gates (ChatGPT, strategy, brand), concrete inputs (brand shots, blog link, post reference), then hand Codex one photo of all five screens plus a brief—clarity beats decoration.",
		helperText:
			"Work onboarding first, then Strategy → Brand → Source tabs. Finish with the Codex handoff checklist. This lesson ends with setup artifacts, not finished posts.",
		lessonMeta: {
			runtimeLabel: "Video + onboarding workbench",
			goal: "Onboarding checklist done, strategy prompt saved, brand + source inputs captured, Codex handoff package ready.",
			purpose:
				"Surface the same path the video names: connect ChatGPT, capture strategy and brand, add source material, preview what unlocks next, and ship the photo + brief artifact.",
		},
		teachingPoints: [
			"Treat the three onboarding lines as the contract—everything else hangs off those gates.",
			"Use ChatGPT with the on-screen prompt; fall back to the skeleton if strategy is still fuzzy.",
			"Brand references are screenshots or photos that define look-and-feel; source tab is blog + a post image to mimic.",
		],
		actionJobNow:
			"Complete onboarding, fill Strategy / Brand / Source, then capture the five-screen photo and Codex brief checklist.",
		actionTimebox: "15–30 minutes",
		actionComeBackWith:
			"Checklist complete, strategy prompt in your notes, brand gallery + blog + mimic image saved, photo + brief handoff checked off.",
		workbenchPrompt:
			"Top: onboarding + Connect ChatGPT. Tabs: strategy prompt, brand + template, source inputs. Bottom: handoff.",
		workbenchEmptyState:
			"Start with onboarding and Connect ChatGPT, then work the tabs in order.",
		objectiveTitle: "Build 3.11 — Core UX onboarding + Codex handoff",
		winCondition:
			"Onboarding checklist complete, strategy prompt non-empty, at least one brand reference, blog URL + mimic image, Codex brief filled, handoff checklist complete.",
		checklist: [
			"Watch the lesson",
			"Finish the three-item onboarding checklist",
			"Capture strategy, brand references, and source inputs",
			"Complete Codex handoff (photo + brief)",
		],
		workbenchSections: [
			{
				id: "core_ux_onboarding",
				title: "Onboarding",
				layout: "stack",
				fieldIds: [CORE_UX_BUILD_FIELD_IDS.onboardingChecklist],
				completionLabel: "Onboarding complete",
			},
			{
				id: "core_ux_workspace",
				title: "Strategy, brand, and source",
				layout: "stack",
				fieldIds: [
					CORE_UX_BUILD_FIELD_IDS.strategyPrompt,
					CORE_UX_BUILD_FIELD_IDS.brandReferences,
					CORE_UX_BUILD_FIELD_IDS.blogLink,
					CORE_UX_BUILD_FIELD_IDS.postMimicImage,
				],
				completionLabel: "Inputs captured",
			},
			{
				id: "core_ux_handoff",
				title: "Codex handoff",
				layout: "stack",
				fieldIds: [
					CORE_UX_BUILD_FIELD_IDS.codexBrief,
					CORE_UX_BUILD_FIELD_IDS.handoffChecklist,
				],
				completionLabel: "Handoff package ready",
			},
		],
		workbenchFields: [
			{
				id: CORE_UX_BUILD_FIELD_IDS.onboardingChecklist,
				label: "Onboarding requirements",
				kind: "checklist",
				required: true,
				taskLabel: "Onboarding checklist complete",
				options: [...CORE_UX_BUILD_ONBOARDING_CHECKLIST_OPTIONS],
			},
			{
				id: CORE_UX_BUILD_FIELD_IDS.strategyPrompt,
				label: "Strategy prompt (edit, copy to ChatGPT)",
				kind: "textarea",
				required: true,
				rows: 12,
				helpText:
					"Save a version in your notes after ChatGPT responds; tick “Set strategy” when your v1 strategy is captured.",
			},
			{
				id: CORE_UX_BUILD_FIELD_IDS.brandReferences,
				label: "Brand references",
				kind: "reference_gallery",
				required: true,
				minItems: 1,
				helpText:
					"Upload screenshots or photos that define look and feel. Tick “Set brand” when this set reflects your v1 brand.",
			},
			{
				id: CORE_UX_BUILD_FIELD_IDS.blogLink,
				label: "Blog link (source material)",
				kind: "url",
				required: true,
				placeholder: "https://…",
				helpText:
					"A post or article the product should lean on for substance or voice.",
			},
			{
				id: CORE_UX_BUILD_FIELD_IDS.postMimicImage,
				label: "Image upload (post to mimic)",
				kind: "image_upload",
				required: true,
				helpText:
					"A reference screenshot or export of a post style you want to echo.",
			},
			{
				id: CORE_UX_BUILD_FIELD_IDS.codexBrief,
				label: "Codex implementation brief (dictate or edit)",
				kind: "textarea",
				required: true,
				rows: 10,
				helpText:
					"Prefilled template—replace with your voice memo transcript or tighten in text before handing to Codex.",
			},
			{
				id: CORE_UX_BUILD_FIELD_IDS.handoffChecklist,
				label: "Handoff package",
				kind: "checklist",
				required: true,
				taskLabel: "Codex handoff complete",
				options: [...CORE_UX_BUILD_HANDOFF_CHECKLIST_OPTIONS],
			},
		],
	}),
	createVideoLesson({
		id: "3.12",
		slug: "03-12-core-ux-build-3",
		order: 24,
		block: "BUILD",
		title: "Core UX Build 3",
		shortTitle: "UX Build 3",
		prevLessonId: "3.11",
		nextLessonId: "3.13",
		workbench: "checkout_qa_loop",
		fieldShapeVersion: 1,
		intro:
			"Run a focused QA pass on the fresh-account checkout path: local app and Stripe test stack running, QA Browser skill + Playwright driving the browser, you steering when Clerk blocks the run, and a written report of real bugs—not launch work.",
		helperText:
			"One prompt, one preflight checklist, one issue log on screen. Use the README link before you get stuck on setup. Deploy and prod env vars wait in lesson 3.14.",
		lessonMeta: {
			runtimeLabel: "Video + checkout QA loop",
			goal: "Execute a fresh-account purchase QA pass and capture a pass/fail report with concrete issues.",
			purpose:
				"Practice the loop after a prototype ships locally: name dependencies (QA skill, Playwright, Clerk, Stripe test mode), run the browser pass, interrupt and redirect the agent, and log bugs like stale price and verification walls.",
		},
		teachingPoints: [
			"Preflight the stack (app, site, Stripe test + webhooks, account strategy) before you ask the agent to drive the browser.",
			"When Clerk verification or sign-up blocks automation, steer with the Clerk skill and announce any dashboard changes before retry.",
			"The target UX is buy first, then account creation tied to the Stripe checkout email—not a long signup detour before pay.",
		],
		actionJobNow:
			"Complete preflight, copy the QA prompt, run the Playwright pass, toggle run status as you go, and write the fresh-account checkout QA report.",
		actionTimebox: "45–90 minutes",
		actionComeBackWith:
			"Reusable QA prompt (edited if needed), completed preflight, pass/fail report, and a short bug list including any verification, pricing, or contrast issues.",
		workbenchPrompt:
			"Work Prompt → Issues → Resources: checklist and prompt first, then log findings in the report field.",
		workbenchEmptyState:
			"Start on the Prompt tab: confirm preflight, then copy the QA test prompt to your agent.",
		objectiveTitle: "Build 3.12 — Fresh-account checkout QA",
		winCondition:
			"Preflight checklist complete, QA report filled in, and you can name the intended purchase-first account flow.",
		checklist: [
			"Watch the lesson",
			"Complete the testing preflight checklist",
			"Run the fresh-account checkout QA pass with your agent",
			"Capture the QA report and bug notes",
		],
		workbenchSections: [
			{
				id: "checkout_qa_preflight",
				title: "Testing preflight",
				layout: "stack",
				fieldIds: [CHECKOUT_QA_PREFLIGHT_FIELD_ID],
				completionLabel: "Preflight complete",
			},
			{
				id: "checkout_qa_report",
				title: "QA report",
				layout: "stack",
				fieldIds: [CHECKOUT_QA_REPORT_FIELD_ID],
				completionLabel: "Report captured",
			},
		],
		workbenchFields: [
			{
				id: CHECKOUT_QA_PREFLIGHT_FIELD_ID,
				label: "Testing preflight checklist",
				kind: "checklist",
				required: true,
				taskLabel: "Preflight checklist complete",
				options: [...CHECKOUT_QA_PREFLIGHT_OPTIONS],
				helpText:
					"Confirm your local stack matches what the agent will hit, including Stripe test mode and webhook forwarding if your README requires it.",
			},
			{
				id: CHECKOUT_QA_PROMPT_FIELD_ID,
				label: "QA test prompt (editable)",
				kind: "textarea",
				required: false,
				rows: 6,
				helpText:
					"Prefilled with the instructor-style request. Copy as-is or tune for your URLs and product name.",
			},
			{
				id: CHECKOUT_QA_REPORT_FIELD_ID,
				label: "Fresh-account checkout QA report",
				kind: "textarea",
				required: true,
				rows: 8,
				placeholder:
					"Pass or fail, steps covered, blockers, bugs (verification detour, stale Stripe price, contrast/copy…)",
				helpText:
					"Include pass/fail, where the run stopped, and the bug queue you care about for the next fix pass.",
			},
			{
				id: CHECKOUT_QA_CURRENT_STEP_FIELD_ID,
				label: "Current step (live status)",
				kind: "text",
				required: false,
				placeholder: "Optional: what the agent is doing now",
			},
			{
				id: CHECKOUT_QA_LAST_ISSUE_FIELD_ID,
				label: "Last issue found (live status)",
				kind: "text",
				required: false,
				placeholder: "Optional: latest bug or blocker",
			},
			{
				id: CHECKOUT_QA_BROWSER_FIELD_ID,
				label: "QA browser session running",
				kind: "toggle",
				required: false,
				helpText:
					"Flip when your agent has an active browser pass—helps you remember mid-run state.",
			},
			{
				id: CHECKOUT_QA_SCENARIO_FIELD_ID,
				label: "Account scenario",
				kind: "text",
				required: false,
				helpText: "Managed by the Fresh / Existing toggle on the workbench.",
			},
		],
	}),
	createVideoLesson({
		id: "3.13",
		slug: "03-13-debug-and-stabilize-without-spiraling",
		order: 25,
		block: "BUILD",
		title: "Debug and Stabilize Without Spiraling",
		shortTitle: "Debug",
		prevLessonId: "3.12",
		nextLessonId: "3.14",
	}),
	createVideoLesson({
		id: "3.14",
		slug: "03-14-wrapping",
		order: 26,
		block: "BUILD",
		title: "Production Deploy Handoff",
		shortTitle: "Deploy handoff",
		prevLessonId: "3.13",
		nextLessonId: "3.15",
		workbench: "production_deploy_handoff",
		intro:
			"Collect production credentials and run the deploy checklist—Cloudflare, Stripe, Clerk, Vercel, and Convex—without exposing secrets.",
		helperText:
			"Use the checklist and accordions, copy the README prompt for your agent, and paste keys only where your README says they belong.",
		lessonMeta: {
			runtimeLabel: "Video + credential checklist",
			goal: "Hand off production tokens and env keys safely so the app can go live on your domain.",
			purpose:
				"Surface the exact services, permissions, and steps from the walkthrough in one lightweight screen.",
		},
		teachingPoints: [
			"Cloudflare token needs Zone DNS Edit and Zone Zone Read—nothing extra.",
			"Stripe must be in Production mode before you copy the secret key; mirror product and price from dev.",
			"Clerk production keys are separate from dev—collect publishable and secret for prod.",
		],
		actionJobNow:
			"Complete the checklist, add product name and domain, gather secrets locally, and copy the handoff packet for your agent.",
		actionTimebox: "30–60 minutes",
		actionComeBackWith:
			"Deploy steps checked off, prod credentials ready for env vars, and success checks verified.",
		workbenchPrompt:
			"Use this screen as the single checklist—do not improvise Cloudflare scopes or skip Stripe prod confirmation.",
		workbenchEmptyState:
			"Start with Before you deploy and tick each step as you go.",
		objectiveTitle: "Build 3.14 — Production deploy handoff",
		winCondition:
			"Deployment checklist complete, product name and domain saved, and you can confirm a live site plus backend.",
		checklist: [
			"Watch the lesson",
			"Complete the deployment steps checklist",
			"Save product name and domain",
			"Gather production credentials for your agent (not stored here)",
		],
		workbenchFields: [
			{
				id: DEPLOY_STEPS_FIELD_ID,
				label: "Deployment steps",
				kind: "checklist",
				required: true,
				taskLabel: "Deploy flow complete",
				options: [...DEPLOY_STEP_OPTIONS],
			},
			{
				id: DEPLOY_PRODUCT_NAME_FIELD_ID,
				label: "Product name",
				kind: "text",
				required: true,
				placeholder: "As it will appear on the live site",
			},
			{
				id: DEPLOY_DOMAIN_FIELD_ID,
				label: "Domain",
				kind: "text",
				required: true,
				placeholder: "example.com",
			},
			{
				id: DEPLOY_SUCCESS_FIELD_ID,
				label: "Tick when each check is true",
				kind: "checklist",
				required: false,
				options: [...DEPLOY_SUCCESS_OPTIONS],
			},
		],
	}),
	createVideoLesson({
		id: "3.15",
		slug: "03-15-create-production-instance",
		order: 27,
		block: "BUILD",
		title: "Create Production Instance",
		shortTitle: "Production",
		prevLessonId: "3.14",
		nextLessonId: "3.16",
	}),
	createVideoLesson({
		id: "3.16",
		slug: "03-16-finalize-build-handoff-and-unlock-ship",
		order: 28,
		block: "BUILD",
		title: "Finalize Build Handoff and Unlock Ship",
		shortTitle: "Handoff",
		prevLessonId: "3.15",
		nextLessonId: "4.0",
		unlockBlocks: ["SHIP"],
	}),
] satisfies LessonConfig[];
