"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { UserRound } from "lucide-react";

import { userMenuInitials } from "@/app/(workspace)/_components/app-shell/app-shell-user-menu-helpers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
} from "@/components/ui/card";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function SettingsAccountCard() {
	const { user, isLoaded } = useUser();
	const clerk = useClerk();

	return (
		<Card data-testid="settings-account-card">
			<CardHeader>
				<h2
					data-slot="card-title"
					className="text-base leading-snug font-medium text-foreground"
				>
					Account
				</h2>
				<CardDescription>
					View your sign-in details and open Clerk to change profile, email, or
					security settings.
				</CardDescription>
			</CardHeader>
			<Separator />
			<CardContent className="space-y-4 pt-6">
				{!isLoaded ? (
					<div
						className="flex gap-4"
						aria-busy="true"
						aria-label="Loading account"
					>
						<Skeleton className="size-10 shrink-0 rounded-full" />
						<div className="min-w-0 flex-1 space-y-3">
							<div className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-3 ring-1 ring-foreground/5">
								<Skeleton className="h-3 w-16" />
								<Skeleton className="h-4 w-48" />
							</div>
							<div className="space-y-2 rounded-lg border border-border/50 bg-muted/20 p-3 ring-1 ring-foreground/5">
								<Skeleton className="h-3 w-14" />
								<Skeleton className="h-4 w-56" />
							</div>
						</div>
					</div>
				) : (
					<div className="flex gap-4">
						<Avatar className="size-10 shrink-0">
							{user?.imageUrl ? (
								<AvatarImage src={user.imageUrl} alt="" />
							) : null}
							<AvatarFallback className="text-xs">
								{user ? userMenuInitials(user.firstName, user.lastName) : "?"}
							</AvatarFallback>
						</Avatar>
						<ItemGroup className="min-w-0 flex-1 gap-2">
							<Item variant="muted" size="sm">
								<ItemContent>
									<ItemTitle>Name</ItemTitle>
									<ItemDescription>
										{user?.fullName ?? "Not set"}
									</ItemDescription>
								</ItemContent>
							</Item>
							<Item variant="muted" size="sm">
								<ItemContent>
									<ItemTitle>Email</ItemTitle>
									<ItemDescription>
										{user?.primaryEmailAddress?.emailAddress ?? "—"}
									</ItemDescription>
								</ItemContent>
							</Item>
						</ItemGroup>
					</div>
				)}
				<Button
					type="button"
					variant="outline"
					size="sm"
					className={cn(
						"w-full gap-2 sm:w-auto",
						"border-transparent bg-foreground text-background hover:bg-foreground/90 hover:text-background",
					)}
					onClick={() => clerk.openUserProfile()}
					disabled={!isLoaded}
				>
					<UserRound className="size-4 shrink-0 opacity-80" aria-hidden />
					Manage account
				</Button>
			</CardContent>
		</Card>
	);
}
