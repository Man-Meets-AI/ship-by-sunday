import { redirect } from "next/navigation";
import { routeConfig } from "@/config/product";
import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";
import { ExecuteShipHub } from "./execute-ship-hub";

export function ExecuteShipPage({
	initialWorkspaceState,
}: {
	initialWorkspaceState: PacketWorkspaceState;
}) {
	if (!initialWorkspaceState.workflowState?.executeShipUnlockedAt) {
		redirect(routeConfig.review);
	}

	return (
		<ExecuteShipHub
			productName={initialWorkspaceState.projectDefinition?.facts.product_name}
		/>
	);
}
