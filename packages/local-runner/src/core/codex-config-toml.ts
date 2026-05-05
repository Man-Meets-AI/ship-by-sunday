export type ParsedCodexConfigToml = {
	tableNames: Set<string>;
};

export function parseCodexConfigToml(contents: string): ParsedCodexConfigToml {
	const tableNames = new Set<string>();
	const lines = contents.split(/\r?\n/);

	for (const line of lines) {
		const trimmedLine = line.trim();
		if (!trimmedLine || trimmedLine.startsWith("#")) {
			continue;
		}

		if (trimmedLine.startsWith("[")) {
			const match = trimmedLine.match(/^\[([^\]]+)\]\s*(?:#.*)?$/);
			if (!match) {
				throw new Error(`Unsupported TOML table syntax: ${trimmedLine}`);
			}
			tableNames.add(match[1].trim());
			continue;
		}

		if (!trimmedLine.includes("=") || trimmedLine.startsWith("=")) {
			throw new Error(`Unsupported TOML assignment syntax: ${trimmedLine}`);
		}
	}

	return { tableNames };
}

export function hasTomlTable(contents: string, tableName: string) {
	return parseCodexConfigToml(contents).tableNames.has(tableName);
}

export function replaceManagedTomlBlock({
	contents,
	startMarker,
	endMarker,
	replacementBlock,
}: {
	contents: string;
	startMarker: string;
	endMarker: string;
	replacementBlock: string;
}) {
	parseCodexConfigToml(contents);
	const startIndex = contents.indexOf(startMarker);
	const endIndex = contents.indexOf(endMarker);

	if (startIndex === -1 && endIndex === -1) {
		const separator = contents.trim().length > 0 ? "\n\n" : "";
		return `${contents.trimEnd()}${separator}${replacementBlock.trimEnd()}\n`;
	}

	if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
		throw new Error(
			"Codex config has an incomplete Ship by Sunday managed block.",
		);
	}

	const beforeBlock = contents.slice(0, startIndex).trimEnd();
	const afterBlock = contents.slice(endIndex + endMarker.length).trimStart();
	return (
		`${beforeBlock}\n\n${replacementBlock.trimEnd()}\n\n${afterBlock}`.trimEnd() +
		"\n"
	);
}

export function createUnifiedDiffPreview({
	fromLabel,
	toLabel,
	before,
	after,
}: {
	fromLabel: string;
	toLabel: string;
	before: string;
	after: string;
}) {
	if (before === after) {
		return "";
	}

	const beforeLines = before.split(/\r?\n/);
	const afterLines = after.split(/\r?\n/);
	return [
		`--- ${fromLabel}`,
		`+++ ${toLabel}`,
		...beforeLines.map((line) => `-${line}`),
		...afterLines.map((line) => `+${line}`),
	].join("\n");
}
