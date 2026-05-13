import { LogIn, LogOut, UserRound } from "lucide-react";
import Link from "next/link";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { routeConfig } from "@/config/product";

type ClerkApi = {
	openUserProfile: () => void;
	signOut: (opts?: { redirectUrl?: string }) => Promise<void> | void;
};

export function AppShellUserMenuAccount({
	clerk,
	hasUser,
}: {
	clerk: ClerkApi;
	hasUser: boolean;
}) {
	if (hasUser) {
		return (
			<>
				<DropdownMenuItem onSelect={() => clerk.openUserProfile()}>
					<UserRound
						className="size-4 shrink-0 text-muted-foreground"
						aria-hidden
					/>
					Account
				</DropdownMenuItem>
				<DropdownMenuItem
					variant="destructive"
					onSelect={() => {
						void clerk.signOut({ redirectUrl: routeConfig.home });
					}}
				>
					<LogOut className="size-4 shrink-0" aria-hidden />
					Sign out
				</DropdownMenuItem>
			</>
		);
	}

	return (
		<DropdownMenuItem asChild>
			<Link href={routeConfig.signIn} className="flex items-center gap-2">
				<LogIn className="size-4 shrink-0 text-muted-foreground" aria-hidden />
				Sign in
			</Link>
		</DropdownMenuItem>
	);
}
