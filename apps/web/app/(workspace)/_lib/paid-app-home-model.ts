import { routeConfig } from "@/config/product";

export type PaidAppHomePath = {
	id: "starter" | "workers";
	title: string;
	description: string;
	href: string;
	actionLabel: string;
};

export type PaidAppHomeSecondaryLink = {
	id: "settings" | "worker-runs";
	label: string;
	href: string;
};

export type PaidAppHomeModel = {
	title: string;
	description: string;
	paths: PaidAppHomePath[];
	secondaryLinks: PaidAppHomeSecondaryLink[];
};

export function buildPaidAppHomeModel(): PaidAppHomeModel {
	return {
		title: "Home",
		description:
			"Pick the product path you need next. Starter owns the generator and lessons. Workers owns existing-repo setup and runs.",
		paths: [
			{
				id: "starter",
				title: "Starter",
				description:
					"Start from a new idea, generate the repo package, or use the guided lessons.",
				href: routeConfig.starterHome,
				actionLabel: "Open Starter",
			},
			{
				id: "workers",
				title: "Workers",
				description:
					"Install the local Worker and connect an existing repo for doctor passes and runs.",
				href: routeConfig.workspaceSetup,
				actionLabel: "Open Workers",
			},
		],
		secondaryLinks: [
			{
				id: "worker-runs",
				label: "Worker runs",
				href: routeConfig.workspaceRuns,
			},
			{
				id: "settings",
				label: "Settings",
				href: routeConfig.settings,
			},
		],
	};
}
