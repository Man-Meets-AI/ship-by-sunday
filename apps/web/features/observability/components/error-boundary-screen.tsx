"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { routeConfig } from "@/config/product";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { reportClientError } from "@/features/observability/lib/client-error-report";

export function ErrorBoundaryScreen({
	error,
	reset,
	title,
	description,
	code,
}: {
	error: Error & { digest?: string };
	reset: () => void;
	title: string;
	description: string;
	code: string;
}) {
	const pathname = usePathname();

	useEffect(() => {
		reportClientError({
			error,
			code,
			pathname,
			severity: code === "global_error_boundary" ? "critical" : "high",
			details: {
				digest: error.digest ?? null,
			},
		});
	}, [code, error, pathname]);

	return (
		<main className="min-h-screen bg-background text-foreground">
			<div className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10 sm:px-6">
				<Card className="w-full">
					<CardHeader>
						<CardTitle>{title}</CardTitle>
						<CardDescription>{description}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2 text-sm text-muted-foreground">
						<p>Request path: {pathname ?? "unknown"}</p>
						<p>Error digest: {error.digest ?? "not available"}</p>
					</CardContent>
					<CardFooter className="gap-3">
						<Button onClick={reset}>Try again</Button>
						<Button asChild variant="outline">
							<Link href={routeConfig.home}>Go home</Link>
						</Button>
					</CardFooter>
				</Card>
			</div>
		</main>
	);
}
