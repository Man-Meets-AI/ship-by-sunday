import { routeConfig } from "@/config/product";

export type PaidAppHomePath = {
	id: "generate-codebase" | "tutorials" | "worker";
	title: string;
	description: string;
	href: string;
	actionLabel: string;
};

export type PaidAppHomeSecondaryLink = {
	id: "settings" | "docs" | "worker-runs";
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
			"Pick the surface you need next. Your purchase unlocks the app hub, codebase generation, tutorials, and Worker setup.",
		paths: [
			{
				id: "generate-codebase",
				title: "Generate Codebase",
				description:
					"Start from a new idea and build the product brief into a repo package.",
				href: routeConfig.codebase,
				actionLabel: "Start a new idea",
			},
			{
				id: "tutorials",
				title: "Tutorials",
				description:
					"Watch the implementation lessons and jump back into the current video library.",
				href: routeConfig.tutorials,
				actionLabel: "Watch tutorials",
			},
			{
				id: "worker",
				title: "Worker",
				description:
					"Install the local Worker and connect an existing repo for doctor passes and runs.",
				href: routeConfig.workspaceSetup,
				actionLabel: "Install Worker",
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
			{
				id: "docs",
				label: "Docs",
				href: routeConfig.docs,
			},
		],
	};
}
