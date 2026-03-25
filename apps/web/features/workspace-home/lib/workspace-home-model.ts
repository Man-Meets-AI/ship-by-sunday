import { productConfig, routeConfig, starterConfig } from "@/config/product";
import type { StarterModuleName } from "@/features/starter/lib/starter-selectors";

export type WorkspaceHomeModuleState = {
	id: StarterModuleName;
	label: string;
	description: string;
	enabled: boolean;
	statusLabel: string;
	actionHref?: string;
	actionLabel?: string;
};

export type WorkspaceHomeStep = {
	id: string;
	title: string;
	description: string;
	actionHref: string;
	actionLabel: string;
};

export type WorkspaceHomeQuickAction = {
	id: string;
	label: string;
	href: string;
	variant?: "default" | "secondary" | "outline";
};

export type WorkspaceHomeModel = {
	title: string;
	eyebrow: string;
	description: string;
	enabledModuleCount: number;
	totalModuleCount: number;
	moduleCompletionPercent: number;
	modules: WorkspaceHomeModuleState[];
	quickActions: WorkspaceHomeQuickAction[];
	nextSteps: WorkspaceHomeStep[];
	showCodexCard: boolean;
	showStarterRepoCard: boolean;
};

const moduleCopy = {
	docs: {
		label: "Docs",
		description: "Public setup and troubleshooting docs for this starter.",
	},
	course: {
		label: "Course",
		description: "Guided mission, lessons, and saved-work surfaces.",
	},
	starterRepo: {
		label: "Starter repo",
		description: "Starter repository access and provisioning workflow.",
	},
	codex: {
		label: "Codex",
		description: "In-app Codex connection and guided generation surfaces.",
	},
	observability: {
		label: "Observability",
		description: "Incident and error pipeline for operational visibility.",
	},
} as const satisfies Record<
	StarterModuleName,
	{ label: string; description: string }
>;

export function buildWorkspaceHomeModel(
	moduleFlags = starterConfig.modules,
): WorkspaceHomeModel {
	const modules: WorkspaceHomeModuleState[] = [
		{
			id: "docs",
			enabled: moduleFlags.docs,
			statusLabel: moduleFlags.docs ? "Enabled" : "Disabled",
			actionHref: moduleFlags.docs ? routeConfig.docs : undefined,
			actionLabel: moduleFlags.docs ? "Open docs" : undefined,
			...moduleCopy.docs,
		},
		{
			id: "course",
			enabled: moduleFlags.course,
			statusLabel: moduleFlags.course ? "Enabled" : "Starter mode",
			...moduleCopy.course,
		},
		...(moduleFlags.starterRepo
			? [
					{
						id: "starterRepo",
						enabled: moduleFlags.starterRepo,
						statusLabel: "Enabled",
						actionHref: routeConfig.settings,
						actionLabel: "Open settings",
						...moduleCopy.starterRepo,
					} satisfies WorkspaceHomeModuleState,
				]
			: []),
		{
			id: "codex",
			enabled: moduleFlags.codex,
			statusLabel: moduleFlags.codex ? "Enabled" : "Disabled",
			actionHref: moduleFlags.codex
				? `${routeConfig.settings}#codex-connection`
				: undefined,
			actionLabel: moduleFlags.codex ? "Connect Codex" : undefined,
			...moduleCopy.codex,
		},
		{
			id: "observability",
			enabled: moduleFlags.observability,
			statusLabel: moduleFlags.observability ? "Enabled" : "Disabled",
			...moduleCopy.observability,
		},
	];

	const enabledModuleCount = modules.filter((module) => module.enabled).length;
	const totalModuleCount = modules.length;
	const moduleCompletionPercent = Math.round(
		(enabledModuleCount / totalModuleCount) * 100,
	);

	const quickActions: WorkspaceHomeQuickAction[] = [
		{
			id: "settings",
			label: "Open settings",
			href: routeConfig.settings,
		},
		...(moduleFlags.docs
			? [
					{
						id: "docs",
						label: "Open docs",
						href: routeConfig.docs,
						variant: "outline" as const,
					},
				]
			: []),
	];

	const nextSteps: WorkspaceHomeStep[] = [
		{
			id: "settings",
			title: "Review starter settings",
			description:
				"Confirm the current starter identity, enabled modules, and protected-shell defaults before building deeper product surfaces.",
			actionHref: routeConfig.settings,
			actionLabel: "Open settings",
		},
		...(moduleFlags.codex
			? [
					{
						id: "codex",
						title: "Connect your Codex subscription",
						description:
							"Use your own account before relying on in-app generation or Codex-assisted build loops.",
						actionHref: `${routeConfig.settings}#codex-connection`,
						actionLabel: "Connect Codex",
					},
				]
			: []),
		...(moduleFlags.starterRepo
			? [
					{
						id: "starter-repo",
						title: "Claim starter repository access",
						description:
							"Provision or verify starter-repo access before cloning or handing the template to a new operator.",
						actionHref: routeConfig.settings,
						actionLabel: "Review starter repo",
					},
				]
			: []),
		...(moduleFlags.docs
			? [
					{
						id: "docs",
						title: "Use the docs as your setup runbook",
						description:
							"Keep the setup and troubleshooting docs nearby while you decide the first protected workflow to build on top of this starter.",
						actionHref: routeConfig.docs,
						actionLabel: "Read docs",
					},
				]
			: []),
		{
			id: "protected-ux",
			title: "Choose the first protected UX",
			description: moduleFlags.course
				? "The guided course is still on. Decide whether to keep it, trim it, or replace it with your own signed-in experience."
				: "The guided course is off, so this workspace is now your neutral protected base. Decide what the first signed-in experience should be.",
			actionHref: routeConfig.settings,
			actionLabel: "Plan next step",
		},
	];

	return {
		title: "Starter workspace ready",
		eyebrow: "Protected workspace home",
		description: `The guided course is off, so ${productConfig.name} is running in starter mode. Use this home to review what is enabled, connect tools, and choose the first protected experience you want to build next.`,
		enabledModuleCount,
		totalModuleCount,
		moduleCompletionPercent,
		modules,
		quickActions,
		nextSteps,
		showCodexCard: moduleFlags.codex,
		showStarterRepoCard: moduleFlags.starterRepo,
	};
}
