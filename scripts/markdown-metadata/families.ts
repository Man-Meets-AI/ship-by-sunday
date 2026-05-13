export type MarkdownMetadataFamily =
	| "repo_doc"
	| "exec_plan"
	| "program_doc"
	| "web_docs_page"
	| "blog_post";

export type FamilyRule = {
	allowUnknownKeys?: boolean;
	optionalKeys?: string[];
	requireH1TitleMatch?: boolean;
	requiredKeys: string[];
};

const ROOT_DOC_PATHS = new Set([
	"docs/index.md",
	"docs/ARCHITECTURE.md",
	"docs/RELIABILITY.md",
	"docs/SECURITY.md",
	"docs/FRONTEND.md",
	"docs/DESIGN.md",
	"docs/PRODUCT_SENSE.md",
	"docs/QUALITY_SCORE.md",
	"docs/PLANS.md",
	"docs/programs/README.md",
	"docs/programs/PROGRAMS.md",
	"docs/programs/active/index.md",
	"docs/programs/completed/index.md",
	"docs/exec-plans/index.md",
	"docs/exec-plans/PLANS.md",
	"docs/exec-plans/tech-debt-tracker.md",
	"docs/design-docs/index.md",
	"docs/references/README.md",
	"docs/product-specs/index.md",
]);

export const FAMILY_RULES: Record<
	Exclude<MarkdownMetadataFamily, "exec_plan" | "program_doc">,
	FamilyRule
> = {
	repo_doc: {
		requiredKeys: ["title", "summary", "docType", "status", "read_when"],
		requireH1TitleMatch: true,
	},
	web_docs_page: {
		requiredKeys: ["title", "description"],
		requireH1TitleMatch: true,
		allowUnknownKeys: true,
	},
	blog_post: {
		requiredKeys: [
			"title",
			"description",
			"summary",
			"publishedAt",
			"authorName",
			"authorRole",
			"heroMediaKind",
			"heroMediaSrc",
		],
		optionalKeys: ["featured", "draft", "heroPosterSrc"],
		allowUnknownKeys: false,
		requireH1TitleMatch: false,
	},
};

export function resolveMarkdownMetadataFamily(
	repoPath: string,
): MarkdownMetadataFamily | null {
	if (
		repoPath.endsWith(".md") &&
		(repoPath.startsWith("docs/exec-plans/active/") ||
			repoPath.startsWith("docs/exec-plans/completed/"))
	) {
		return "exec_plan";
	}

	if (
		repoPath.endsWith("/program.md") &&
		(repoPath.startsWith("docs/programs/active/") ||
			repoPath.startsWith("docs/programs/completed/"))
	) {
		return "program_doc";
	}

	if (repoPath.endsWith(".md") && ROOT_DOC_PATHS.has(repoPath)) {
		return "repo_doc";
	}

	if (
		repoPath.endsWith(".mdx") &&
		repoPath.startsWith("apps/web/src/content/docs/")
	) {
		return "web_docs_page";
	}

	if (
		repoPath.endsWith(".mdx") &&
		repoPath.startsWith("apps/web/src/content/blog/")
	) {
		return "blog_post";
	}

	return null;
}
