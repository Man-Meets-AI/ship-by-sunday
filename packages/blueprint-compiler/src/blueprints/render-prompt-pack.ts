import {
	getShippedPromptAssetPath,
	type ShippedPromptAssetFileName,
} from "../generated-docs/generated-doc-paths";
import type { RenderedBlueprintFile } from "./render-types";

export type PromptPackSourceFiles = Record<ShippedPromptAssetFileName, string>;

export function renderPromptPack(
	promptAssets: PromptPackSourceFiles,
): RenderedBlueprintFile[] {
	return [
		{
			path: getShippedPromptAssetPath("exec-plan-outline-from-session.md"),
			content: promptAssets["exec-plan-outline-from-session.md"],
		},
		{
			path: getShippedPromptAssetPath("exec-plan-execute.md"),
			content: promptAssets["exec-plan-execute.md"],
		},
		{
			path: getShippedPromptAssetPath("exec-plan-grill.md"),
			content: promptAssets["exec-plan-grill.md"],
		},
		{
			path: getShippedPromptAssetPath("exec-plan-validate.md"),
			content: promptAssets["exec-plan-validate.md"],
		},
		{
			path: getShippedPromptAssetPath("exec-plan-writer.md"),
			content: promptAssets["exec-plan-writer.md"],
		},
	];
}
