import { redirect } from "next/navigation";
import { routeConfig } from "@/config/product";
import type { PacketWorkspaceState } from "@/features/packet-flow/lib/packet-workspace-types";
import { isExecuteShipUnlocked } from "@/features/execute-ship/lib/bonus-route-access";
import { ExecuteBonusBridgePage } from "./execute-bonus-bridge-page";

export function ExecuteShipPage({
	initialWorkspaceState,
	hasStartedBonusLesson = false,
}: {
	initialWorkspaceState: PacketWorkspaceState;
	hasStartedBonusLesson?: boolean;
}) {
	if (!isExecuteShipUnlocked(initialWorkspaceState)) {
		redirect(routeConfig.review);
	}

	if (hasStartedBonusLesson) {
		redirect(routeConfig.mission);
	}

	return (
		<ExecuteBonusBridgePage
			productName={initialWorkspaceState.projectDefinition?.facts.product_name}
		/>
	);
}
