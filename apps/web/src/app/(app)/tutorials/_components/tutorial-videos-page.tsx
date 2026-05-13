import Link from "next/link";

import { AppShell } from "@/app/(app)/_components/app-shell";
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
			<div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 pb-10 pt-4 sm:px-6 lg:px-8">
				<header className="space-y-5 border-b border-border/60 pb-6">
					<div className="space-y-3">
						<h1 className="font-heading-serif text-4xl font-normal text-foreground sm:text-5xl">
							Tutorial Videos
						</h1>
						<p className="max-w-[64ch] text-base leading-7 text-muted-foreground">
							Watch all {formatVideoCount(library.totalLessons)} in the Ship by
							Sunday library without choosing or changing a product path.
						</p>
					</div>
					<nav
						aria-label="Tutorial video blocks"
						className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4"
					>
						{library.blocks.map((block) => (
							<Link
								key={block.id}
								href={`#${block.id.toLowerCase()}-videos`}
								className="rounded-lg border border-border/60 px-3 py-2.5 text-sm transition-colors hover:bg-muted/40"
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
				</header>
				<div className="space-y-10">
					{library.blocks.map((block) => (
						<section
							key={block.id}
							id={`${block.id.toLowerCase()}-videos`}
							className="scroll-mt-6 space-y-5"
						>
							<div className="space-y-1">
								<h2 className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-lg font-semibold text-foreground">
									<span>{block.label}</span>
									<span className="font-mono text-xs font-semibold text-muted-foreground">
										{formatVideoCount(block.videoCount)}
									</span>
								</h2>
								<p className="max-w-[72ch] text-sm leading-6 text-muted-foreground">
									{block.summary}
								</p>
							</div>
							<div className="space-y-5">
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
							</div>
						</section>
					))}
				</div>
			</div>
		</AppShell>
	);
}
