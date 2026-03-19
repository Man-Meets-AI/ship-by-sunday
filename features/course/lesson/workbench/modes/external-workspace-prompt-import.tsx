"use client";

import { PromptImportCard } from "../shared/prompt-import-card";
import type { WorkbenchModeProps } from "../types";
import { SCOPE_SOURCE_FIELD_ID } from "./scope-split/scope-split-state";

export function ExternalWorkspacePromptImport({
	lesson,
	onFieldChange,
	pinnedArtifacts,
	fieldValues,
}: Pick<
	WorkbenchModeProps,
	"lesson" | "onFieldChange" | "pinnedArtifacts" | "fieldValues"
>) {
	if (!lesson.promptImport) {
		return null;
	}

	return (
		<PromptImportCard
			lesson={lesson}
			onFieldChange={onFieldChange}
			pinnedArtifacts={pinnedArtifacts}
			fieldValues={fieldValues}
			onImportApplied={({ promptTemplateId, source }) => {
				if (promptTemplateId !== "scope_boundary") {
					return;
				}

				onFieldChange(
					SCOPE_SOURCE_FIELD_ID,
					source === "generated" ? "generated_codex" : "imported_chatgpt",
				);
			}}
		/>
	);
}
