import { ClipboardList, Code2, Download, ListVideo } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AccessRequiredPage } from "@/app/(app)/_components/access-required/access-required-page";
import { AppShell } from "@/app/(app)/_components/app-shell";
import { loadWorkspacePageAccess } from "@/app/(app)/_server/load-workspace-page-access";
import {
	ProtectedRouteDescription,
	ProtectedRouteEyebrow,
	ProtectedRouteHeader,
	ProtectedRouteIcon,
	ProtectedRoutePage,
	ProtectedRoutePanel,
	ProtectedRoutePanelBody,
	ProtectedRoutePanelDescription,
	ProtectedRoutePanelHeader,
	ProtectedRoutePanelTitle,
	ProtectedRouteSummaryGrid,
	ProtectedRouteTitle,
} from "@/components/app/protected-route-surface";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { routeConfig } from "@/config/product";
import { createStarterTemplateDownloadHref } from "@/lib/download/starter-template-download-token";
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
	const starterTemplateDownloadHref = createStarterTemplateDownloadHref(
		routeConfig.starterTemplateDownload,
	);

	return (
		<AppShell viewportMode="app" appScrollMode="page" showSkillRail={false}>
			<ProtectedRoutePage className="max-w-6xl">
				<ProtectedRouteHeader
					actionsClassName="w-full lg:w-72"
					actions={
						<ProtectedRouteSummaryGrid
							heading="Starter summary"
							items={[
								{ label: "Guided", value: "Codebase questions" },
								{ label: "Template", value: "Direct download" },
								{ label: "Lessons", value: "Build-along track" },
							]}
						/>
					}
				>
					<ProtectedRouteIcon>
						<ClipboardList className="size-4" aria-hidden />
					</ProtectedRouteIcon>
					<ProtectedRouteEyebrow>Starter</ProtectedRouteEyebrow>
					<ProtectedRouteTitle>Choose your build path</ProtectedRouteTitle>
					<ProtectedRouteDescription>
						Choose the guided questions for a customized repo path, or jump into
						the template and guided videos.
					</ProtectedRouteDescription>
				</ProtectedRouteHeader>
				<section
					className="grid gap-4 md:grid-cols-2"
					aria-label="Starter paths"
				>
					<ProtectedRoutePanel>
						<ProtectedRoutePanelHeader>
							<div className="mb-2 flex items-center justify-between gap-3">
								<span className="flex size-8 items-center justify-center rounded-lg border border-border/70 bg-background/70 text-muted-foreground">
									<Code2 className="size-4" aria-hidden />
								</span>
								<Badge variant="info" size="sm">
									Guided
								</Badge>
							</div>
							<ProtectedRoutePanelTitle>
								Generate Codebase
							</ProtectedRoutePanelTitle>
							<ProtectedRoutePanelDescription>
								Answer the product questions and shape the generated repo
								package around the app you want to build.
							</ProtectedRoutePanelDescription>
						</ProtectedRoutePanelHeader>
						<ProtectedRoutePanelBody className="flex flex-col gap-4">
							<p className="text-sm leading-6 text-muted-foreground">
								Use this when Ship by Sunday should assemble a tailored starter
								repository from the product brief.
							</p>
							<Button asChild variant="outline" size="sm" className="w-fit">
								<Link href={routeConfig.codebase}>Start questions</Link>
							</Button>
						</ProtectedRoutePanelBody>
					</ProtectedRoutePanel>
					<ProtectedRoutePanel>
						<ProtectedRoutePanelHeader>
							<div className="mb-2 flex items-center justify-between gap-3">
								<span className="flex size-8 items-center justify-center rounded-lg border border-border/70 bg-background/70 text-muted-foreground">
									<ListVideo className="size-4" aria-hidden />
								</span>
								<Badge variant="secondary" size="sm">
									Template
								</Badge>
							</div>
							<ProtectedRoutePanelTitle>Lessons</ProtectedRoutePanelTitle>
							<ProtectedRoutePanelDescription>
								Use the template-first path and follow the guided videos when
								you want the build-along track.
							</ProtectedRoutePanelDescription>
						</ProtectedRoutePanelHeader>
						<ProtectedRoutePanelBody className="flex flex-col gap-4">
							<p className="text-sm leading-6 text-muted-foreground">
								Start from the template, then keep the lessons open while you
								wire the first product pass.
							</p>
							<div className="flex flex-wrap gap-2">
								<Button asChild size="sm">
									<a href={starterTemplateDownloadHref} download>
										<Download className="size-4" aria-hidden />
										Download template
									</a>
								</Button>
								<Button asChild variant="outline" size="sm">
									<Link href={routeConfig.tutorials}>Open lessons</Link>
								</Button>
							</div>
						</ProtectedRoutePanelBody>
					</ProtectedRoutePanel>
				</section>
			</ProtectedRoutePage>
		</AppShell>
	);
}
