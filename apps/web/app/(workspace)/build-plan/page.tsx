import { api } from "@/convex/_generated/api";
import { PacketStagePage } from "@/features/packet-flow/components/packet-stage-page";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export default async function Page() {
	const initialWorkspaceState = await fetchAuthenticatedQuery(
		api.packet.getPacketWorkspaceState,
		{},
	);

	if (!initialWorkspaceState) {
		throw new Error("Packet workspace state missing");
	}

	return (
		<PacketStagePage
			stageId="build-plan"
			initialWorkspaceState={initialWorkspaceState}
		/>
	);
}
