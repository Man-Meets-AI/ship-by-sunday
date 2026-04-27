import { routeConfig } from "@/config/product";
import { workspaceDisplayConfig } from "@/config/starter-selectors";

export function isPathPrefixActive(pathname: string, href: string) {
	return pathname === href || pathname.startsWith(`${href}/`);
}

export function workspaceMenuLinks(pathname: string) {
	return [
		{
			href: routeConfig.blueprint,
			label: workspaceDisplayConfig.homeLabel,
			active: isPathPrefixActive(pathname, routeConfig.blueprint),
		},
		{
			href: routeConfig.review,
			label: "Review",
			active: isPathPrefixActive(pathname, routeConfig.review),
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
