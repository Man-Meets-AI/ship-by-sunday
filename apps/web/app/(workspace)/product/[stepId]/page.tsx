import { BlueprintStagePage } from "@/features/blueprint-flow/components/blueprint-stage-page";
import { loadBlueprintStageRouteData } from "@/features/blueprint-flow/server/blueprint-stage-route-data";

export default async function Page({
	params,
}: {
	params: Promise<{ stepId: string }>;
}) {
	const { stepId } = await params;
	const routeData = await loadBlueprintStageRouteData("product", stepId);

	return <BlueprintStagePage stageId="product" {...routeData} />;
}
