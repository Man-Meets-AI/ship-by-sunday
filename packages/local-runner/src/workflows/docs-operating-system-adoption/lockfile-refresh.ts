import {
	DOCS_OPERATING_SYSTEM_LOCKFILE_REFS,
	DOCS_OPERATING_SYSTEM_SHARED_TOOLING_PACKAGE_NAME,
	DOCS_OPERATING_SYSTEM_SHARED_TOOLING_PACKAGE_VERSION,
} from "./manifest";
import type {
	DocsOperatingSystemLockfileRefreshBlockedReason,
	DocsOperatingSystemLockfileRefreshCommand,
} from "./schemas";
import type { JsonObject, JsonValue } from "../../core/json-value";

export function resolveDocsOperatingSystemLockfileRefreshCommand(
	packageManager: string,
):
	| {
			status: "ready";
			command: DocsOperatingSystemLockfileRefreshCommand;
	  }
	| {
			status: "blocked";
			blockedReason: DocsOperatingSystemLockfileRefreshBlockedReason;
	  } {
	if (packageManager === "bun") {
		return {
			status: "ready",
			command: {
				packageManager,
				command: "bun",
				args: ["install", "--lockfile-only", "--ignore-scripts"],
				commandName: "bun install --lockfile-only --ignore-scripts",
				expectedLockfileRefs: ["bun.lock", "bun.lockb"],
			},
		};
	}

	if (packageManager === "npm") {
		return {
			status: "ready",
			command: {
				packageManager,
				command: "npm",
				args: ["install", "--package-lock-only", "--ignore-scripts"],
				commandName: "npm install --package-lock-only --ignore-scripts",
				expectedLockfileRefs: ["package-lock.json", "npm-shrinkwrap.json"],
			},
		};
	}

	if (packageManager === "pnpm") {
		return {
			status: "ready",
			command: {
				packageManager,
				command: "pnpm",
				args: [
					"install",
					"--lockfile-only",
					"--ignore-scripts",
					"--ignore-pnpmfile",
					"--no-frozen-lockfile",
				],
				commandName:
					"pnpm install --lockfile-only --ignore-scripts --ignore-pnpmfile --no-frozen-lockfile",
				expectedLockfileRefs: ["pnpm-lock.yaml"],
			},
		};
	}

	return {
		status: "blocked",
		blockedReason: {
			stage: "package-manager",
			reason:
				packageManager === "yarn"
					? "Yarn lockfile-only refresh is not approved in this slice."
					: `Package manager ${packageManager} is not supported by docs operating system lockfile refresh.`,
		},
	};
}

export function listDocsOperatingSystemLockfileRefs() {
	return [...DOCS_OPERATING_SYSTEM_LOCKFILE_REFS];
}

export function hasPinnedSharedToolingDependency(
	packageJson: JsonValue | undefined,
) {
	if (!packageJson || typeof packageJson !== "object") {
		return false;
	}
	const manifest = packageJson as {
		dependencies?: JsonObject;
		devDependencies?: JsonObject;
	};
	const devDependencyVersion =
		manifest.devDependencies?.[
			DOCS_OPERATING_SYSTEM_SHARED_TOOLING_PACKAGE_NAME
		];
	const dependencyVersion =
		manifest.dependencies?.[DOCS_OPERATING_SYSTEM_SHARED_TOOLING_PACKAGE_NAME];
	return (
		devDependencyVersion ===
			DOCS_OPERATING_SYSTEM_SHARED_TOOLING_PACKAGE_VERSION ||
		dependencyVersion === DOCS_OPERATING_SYSTEM_SHARED_TOOLING_PACKAGE_VERSION
	);
}
