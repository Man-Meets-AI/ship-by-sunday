import { productConfig, routeConfig, starterConfig } from "@/config/product";

export type StarterModuleName = keyof typeof starterConfig.modules;

export function isStarterModuleEnabled(
	moduleName: StarterModuleName,
	moduleFlags = starterConfig.modules,
) {
	return moduleFlags[moduleName];
}

export const workspaceDisplayConfig = {
	homeHref: routeConfig.appHome,
	homeLabel: starterConfig.workspace.homeLabel,
	homeNoun: starterConfig.workspace.homeNoun,
	homeSubtitle: starterConfig.workspace.homeSubtitle,
	openHomeActionLabel: starterConfig.workspace.openHomeActionLabel,
	firstStepLabel: starterConfig.workspace.firstStepLabel,
	artifactsLabel: starterConfig.workspace.artifactsLabel,
	settingsLabel: starterConfig.workspace.settingsLabel,
} as const;

export const marketingDisplayConfig = {
	docsLabel: starterConfig.marketing.docsLabel,
	loginLabel: starterConfig.marketing.loginLabel,
	primaryCtaLabel: starterConfig.marketing.primaryCtaLabel,
	previewImageAlt: starterConfig.marketing.previewImageAlt,
} as const;

export const docsDisplayConfig = {
	siteName: `${productConfig.name} ${starterConfig.docs.badgeLabel}`,
	badgeLabel: starterConfig.docs.badgeLabel,
	description: starterConfig.docs.description,
	starterHref: routeConfig.starter,
} as const;

export const blogDisplayConfig = {
	siteName: `${productConfig.name} Blog`,
	footerLabel: starterConfig.blog.footerLabel,
	description: starterConfig.blog.description,
	promoCtaTarget: starterConfig.blog.promoCtaTarget,
} as const;
