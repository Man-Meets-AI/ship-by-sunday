import Link from "next/link";
import { Video } from "lucide-react";

import { AppShell } from "@/app/(app)/_components/app-shell";
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
import { ItemGroup } from "@/components/ui/item";

import type { TutorialVideoLibrary } from "../_lib/tutorial-video-library";
import { TutorialVideoRow } from "./tutorial-video-row";

function formatVideoCount(videoCount: number) {
	return `${videoCount} ${videoCount === 1 ? "video" : "videos"}`;
}

export function TutorialVideosPage({
	library,
}: {
	library: TutorialVideoLibrary;
}) {
	return (
		<AppShell viewportMode="app" appScrollMode="page" showSkillRail={false}>
			<ProtectedRoutePage className="max-w-6xl gap-6 px-4 pb-10 pt-4 sm:px-6 lg:px-8">
				<ProtectedRouteHeader
					actionsClassName="w-full lg:w-72"
					actions={
						<ProtectedRouteSummaryGrid
							heading="Library summary"
							items={[
								{
									label: "Videos",
									value: formatVideoCount(library.totalLessons),
								},
								{
									label: "Blocks",
									value: String(library.blocks.length),
									mono: true,
								},
								{
									label: "Path",
									value: "Starter lessons",
								},
							]}
						/>
					}
				>
					<ProtectedRouteIcon>
						<Video className="size-4" aria-hidden />
					</ProtectedRouteIcon>
					<ProtectedRouteEyebrow>Starter library</ProtectedRouteEyebrow>
					<ProtectedRouteTitle>Tutorial Videos</ProtectedRouteTitle>
					<ProtectedRouteDescription>
						Watch all {formatVideoCount(library.totalLessons)} in the Ship by
						Sunday library without choosing or changing a product path.
					</ProtectedRouteDescription>
				</ProtectedRouteHeader>

				<ProtectedRoutePanel aria-label="Tutorial video blocks">
					<ProtectedRoutePanelHeader>
						<ProtectedRoutePanelTitle>Browse by block</ProtectedRoutePanelTitle>
						<ProtectedRoutePanelDescription>
							Jump to a tutorial block while keeping the full protected lesson
							library visible on this route.
						</ProtectedRoutePanelDescription>
					</ProtectedRoutePanelHeader>
					<ProtectedRoutePanelBody>
						<nav
							aria-label="Tutorial video blocks"
							className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4"
						>
							{library.blocks.map((block) => (
								<Link
									key={block.id}
									href={`#${block.id.toLowerCase()}-videos`}
									className="rounded-lg border border-border/60 bg-background/70 px-3 py-2.5 text-sm transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"
								>
									<span className="block font-medium text-foreground">
										{block.label}
									</span>
									<span className="text-muted-foreground">
										{formatVideoCount(block.videoCount)}
									</span>
								</Link>
							))}
						</nav>
					</ProtectedRoutePanelBody>
				</ProtectedRoutePanel>

				<div className="space-y-6">
					{library.blocks.map((block) => (
						<ProtectedRoutePanel
							key={block.id}
							id={`${block.id.toLowerCase()}-videos`}
							className="scroll-mt-6"
						>
							<ProtectedRoutePanelHeader>
								<ProtectedRoutePanelTitle className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-base">
									<span>{block.label}</span>
									<span className="font-mono text-xs font-semibold text-muted-foreground">
										{formatVideoCount(block.videoCount)}
									</span>
								</ProtectedRoutePanelTitle>
								<ProtectedRoutePanelDescription className="max-w-[72ch]">
									{block.summary}
								</ProtectedRoutePanelDescription>
							</ProtectedRoutePanelHeader>
							<ProtectedRoutePanelBody className="space-y-5">
								{block.sections.map((section) => (
									<div key={section.id} className="space-y-2.5">
										{block.sections.length > 1 ? (
											<h3 className="text-sm font-medium text-foreground">
												{section.label}
											</h3>
										) : null}
										<ItemGroup className="gap-2">
											{section.lessons.map((lesson) => (
												<TutorialVideoRow
													key={lesson.lessonKey}
													lesson={lesson}
												/>
											))}
										</ItemGroup>
									</div>
								))}
							</ProtectedRoutePanelBody>
						</ProtectedRoutePanel>
					))}
				</div>
			</ProtectedRoutePage>
		</AppShell>
	);
}
