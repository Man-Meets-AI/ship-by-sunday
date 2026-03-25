import Link from "next/link";

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
import { workspaceDisplayConfig } from "@/features/starter/lib/starter-selectors";

export function NotFoundScreen() {
	return (
		<main className="min-h-screen bg-background text-foreground">
			<div className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10 sm:px-6">
				<Card className="w-full">
					<CardHeader>
						<CardTitle>Page not found</CardTitle>
						<CardDescription>
							The page you requested is missing or no longer available.
						</CardDescription>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground">
						Use the links below to get back into your workspace or the offer.
					</CardContent>
					<CardFooter className="gap-3">
						<Button asChild>
							<Link href={routeConfig.start}>
								{workspaceDisplayConfig.openHomeActionLabel}
							</Link>
						</Button>
						<Button asChild variant="outline">
							<Link href={routeConfig.home}>Go home</Link>
						</Button>
					</CardFooter>
				</Card>
			</div>
		</main>
	);
}
