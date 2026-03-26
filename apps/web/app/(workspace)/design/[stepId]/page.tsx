import { PacketStagePage } from "@/features/packet-flow/components/packet-stage-page";
import { loadPacketStageRouteData } from "@/features/packet-flow/server/packet-stage-route-data";

export default async function Page({
	params,
}: {
	params: Promise<{ stepId: string }>;
}) {
	const { stepId } = await params;
	const routeData = await loadPacketStageRouteData("design", stepId);

	return <PacketStagePage stageId="design" {...routeData} />;
}
