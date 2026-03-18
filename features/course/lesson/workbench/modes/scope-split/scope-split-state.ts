import { CORE_FLOW_IMAGE_FIELD_ID } from "@/features/course/lesson/model/core-flow";
import type { PinnedArtifact } from "@/features/course/lesson/shells";

export const SCOPE_SOURCE_FIELD_ID = "__scope_boundary_source";

export type ScopeDraftSource =
	| "manual"
	| "imported_chatgpt"
	| "generated_codex";

export function getPinnedTextValue(
	pinnedArtifacts: PinnedArtifact[],
	artifactKey: string,
	fieldId: string,
) {
	const artifact = pinnedArtifacts.find(
		(candidate) => candidate.artifactKey === artifactKey,
	);
	const value = artifact?.fieldValues?.[fieldId];
	if (typeof value !== "string") {
		return null;
	}

	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

export function getPinnedCoreFlowImageUrl(pinnedArtifacts: PinnedArtifact[]) {
	const artifact = pinnedArtifacts.find(
		(candidate) => candidate.artifactKey === "core_flow_image",
	);
	const upload = artifact?.fieldValues?.[CORE_FLOW_IMAGE_FIELD_ID];
	if (!upload || typeof upload !== "object" || Array.isArray(upload)) {
		return null;
	}

	const candidate = upload as { url?: unknown };
	return typeof candidate.url === "string" && candidate.url.trim().length > 0
		? candidate.url
		: null;
}

export function getScopeItems(value: unknown) {
	if (!Array.isArray(value)) {
		return [] as string[];
	}

	return value.map((item) => (typeof item === "string" ? item : ""));
}

export function countFilledScopeItems(value: unknown) {
	return getScopeItems(value).filter((item) => item.trim().length > 0).length;
}

export function readScopeDraftSource(value: unknown): ScopeDraftSource | null {
	return value === "manual" ||
		value === "imported_chatgpt" ||
		value === "generated_codex"
		? value
		: null;
}

export function shouldPreserveImportedScopeSource(
	source: ScopeDraftSource | null,
) {
	return source === "imported_chatgpt" || source === "generated_codex";
}

export function getScopeDraftStatus({
	fieldValues,
	keepFieldId,
	cutFieldId,
	rationaleFieldId,
}: {
	fieldValues: Record<string, unknown>;
	keepFieldId: string;
	cutFieldId: string;
	rationaleFieldId: string;
}) {
	const keepCount = countFilledScopeItems(fieldValues[keepFieldId]);
	const cutCount = countFilledScopeItems(fieldValues[cutFieldId]);
	const rationale =
		typeof fieldValues[rationaleFieldId] === "string"
			? fieldValues[rationaleFieldId].trim()
			: "";
	const hasContent = keepCount > 0 || cutCount > 0 || rationale.length > 0;
	const source = readScopeDraftSource(fieldValues[SCOPE_SOURCE_FIELD_ID]);

	if (!hasContent) {
		return {
			label: "Nothing saved yet",
			detail:
				"Start with the keep list. This lesson saves automatically as you go.",
			tone: "neutral" as const,
		};
	}

	if (source === "manual") {
		return {
			label: "Manual draft",
			detail: "This scope boundary is being written directly in the lesson.",
			tone: "accent" as const,
		};
	}

	if (source === "imported_chatgpt") {
		return {
			label: "Started from pasted AI output",
			detail:
				"The current keep/cut draft was imported, then saved into this lesson.",
			tone: "accent" as const,
		};
	}

	if (source === "generated_codex") {
		return {
			label: "Started from Codex",
			detail:
				"The current keep/cut draft was generated in-app from your saved CEO work.",
			tone: "accent" as const,
		};
	}

	return {
		label: "Saved draft",
		detail:
			"These entries are loaded from the last saved lesson draft. If backup assist was used earlier, that saved draft is what you are seeing.",
		tone: "neutral" as const,
	};
}

export function getScopeBoundaryStatus({
	keepCount,
	cutCount,
	rationaleReady,
}: {
	keepCount: number;
	cutCount: number;
	rationaleReady: boolean;
}) {
	if (keepCount >= 3 && keepCount <= 5 && cutCount >= 3 && rationaleReady) {
		return {
			label: "Ready for 1.7 Brief",
			detail: "The boundary is small enough to carry into the brief.",
			isReady: true,
		};
	}

	if (keepCount > 5) {
		return {
			label: "Still too big",
			detail:
				"More than five keep items usually means the v1 is still too broad.",
			isReady: false,
		};
	}

	if (cutCount < 3) {
		return {
			label: "Name more cuts",
			detail: "List the tempting extras you are explicitly not shipping yet.",
			isReady: false,
		};
	}

	if (!rationaleReady) {
		return {
			label: "Defend the smaller version",
			detail:
				"Write why this stripped-down version still gets the user to the win.",
			isReady: false,
		};
	}

	return {
		label: "Keep tightening",
		detail: "Aim for 3-5 essentials and cut everything else that is not core.",
		isReady: false,
	};
}
