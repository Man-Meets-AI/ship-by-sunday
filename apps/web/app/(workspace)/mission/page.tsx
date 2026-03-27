import { api } from "@/convex/_generated/api";
import { routeConfig } from "@/config/product";
import { BonusRouteStatePanel } from "@/features/execute-ship/components/bonus-route-state-panel";
import { BonusMissionPage } from "@/features/execute-ship/components/bonus-mission-page";
import { loadBonusRouteAccess } from "@/features/execute-ship/server/load-bonus-route-access";
import { fetchAuthenticatedQuery } from "@/platform/convex/server-preload";

export default async function Page() {
	const bonusRouteAccess = await loadBonusRouteAccess();

	if (!bonusRouteAccess.isUnlocked) {
		return (
			<BonusRouteStatePanel
				eyebrow="Bonus library"
				title="Mission unlocks after Review & Download."
				description="Finish the required packet run first. The continuation library only opens after you reach Review & Download and unlock the bonus from that handoff."
				actionHref={routeConfig.review}
				actionLabel="Go to Review & Download"
			/>
		);
	}

	const missionState = await fetchAuthenticatedQuery(api.course.getBonusMissionState, {});

	if (!missionState) {
		throw new Error("Bonus mission state missing");
	}

	return <BonusMissionPage missionState={missionState} />;
}
