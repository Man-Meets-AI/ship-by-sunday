export type CliRenderOptions = {
	colorEnabled: boolean;
	terminalWidth: number | null;
};

type ThemeRole =
	| "active"
	| "burn"
	| "focus"
	| "frame"
	| "heading"
	| "muted"
	| "value";

const roleStyles: Record<ThemeRole, string> = {
	focus: "1;38;2;190;184;86",
	active: "1;38;2;157;168;60",
	burn: "1;38;2;190;161;55",
	frame: "1;38;2;118;126;50",
	heading: "1;38;2;201;190;102",
	muted: "38;2;111;115;78",
	value: "1;38;2;178;161;68",
};

export function createCliRenderOptions(): CliRenderOptions {
	return {
		colorEnabled:
			Boolean(process.stdout.isTTY) && process.env.NO_COLOR === undefined,
		terminalWidth: process.stdout.columns ?? null,
	};
}

export function paint(
	text: string,
	role: ThemeRole,
	options: CliRenderOptions,
): string {
	return paintAnsi(text, roleStyles[role], options);
}

export function paintAnsi(
	text: string,
	style: string,
	options: CliRenderOptions,
): string {
	if (!options.colorEnabled || text.length === 0) {
		return text;
	}

	return `\u001b[${style}m${text}\u001b[0m`;
}

export function dim(text: string, options: CliRenderOptions): string {
	return paintAnsi(text, "2", options);
}

function formatCliLine(line: string, options: CliRenderOptions) {
	if (!options.colorEnabled || line.length === 0) {
		return line;
	}

	if (
		line === "Ship by Sunday CLI" ||
		line === "Ship by Sunday draft review" ||
		line === "Commands:"
	) {
		return paint(line, "heading", options);
	}

	if (
		line === "Start or resume" ||
		line === "Inspect the draft" ||
		line === "Edit facts" ||
		line === "Move data in and out" ||
		line === "Recommended next commands"
	) {
		return paint(line, "heading", options);
	}

	if (line.startsWith("Ship by Sunday CLI v")) {
		return paint(line, "heading", options);
	}

	if (
		line.startsWith("  bun run sbs ") ||
		line.startsWith("  ./bin/sbs ") ||
		line.startsWith("bun run sbs ") ||
		line.startsWith("./bin/sbs ")
	) {
		return paint(line, "active", options);
	}

	if (
		line === "Product" ||
		line === "Design" ||
		line === "Marketing" ||
		line === "Build Plan"
	) {
		return paint(line, "heading", options);
	}

	if (line.startsWith("Product / ") || line.startsWith("Design / ")) {
		return paint(line, "focus", options);
	}

	if (
		line.startsWith("Imported draft") ||
		line.startsWith("Exported draft") ||
		line.startsWith("Applied ") ||
		line.startsWith("Generated repo")
	) {
		return paint(line, "value", options);
	}

	if (line.startsWith("First incomplete stage:")) {
		return paint(line, "focus", options);
	}

	if (line.trimStart().startsWith("Missing:")) {
		return paint(line, "burn", options);
	}

	if (line.endsWith(": ready")) {
		return paint(line, "active", options);
	}

	if (line.endsWith(": missing facts")) {
		return paint(line, "burn", options);
	}

	return line;
}

export function formatCliText(text: string, options: CliRenderOptions) {
	return text
		.split("\n")
		.map((line) => formatCliLine(line, options))
		.join("\n");
}
