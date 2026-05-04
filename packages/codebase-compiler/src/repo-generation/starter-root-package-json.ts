import type { CanonicalProjectDefinition } from "../canonical-project-definition/project-definition";
import { buildRepoGenerationManifest } from "./build-repo-generation-manifest";

export const STARTER_ROOT_PACKAGE_SCRIPTS = {
	bootstrap: "bash ./bootstrap.sh",
	"codex:skills:install": "bash ./scripts/install-codex-skills.sh",
	dev: "bun run --cwd apps/web dev",
	"dev:core": "bun run --cwd apps/web dev:core",
	"dev:web": "bun run --cwd apps/web dev:web",
	"dev:convex": "bun run --cwd apps/web dev:convex",
	"dev:stripe": "bun run --cwd apps/web dev:stripe",
	"dev:full": "bun run --cwd apps/web dev:full",
	build: "bun run --cwd apps/web build",
	start: "bun run --cwd apps/web start",
	typecheck: "bun run --cwd apps/web typecheck",
	lint: "bun run --cwd apps/web lint",
	"lint:fix": "bun run --cwd apps/web lint:fix",
	format: "bun run --cwd apps/web format",
	"format:check": "bun run --cwd apps/web format:check",
	"test:unit": "bun run --cwd apps/web test:unit",
	"test:contracts": "bun run --cwd apps/web test:contracts",
	"test:integration": "bun run --cwd apps/web test:integration",
	"test:e2e:sandbox": "bun run --cwd apps/web test:e2e:sandbox",
	"test:compiler": "bun run --cwd packages/codebase-compiler test",
	check: "bun run --cwd apps/web check",
} as const;

export type StarterRootPackageScriptName =
	keyof typeof STARTER_ROOT_PACKAGE_SCRIPTS;

export function hasStarterRootPackageScript(scriptName: string) {
	return Object.hasOwn(STARTER_ROOT_PACKAGE_SCRIPTS, scriptName);
}

export function buildStarterRootPackageJson(
	projectDefinition: CanonicalProjectDefinition,
) {
	const manifest = buildRepoGenerationManifest(projectDefinition);

	return {
		name: manifest.repoName,
		version: "0.1.0",
		private: true,
		packageManager: "bun@1.3.5",
		workspaces: ["apps/web", "packages/*"],
		scripts: STARTER_ROOT_PACKAGE_SCRIPTS,
	};
}
