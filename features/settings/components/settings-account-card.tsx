"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
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

export function SettingsAccountCard() {
	const { user, isLoaded } = useUser();
	const clerk = useClerk();

	return (
		<Card data-testid="settings-account-card">
			<CardHeader>
				<CardTitle>Account</CardTitle>
				<CardDescription>
					View your sign-in details and open Clerk to change profile, email, or
					security settings.
				</CardDescription>
			</CardHeader>
			<Separator />
			<CardContent className="space-y-4 pt-6">
				{!isLoaded ? (
					<div className="space-y-3">
						<Skeleton className="h-4 w-40" />
						<Skeleton className="h-4 w-56" />
					</div>
				) : (
					<ItemGroup className="gap-2">
						<Item variant="muted" size="sm">
							<ItemContent>
								<ItemTitle>Name</ItemTitle>
								<ItemDescription>{user?.fullName ?? "Not set"}</ItemDescription>
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
				)}
				<Button
					type="button"
					variant="secondary"
					size="sm"
					className="gap-2"
					onClick={() => clerk.openUserProfile()}
					disabled={!isLoaded}
				>
					<UserRound
						className="size-4 shrink-0 text-muted-foreground"
						aria-hidden
					/>
					Manage account
				</Button>
			</CardContent>
		</Card>
	);
}
