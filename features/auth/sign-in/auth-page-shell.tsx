import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { productConfig, routeConfig } from "@/config/product";

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
		<main className="relative flex min-h-screen items-center justify-center bg-background px-4 pb-10 pt-20 sm:px-6">
			<header className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-4 sm:px-6">
				<p className="text-sm font-medium tracking-tight">{productConfig.name}</p>
				<Button variant="link" size="sm" className="h-auto px-0" asChild>
					<Link href={routeConfig.home}>Home</Link>
				</Button>
			</header>
			<Card className="w-full max-w-sm">
				<CardHeader className="items-start text-left">
					<CardTitle>{title}</CardTitle>
					{description ? <CardDescription>{description}</CardDescription> : null}
				</CardHeader>
				<CardContent>{children}</CardContent>
			</Card>
		</main>
	);
}
