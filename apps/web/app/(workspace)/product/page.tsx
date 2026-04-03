import { redirectToBlueprintStageEntry } from "@/features/blueprint-flow/server/blueprint-stage-route-data";

export default async function Page() {
	await redirectToBlueprintStageEntry("product");
}
