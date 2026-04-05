import path from "node:path";
import { recommendedStartupCommands } from "../command-catalog";
import { renderStartupBanner } from "../theme/render-banner";
import { paint, dim, type CliRenderOptions } from "../theme/render-theme";

export function renderEntrySurface({
	projectRootPath,
	options,
}: {
	projectRootPath: string;
	options: CliRenderOptions;
}) {
	const repositoryName = path.basename(projectRootPath) || projectRootPath;
	const lines = [
		renderStartupBanner(options),
		"",
		paint(`Repository: ${repositoryName}`, "heading", options),
		dim(`Working root: ${projectRootPath}`, options),
		paint(
			"Guided blueprint intake, readiness checks, and Ship by Sunday Blueprint generation for this repository.",
			"focus",
			options,
		),
		"",
		paint("Recommended next commands", "heading", options),
		...recommendedStartupCommands.map(
			(command) => `  ${paint(command, "active", options)}`,
		),
	];

	return lines.join("\n");
}
