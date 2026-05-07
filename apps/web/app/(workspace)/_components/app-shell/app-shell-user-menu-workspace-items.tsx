import { Flag, House, ListVideo, Settings, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useQuery } from "convex/react";

import {
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { routeConfig } from "@/config/product";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

import { workspaceMenuLinks } from "./app-shell-user-menu-helpers";

const workspaceLinkIcons = {
	[routeConfig.codebase]: House,
	[routeConfig.review]: Flag,
	[routeConfig.tutorials]: ListVideo,
	[routeConfig.settings]: Settings,
} as const;

export function AppShellUserMenuWorkspaceItems({
	pathname,
}: {
	pathname: string;
}) {
	const links = workspaceMenuLinks(pathname);
	const supportModeStatus = useQuery(api.impersonation.getSupportModeStatus);
	const showAdminImpersonation =
		supportModeStatus?.state === "normal" ||
		supportModeStatus?.state === "active";
	return (
		<>
			{links.map(({ href, label, active }) => {
				const LinkIcon =
					workspaceLinkIcons[href as keyof typeof workspaceLinkIcons];
				return (
					<DropdownMenuItem key={href} asChild>
						<Link
							href={href}
							className={cn("flex items-center gap-2", active && "bg-accent")}
						>
							<LinkIcon
								className="size-4 shrink-0 text-muted-foreground"
								aria-hidden
							/>
							{label}
						</Link>
					</DropdownMenuItem>
				);
			})}
			{showAdminImpersonation ? (
				<DropdownMenuItem asChild>
					<Link
						href={routeConfig.adminImpersonation}
						className={cn(
							"flex items-center gap-2",
							pathname.startsWith(routeConfig.adminImpersonation) &&
								"bg-accent",
						)}
					>
						<ShieldCheck
							className="size-4 shrink-0 text-muted-foreground"
							aria-hidden
						/>
						Admin impersonation
					</Link>
				</DropdownMenuItem>
			) : null}
			<DropdownMenuSeparator />
		</>
	);
}
