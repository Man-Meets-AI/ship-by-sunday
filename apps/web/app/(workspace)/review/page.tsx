import { api } from "@/convex/_generated/api";
import { PacketReviewPage } from "@/features/packet-flow/components/packet-review-page";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export default async function Page() {
	const initialWorkspaceState = await fetchAuthenticatedQuery(
		api.packet.getPacketWorkspaceState,
		{},
	);

	if (!initialWorkspaceState) {
		throw new Error("Packet workspace state missing");
	}

	return <PacketReviewPage initialWorkspaceState={initialWorkspaceState} />;
}
