import { Bot, ListChecks, PlayCircle, ShieldCheck, Wrench } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AccessRequiredPage } from "@/app/(workspace)/_components/access-required/access-required-page";
import { AppShell } from "@/app/(workspace)/_components/app-shell";
import { loadWorkspacePageAccess } from "@/app/(workspace)/_server/load-workspace-page-access";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { routeConfig } from "@/config/product";
import { hasProductSurfaceCapability } from "@/platform/access/product-surface-capabilities";

export const metadata: Metadata = {
	title: "Workers",
};

const workerLinks = [
	{
		id: "setup",
		title: "Setup",
		description: "Pair the local Worker and connect the repo it can inspect.",
		href: routeConfig.workspaceSetup,
		icon: Wrench,
	},
	{
		id: "runs",
		title: "Runs",
		description: "Review Worker activity, doctor passes, and workflow runs.",
		href: routeConfig.workspaceRuns,
		icon: PlayCircle,
	},
	{
		id: "findings",
		title: "Findings",
		description: "Open synced codebase findings and approved repair targets.",
		href: routeConfig.workspaceFindings,
		icon: ListChecks,
	},
	{
		id: "privacy",
		title: "Privacy",
		description: "Manage runner access and repository execution consent.",
		href: routeConfig.workspacePrivacy,
		icon: ShieldCheck,
	},
] as const;

export default async function WorkersPage() {
	const workspaceAccess = await loadWorkspacePageAccess();
	if (workspaceAccess.kind === "access_required") {
		return <AccessRequiredPage initialAccess={workspaceAccess.access} />;
	}
	if (!hasProductSurfaceCapability(workspaceAccess.access, "worker")) {
		redirect(routeConfig.appHome);
	}

	return (
		<AppShell viewportMode="app" appScrollMode="page" showSkillRail={false}>
			<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 pb-10 pt-2">
				<section className="border-b border-border/60 pb-6">
					<div className="flex size-10 items-center justify-center rounded-lg border border-border/70 bg-muted/40">
						<Bot className="size-5 text-muted-foreground" aria-hidden />
					</div>
					<h1 className="mt-4 font-heading-serif text-4xl leading-tight text-foreground sm:text-5xl">
						Worker
					</h1>
					<p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
						Install the local Worker, connect an existing repo, and review the
						runs it produces.
					</p>
				</section>
				<section
					className="grid gap-4 md:grid-cols-2"
					aria-label="Worker tools"
				>
					{workerLinks.map((link) => {
						const Icon = link.icon;
						return (
							<Card key={link.id}>
								<CardHeader>
									<div className="mb-4 flex size-9 items-center justify-center rounded-lg border border-border/70 bg-muted/40">
										<Icon
											className="size-4 text-muted-foreground"
											aria-hidden
										/>
									</div>
									<CardTitle>{link.title}</CardTitle>
									<CardDescription className="leading-6">
										{link.description}
									</CardDescription>
								</CardHeader>
								<CardContent>
									<Button asChild variant="outline">
										<Link href={link.href}>Open {link.title}</Link>
									</Button>
								</CardContent>
							</Card>
						);
					})}
				</section>
			</div>
		</AppShell>
	);
}
