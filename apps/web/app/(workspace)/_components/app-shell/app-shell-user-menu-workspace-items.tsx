import { Flag, House, Settings } from "lucide-react";
import Link from "next/link";

import {
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { routeConfig } from "@/config/product";
import { cn } from "@/lib/utils";

import { workspaceMenuLinks } from "./app-shell-user-menu-helpers";

const workspaceLinkIcons = {
	[routeConfig.blueprint]: House,
	[routeConfig.review]: Flag,
	[routeConfig.settings]: Settings,
} as const;

export function AppShellUserMenuWorkspaceItems({
	pathname,
}: {
	pathname: string;
}) {
	const links = workspaceMenuLinks(pathname);
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
			<DropdownMenuSeparator />
		</>
	);
}
