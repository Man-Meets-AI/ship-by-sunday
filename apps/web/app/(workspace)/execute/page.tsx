import { api } from "@/convex/_generated/api";
import { ExecuteShipPage } from "@/features/execute-ship/components/execute-ship-page";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export default async function Page() {
	const initialWorkspaceState = await fetchAuthenticatedQuery(
		api.packet.getPacketWorkspaceState,
		{},
	);

	if (!initialWorkspaceState) {
		throw new Error("Packet workspace state missing");
	}

	return <ExecuteShipPage initialWorkspaceState={initialWorkspaceState} />;
}
