import { buildGeneratedDesignSystem } from "@shipbysunday/codebase-compiler";

export const generatedDesignSystem = buildGeneratedDesignSystem({
	product_name: "Ship by Sunday",
	product_summary:
		"Ship a real, durable product by Sunday with contract-first docs packs and an agent-ready starter system.",
	primary_user: "Founders and operators building a product with AI tools.",
	problem_statement:
		"AI-generated product work often looks generic and loses design consistency as the repo evolves.",
	success_looks_like:
		"The generated repo ships with a portable design system and a starter app that already uses it.",
	outcome_statement:
		"Ship a real, durable product by Sunday with a starter repo that keeps design context attached to the codebase.",
	core_flow: [
		"Choose the product direction",
		"Review the generated packs",
		"Ship the starter repo",
	],
	theme_preset: "a0",
	copy_tone: "Confident, specific, and non-hype.",
});
