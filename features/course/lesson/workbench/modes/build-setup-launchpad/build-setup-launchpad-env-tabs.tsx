"use client";

import { courseResourceConfig } from "@/config/product";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const { buildSetup } = courseResourceConfig;

function ServiceRow({
	label,
	href,
}: {
	label: string;
	href: string;
}) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/80 bg-muted/30 px-3 py-2">
			<div className="flex items-center gap-2">
				<span className="text-sm font-medium text-foreground">{label}</span>
				<Badge variant="secondary" className="font-normal">
					Keys here
				</Badge>
			</div>
			<Button variant="outline" size="sm" asChild>
				<a href={href} target="_blank" rel="noopener noreferrer">
					Open
				</a>
			</Button>
		</div>
	);
}

export function BuildSetupLaunchpadEnvTabs() {
	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">Env files</CardTitle>
				<CardDescription>
					Each file needs Convex, Clerk, and Stripe values from the matching dashboards.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue="local" className="w-full gap-4">
					<TabsList variant="line" className="h-auto w-full flex-wrap justify-start gap-1">
						<TabsTrigger value="local">.env.local</TabsTrigger>
						<TabsTrigger value="production">.env.production</TabsTrigger>
					</TabsList>
					<TabsContent value="local" className="flex flex-col gap-2">
						<p className="text-sm text-muted-foreground">
							Development and local preview. Use test / dev keys from each provider.
						</p>
						<ServiceRow label="Convex" href={buildSetup.convexDashboard} />
						<ServiceRow label="Clerk" href={buildSetup.clerk} />
						<ServiceRow label="Stripe" href={buildSetup.stripe} />
					</TabsContent>
					<TabsContent value="production" className="flex flex-col gap-2">
						<p className="text-sm text-muted-foreground">
							Production deploy keys only—never paste production secrets into{" "}
							<code className="text-foreground">.env.local</code>.
						</p>
						<ServiceRow label="Convex" href={buildSetup.convexDashboard} />
						<ServiceRow label="Clerk" href={buildSetup.clerk} />
						<ServiceRow label="Stripe" href={buildSetup.stripe} />
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
