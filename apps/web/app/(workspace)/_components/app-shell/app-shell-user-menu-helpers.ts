import { routeConfig } from "@/config/product";
import { workspaceDisplayConfig } from "@/config/starter-selectors";

export function isPathPrefixActive(pathname: string, href: string) {
	return pathname === href || pathname.startsWith(`${href}/`);
}

export function workspaceMenuLinks(pathname: string) {
	return [
		{
			href: routeConfig.appHome,
			label: workspaceDisplayConfig.homeLabel,
			active: isPathPrefixActive(pathname, routeConfig.appHome),
		},
		{
			href: routeConfig.codebase,
			label: "Generate Codebase",
			active: isPathPrefixActive(pathname, routeConfig.codebase),
		},
		{
			href: routeConfig.tutorials,
			label: "Tutorials",
			active: isPathPrefixActive(pathname, routeConfig.tutorials),
		},
		{
			href: routeConfig.workers,
			label: "Worker",
			active: isPathPrefixActive(pathname, routeConfig.workers),
		},
		{
			href: routeConfig.settings,
			label: workspaceDisplayConfig.settingsLabel,
			active: isPathPrefixActive(pathname, routeConfig.settings),
		},
	] as const;
}

export function userMenuInitials(first?: string | null, last?: string | null) {
	const a = first?.trim()?.[0];
	const b = last?.trim()?.[0];
	if (a && b) return `${a}${b}`.toUpperCase();
	if (a) return a.toUpperCase();
	return "?";
}
