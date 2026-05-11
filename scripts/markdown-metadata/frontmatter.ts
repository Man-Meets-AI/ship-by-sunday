import YAML from "yaml";

import type { JsonObject, JsonValue } from "../json-value";

export type ParsedMarkdownFrontmatter =
	| {
			body: string;
			metadata: JsonObject;
	  }
	| {
			issue: string;
	  };

function isYamlObject(value: JsonValue): value is JsonObject {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseMarkdownFrontmatter(
	text: string,
): ParsedMarkdownFrontmatter {
	const normalizedText = text.replaceAll("\r\n", "\n");
	if (!normalizedText.startsWith("---\n")) {
		return {
			issue: "Missing YAML frontmatter block at the top of the file.",
		};
	}

	const closingDelimiterIndex = normalizedText.indexOf("\n---\n", 4);
	if (closingDelimiterIndex === -1) {
		return {
			issue: "Missing closing YAML frontmatter delimiter.",
		};
	}

	const frontmatterSource = normalizedText.slice(4, closingDelimiterIndex);
	const document = YAML.parseDocument(frontmatterSource);
	if (document.errors.length > 0) {
		return {
			issue: document.errors.map((error) => error.message).join("\n"),
		};
	}

	const parsedValue = document.toJS() as JsonValue;
	if (!isYamlObject(parsedValue)) {
		return {
			issue: "Frontmatter must parse to a YAML object.",
		};
	}

	return {
		metadata: parsedValue,
		body: normalizedText.slice(closingDelimiterIndex + 5).trim(),
	};
}

export function extractMarkdownH1(body: string): string | null {
	const match = body.match(/^# (.+)$/m);
	return match?.[1]?.trim() ?? null;
}
