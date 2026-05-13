import { ClipboardList, Code2, ListVideo } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AccessRequiredPage } from "@/app/(protected)/_components/access-required/access-required-page";
import { AppShell } from "@/app/(protected)/_components/app-shell";
import { loadWorkspacePageAccess } from "@/app/(protected)/_server/load-workspace-page-access";
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
	title: "Starter Home",
};

export default async function StarterHomePage() {
	const workspaceAccess = await loadWorkspacePageAccess();
	if (workspaceAccess.kind === "access_required") {
		return <AccessRequiredPage initialAccess={workspaceAccess.access} />;
	}

	const hasStarterAccess =
		hasProductSurfaceCapability(workspaceAccess.access, "generate_codebase") ||
		hasProductSurfaceCapability(workspaceAccess.access, "tutorials");
	if (!hasStarterAccess) {
		redirect(routeConfig.appHome);
	}

	return (
		<AppShell viewportMode="app" appScrollMode="page" showSkillRail={false}>
			<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 pb-10 pt-2">
				<section className="border-b border-border/60 pb-6">
					<div className="flex size-10 items-center justify-center rounded-lg border border-border/70 bg-muted/40">
						<ClipboardList
							className="size-5 text-muted-foreground"
							aria-hidden
						/>
					</div>
					<h1 className="mt-4 font-heading-serif text-4xl leading-tight text-foreground sm:text-5xl">
						Starter
					</h1>
					<p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
						Choose the guided questions for a customized repo path, or jump into
						the template and guided videos.
					</p>
				</section>
				<section
					className="grid gap-4 md:grid-cols-2"
					aria-label="Starter paths"
				>
					<Card>
						<CardHeader>
							<div className="mb-4 flex size-9 items-center justify-center rounded-lg border border-border/70 bg-muted/40">
								<Code2 className="size-4 text-muted-foreground" aria-hidden />
							</div>
							<CardTitle>Generate Codebase</CardTitle>
							<CardDescription className="leading-6">
								Answer the product questions and shape the generated repo
								package around the app you want to build.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button asChild variant="outline">
								<Link href={routeConfig.codebase}>Start questions</Link>
							</Button>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<div className="mb-4 flex size-9 items-center justify-center rounded-lg border border-border/70 bg-muted/40">
								<ListVideo
									className="size-4 text-muted-foreground"
									aria-hidden
								/>
							</div>
							<CardTitle>Lessons</CardTitle>
							<CardDescription className="leading-6">
								Use the template-first path and follow the guided videos when
								you want the build-along track.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button asChild variant="outline">
								<Link href={routeConfig.tutorials}>Open lessons</Link>
							</Button>
						</CardContent>
					</Card>
				</section>
			</div>
		</AppShell>
	);
}
