import {
	getShippedPromptAssetPath,
	type ShippedPromptAssetFileName,
} from "../generated-docs/generated-doc-paths";
import type { RenderedPacketFile } from "./render-types";

export type PromptPackSourceFiles = Record<ShippedPromptAssetFileName, string>;

export function renderPromptPack(
	promptAssets: PromptPackSourceFiles,
): RenderedPacketFile[] {
	return [
		{
			path: getShippedPromptAssetPath("execplan-outline-from-session.md"),
			content: promptAssets["execplan-outline-from-session.md"],
		},
		{
			path: getShippedPromptAssetPath("execplan-execution-loop.md"),
			content: promptAssets["execplan-execution-loop.md"],
		},
		{
			path: getShippedPromptAssetPath("execplan-grill.md"),
			content: promptAssets["execplan-grill.md"],
		},
		{
			path: getShippedPromptAssetPath("execplan-writer.md"),
			content: promptAssets["execplan-writer.md"],
		},
	];
}
