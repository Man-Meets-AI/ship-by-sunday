import { productConfig, routeConfig } from "@/config/product";
import type { LessonConfig } from "@/features/course/lesson/model/contracts";
import {
  DEPLOY_DOMAIN_FIELD_ID,
  DEPLOY_PRODUCT_NAME_FIELD_ID,
  DEPLOY_STEPS_FIELD_ID,
  DEPLOY_SUCCESS_FIELD_ID,
  DEPLOY_STEP_OPTIONS,
  DEPLOY_SUCCESS_OPTIONS,
} from "@/features/course/lesson/workbench/modes/production-deploy-handoff/production-deploy-handoff-constants";
import { REPO_ACCOUNTS_FIELD_ID } from "@/features/course/lesson/workbench/modes/repo-map-constants";
import {
  BUILD_PRODUCT_ITERATION_FIELD_IDS,
  BUILD_PRODUCT_ITERATION_SETUP_CHECKLIST_OPTIONS,
} from "@/features/course/lesson/workbench/modes/build-product-iteration/build-product-iteration-constants";
import { createVideoLesson } from "@/features/course/lesson/model/video-lesson-factory";

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
    workbenchFields: [
      {
        id: REPO_ACCOUNTS_FIELD_ID,
        label: "Accounts + services checklist",
        kind: "checklist",
        required: true,
        taskLabel: "Required accounts ready",
        options: ["GitHub", "Stripe", "Convex", "Clerk"],
        helpText:
          "Check each when you can sign in and complete the basics you will need for this repo.",
      },
    ],
    checklist: [
      "Watch the repo walkthrough",
      "Skim the project map and commands tabs",
      "Confirm required accounts are in place",
    ],
    teachingPoints: [
      "Match the folder names you hear to this explorer layout.",
      "Treat `.env` as secrets—never paste keys into chat or commits.",
      "Use this screen as reference; you do not need to memorize every path.",
    ],
    helperText:
      "Orientation only: map the starter in VS Code, then check off the services you will lean on.",
    winCondition:
      "Accounts checklist is complete and you know where routes, UI, backend, secrets, and scripts live.",
    intro:
      "Ground yourself in the starter the same way you would scan a new repo in VS Code—folders, env files, and the scripts you will run all week.",
    lessonMeta: {
      runtimeLabel: "~5 min + skim",
      goal: "See how the starter is organized and which external accounts you need next.",
      purpose:
        "In-product cheat sheet for app/, components/, convex/, env files, AGENTS.md, and package scripts—lightweight reference, not a build step.",
    },
    actionJobNow:
      "Watch the walkthrough, skim the Project map and Commands tabs, check off accounts you have access to.",
    actionTimebox: "5–10 minutes",
    actionComeBackWith:
      "You know where pages, shared UI, Convex, secrets, agent notes, and npm scripts live.",
    workbenchPrompt:
      "Use Project map, Accounts, and Commands while you follow along in the editor.",
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
