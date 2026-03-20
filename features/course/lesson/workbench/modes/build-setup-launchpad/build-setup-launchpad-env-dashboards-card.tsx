"use client";

import { ExternalLink, Info } from "lucide-react";
import { Fragment } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { BUILD_SETUP_PROVIDER_DASHBOARDS } from "./build-setup-launchpad-constants";

export function BuildSetupLaunchpadEnvDashboardsCard() {
	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">Provider dashboards</CardTitle>
				<CardDescription>
					These links always open the same Convex, Clerk, and Stripe dashboards.
					Use test or dev credentials in{" "}
					<code className="text-foreground">.env.local</code> and live
					credentials in{" "}
					<code className="text-foreground">.env.production</code>—you still
					copy from these same dashboards; only the key mode changes.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<Alert>
					<Info />
					<AlertTitle>Which keys go where?</AlertTitle>
					<AlertDescription>
						<ul className="mt-2 list-disc space-y-1 pl-4 text-muted-foreground">
							<li>
								<code className="text-foreground">.env.local</code> — local dev
								and preview (test / dev keys from each dashboard).
							</li>
							<li>
								<code className="text-foreground">.env.production</code> —
								production deploy only; do not paste those secrets into{" "}
								<code className="text-foreground">.env.local</code>.
							</li>
						</ul>
					</AlertDescription>
				</Alert>
				<div className="flex flex-col">
					{BUILD_SETUP_PROVIDER_DASHBOARDS.map((provider, index) => (
						<Fragment key={provider.name}>
							{index > 0 ? <Separator /> : null}
							<div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
								<div className="flex min-w-0 items-start gap-3">
									<Avatar className="size-10 shrink-0 rounded-md">
										<AvatarImage
											src={provider.logoSrc}
											alt={`${provider.name} logo`}
											className="rounded-md object-contain"
										/>
									</Avatar>
									<div className="min-w-0 space-y-1">
										<p className="text-sm font-medium">{provider.name}</p>
										<p className="text-sm text-muted-foreground">
											{provider.description}
										</p>
									</div>
								</div>
								<Button asChild variant="ghost" size="sm" className="shrink-0">
									<a
										href={provider.href}
										target="_blank"
										rel="noopener noreferrer"
									>
										<ExternalLink className="size-3.5" />
										Open dashboard
									</a>
								</Button>
							</div>
						</Fragment>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
