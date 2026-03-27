import { redirect } from "next/navigation";
import { routeConfig } from "@/config/product";
import { ExecuteShipPage } from "@/features/execute-ship/components/execute-ship-page";
import { loadBonusRouteAccess } from "@/features/execute-ship/server/load-bonus-route-access";

export default async function Page() {
	const bonusRouteAccess = await loadBonusRouteAccess();

	if (!bonusRouteAccess.isUnlocked) {
		redirect(routeConfig.review);
	}

	return (
		<ExecuteShipPage
			initialWorkspaceState={bonusRouteAccess.workspaceState}
			hasStartedBonusLesson={bonusRouteAccess.hasStartedBonusLesson}
		/>
	);
}
