export { CORE_UX_BUILD_FIELD_IDS } from "@/features/course/lesson/model/completion-field-ids";

export const CORE_UX_BUILD_ONBOARDING_CHECKLIST_OPTIONS = [
	"Connect ChatGPT",
	"Set strategy",
	"Set brand",
] as const;

export const CORE_UX_BUILD_HANDOFF_CHECKLIST_OPTIONS = [
	"Captured one photo showing all five core UX screens for this flow",
	"Recorded implementation brief for Codex (voice memo or text)",
] as const;

export const CORE_UX_BUILD_DEFAULT_STRATEGY_PROMPT = `You are my product strategist for a BYO-AI content app (students bring their own ChatGPT).

Summarize in bullets:
1) Who the app is for and the job-to-be-done
2) The core loop (3–5 steps) users follow
3) What “on strategy” means for our v1 (what we say yes/no to)
4) Voice/tone rules that keep posts on-brand

Keep it under 200 words. I will paste this into my build notes and ChatGPT system context.`;

export const CORE_UX_BUILD_STRATEGY_FALLBACK_PROMPT = `I do not have a full strategy yet. Draft a minimal v1 strategy skeleton I can refine later:
- Audience: (guess from my product name if needed)
- Core loop: sign in → capture idea → generate post → publish
- v1 safeguard: ship one workflow end-to-end; defer analytics and multi-tenant
- Tone: clear, direct, no hype

I will replace placeholders after the next CEO lesson.`;

export const CORE_UX_BUILD_DEFAULT_CODEX_BRIEF = `Codex implementation brief (dictate or edit here)

Product name:
What the five screens in my photo are (name each, left to right or top to bottom):
What I want built or changed next (one concrete outcome):
Brand/strategy constraints to respect:
Open questions or risks:`;

export const CHATGPT_ORIGIN_URL = "https://chatgpt.com";
