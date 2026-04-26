export {
	BUILD_SKILLS_FIRST_TAGGED_PROMPT_FIELD_ID,
	BUILD_SKILLS_USAGE_CHECKLIST_FIELD_ID,
} from "@/features/course/lesson/model/completion-field-ids";

export const SKILLS_USAGE_CHECKLIST_OPTIONS = [
	"I picked the right specialist category for this question",
	"I used $ with the exact skill slug in my prompt",
	"I asked a specific question or named a concrete task",
	"I included enough product context for the tool to help",
] as const;

export const PROMPT_PATTERN_TEMPLATE = `$<skill-slug>

<Your concrete question or task — include product context, URLs, stack, and what “done” looks like.>`;

export const PROMPT_EXAMPLES_BLOCK = `$clerk-setup
Wire email/password sign-in for our Next.js App Router app. List the env vars and files I need to touch.

$convex
Add a query that returns open tasks for the signed-in user and explain the index I need.

$avoid-feature-creep
We want to add X — check it against our current checkout-only scope and say keep vs defer.

$qa-browser
Smoke-test sign-in on my staging URL with these steps: …`;

export const SKILLS_QUICKSTART_FULL_COPY = `Skills quickstart — invocation pattern
${PROMPT_PATTERN_TEMPLATE}

Example prompts
${PROMPT_EXAMPLES_BLOCK}

Category first (rule of thumb)
• Auth / identity → Clerk
• Backend data / realtime → Convex
• Scope control → avoid-feature-creep (or similar)
• Real browser QA → qa-browser
`;

export const SKILL_PATH_CURSOR =
	".cursor/skills (or .cursor/skills-cursor in your home folder)";
export const SKILL_PATH_CODEX = "~/.codex/skills (Codex CLI home)";
export const SKILL_OPEN_HINT =
	"In Cursor: Command Palette → skills / open skills folder (wording varies by version). In VS Code: use the Codex or agent extension’s skills panel, then open the backing markdown file.";
