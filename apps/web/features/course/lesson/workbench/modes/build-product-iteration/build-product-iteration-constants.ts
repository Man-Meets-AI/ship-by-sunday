export const BUILD_PRODUCT_ITERATION_FIELD_IDS = {
	setupChecklist: "build_product_iteration_setup_checklist",
	brandStrategy: "build_product_iteration_brand_strategy",
	brandDesign: "build_product_iteration_brand_design",
	starterIdea: "build_product_iteration_starter_idea",
	generatedPosts: "build_product_iteration_generated_posts",
} as const;

export const BUILD_PRODUCT_ITERATION_SETUP_CHECKLIST_OPTIONS = [
	"Linked paid product account (private starter / template access)",
	"Connected ChatGPT account in course settings",
	"Pasted this lesson’s prompt into ChatGPT",
	"Saved the response into brand + outputs below",
	"Picked one starter idea",
	"Generated a first batch of posts",
] as const;

export const BUILD_PRODUCT_ITERATION_CHATGPT_PROMPT = `You are helping me ship a v1 product with AI-assisted iteration.

Before you answer, I will paste (or you can ask me for) in one message:
- What I am building in one sentence
- Who it is for
- The main pain I am solving

Your job:

1) Write **Brand strategy instructions** — positioning, audience, promise, voice principles, and what we refuse to sound like.

2) Write **Brand design instructions** — visual direction, typography mood, color constraints, imagery rules, and tone for UI + marketing.

Use exactly these markdown headings:
## Brand strategy instructions
## Brand design instructions

3) Under ## Starter ideas, give 5 short angles or hooks I could test (bullets).

4) Under ## Generated posts, draft 5 concrete social posts I can edit and ship as a first batch.

Keep everything practical for a solo builder; avoid generic fluff.`;
