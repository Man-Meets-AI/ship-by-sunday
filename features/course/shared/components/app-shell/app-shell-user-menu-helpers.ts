import { routeConfig } from "@/config/product";
import { workspaceDisplayConfig } from "@/features/starter/lib/starter-selectors";

export function isPathPrefixActive(pathname: string, href: string) {
	return pathname === href || pathname.startsWith(`${href}/`);
}

export function workspaceMenuLinks(pathname: string) {
	return [
		{
			href: routeConfig.artifacts,
			label: workspaceDisplayConfig.artifactsLabel,
			active: isPathPrefixActive(pathname, routeConfig.artifacts),
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
