import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { routeConfig } from "@/config/product";

type AuthPageShellProps = {
	children: ReactNode;
	description?: ReactNode;
	title: string;
};

export function AuthPageShell({
	children,
	description,
	title,
}: AuthPageShellProps) {
	return (
		<main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
			<Card className="w-full max-w-sm">
				<CardHeader className="items-start text-left">
					<CardAction>
						<Button variant="link" size="sm" className="h-auto px-0" asChild>
							<Link href={routeConfig.home}>Home</Link>
						</Button>
					</CardAction>
					<CardTitle>{title}</CardTitle>
					{description ? <CardDescription>{description}</CardDescription> : null}
				</CardHeader>
				<CardContent>{children}</CardContent>
			</Card>
		</main>
	);
}
