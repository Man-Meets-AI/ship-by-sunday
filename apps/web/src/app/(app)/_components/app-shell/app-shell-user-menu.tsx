"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { AppShellUserMenuAccount } from "./app-shell-user-menu-account";
import { userMenuInitials } from "./app-shell-user-menu-helpers";
import { AppShellUserMenuWorkspaceItems } from "./app-shell-user-menu-workspace-items";

export function AppShellUserMenu() {
	const pathname = usePathname();
	const { user, isLoaded } = useUser();
	const clerk = useClerk();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="size-8 shrink-0 rounded-full p-0"
					aria-label="Open account menu"
				>
					<Avatar size="sm" className="size-8">
						{user?.imageUrl ? <AvatarImage src={user.imageUrl} alt="" /> : null}
						<AvatarFallback className="text-xs">
							{isLoaded && user
								? userMenuInitials(user.firstName, user.lastName)
								: "…"}
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="min-w-52 sm:min-w-56">
				<DropdownMenuLabel className="space-y-0.5 font-normal">
					<div className="truncate text-sm font-medium text-foreground">
						{user?.fullName ?? "Account"}
					</div>
					{user?.primaryEmailAddress?.emailAddress ? (
						<div className="truncate text-xs text-muted-foreground">
							{user.primaryEmailAddress.emailAddress}
						</div>
					) : null}
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<AppShellUserMenuWorkspaceItems pathname={pathname} />
				<AppShellUserMenuAccount clerk={clerk} hasUser={Boolean(user)} />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
