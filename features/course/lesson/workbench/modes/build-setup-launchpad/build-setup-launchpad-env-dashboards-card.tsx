"use client";

import { ExternalLink, Info } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";

import { cn } from "@/lib/utils";

import { BUILD_SETUP_PROVIDER_DASHBOARDS } from "./build-setup-launchpad-constants";

export function BuildSetupLaunchpadEnvDashboardsCard() {
	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">Provider dashboards</CardTitle>
				<CardDescription>
					These links always open the same Convex, Clerk, and Stripe dashboards. Use test or dev
					credentials in <code className="text-foreground">.env.local</code> and live credentials in{" "}
					<code className="text-foreground">.env.production</code>—you still copy from these same
					dashboards; only the key mode changes.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<Alert>
					<Info />
					<AlertTitle>Which keys go where?</AlertTitle>
					<AlertDescription>
						<ul className="mt-2 list-disc space-y-1 pl-4 text-muted-foreground">
							<li>
								<code className="text-foreground">.env.local</code> — local dev and preview (test /
								dev keys from each dashboard).
							</li>
							<li>
								<code className="text-foreground">.env.production</code> — production deploy only;
								do not paste those secrets into{" "}
								<code className="text-foreground">.env.local</code>.
							</li>
						</ul>
					</AlertDescription>
				</Alert>
				<ItemGroup className="gap-2">
					{BUILD_SETUP_PROVIDER_DASHBOARDS.map((provider) => (
						<Item key={provider.name} variant="outline" className="p-3 sm:p-4">
							<ItemMedia
								variant="image"
								className={cn(
									"overflow-hidden [&_img]:object-contain",
									provider.logoMediaClassName,
								)}
							>
								<img src={provider.logoSrc} alt={`${provider.name} logo`} />
							</ItemMedia>
							<ItemContent>
								<ItemTitle className="line-clamp-none text-sm">{provider.name}</ItemTitle>
								<ItemDescription className="line-clamp-none">
									{provider.description}
								</ItemDescription>
							</ItemContent>
							<ItemActions>
								<Button asChild variant="ghost" size="sm" className="shrink-0">
									<a href={provider.href} target="_blank" rel="noopener noreferrer">
										<ExternalLink className="size-3.5" />
										Open dashboard
									</a>
								</Button>
							</ItemActions>
						</Item>
					))}
				</ItemGroup>
			</CardContent>
		</Card>
	);
}
