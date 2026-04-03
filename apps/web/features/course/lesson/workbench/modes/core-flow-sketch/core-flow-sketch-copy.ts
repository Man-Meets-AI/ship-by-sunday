export const CORE_FLOW_SCREEN_REFERENCE = [
	{
		label: "Plugin opens inside Figma",
		hint: "Your UI lives where the user already works.",
	},
	{
		label: "Learning your brand",
		hint: "Onboarding / detection before ideas.",
	},
	{
		label: "Connect GPT",
		hint: "Assume ChatGPT for this workflow.",
	},
	{
		label: "Brand Profile",
		hint: "Consolidated brand context.",
	},
	{
		label: "Ideas for Posts",
		hint: "Aha: content ideas surfaced quickly.",
	},
	{
		label: "Brand Settings",
		hint: "Adjust voice, safeguards, or visuals.",
	},
	{
		label: "Generate from Template",
		hint: "One simple template target—no template-hunting.",
	},
] as const;

export const BRAND_GUIDE_META_PROMPT = `You are helping me create a lightweight brand guide for a builder product. Ask concise questions one at a time. Output a single page I can paste into Figma or Canva: brand name, one-line promise, voice (do/don't), primary colors, typefaces, logo usage (if any), and 3 example post lines. Keep it shippable in under 15 minutes.`;

export const CRAZY_EIGHTS_CLIPBOARD_TEMPLATE = [
	"Crazy Eights — 8 ideas (2 minutes, paper or digital)",
	"",
	"[1] ________  [2] ________",
	"[3] ________  [4] ________",
	"[5] ________  [6] ________",
	"[7] ________  [8] ________",
].join("\n");
