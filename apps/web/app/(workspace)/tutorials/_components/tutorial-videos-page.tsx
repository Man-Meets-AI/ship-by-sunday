import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { AppShell } from "@/app/(workspace)/_components/app-shell";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@/components/ui/item";

import type { TutorialVideoLibrary } from "../_lib/tutorial-video-library";

export function TutorialVideosPage({
	library,
}: {
	library: TutorialVideoLibrary;
}) {
	return (
		<AppShell viewportMode="app" appScrollMode="page" showSkillRail={false}>
			<div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 pb-10 pt-4 sm:px-6 lg:px-8">
				<header className="space-y-3 border-b border-border/60 pb-6">
					<p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
						{library.totalLessons} videos
					</p>
					<div className="space-y-3">
						<h1 className="font-heading-serif text-4xl font-normal text-foreground sm:text-5xl">
							Tutorial Videos
						</h1>
						<p className="max-w-[64ch] text-base leading-7 text-muted-foreground">
							Watch the Ship by Sunday video library without choosing or
							changing a product path.
						</p>
					</div>
				</header>
				<div className="space-y-10">
					{library.blocks.map((block) => (
						<section key={block.id} className="space-y-4">
							<div className="space-y-1">
								<h2 className="text-lg font-semibold text-foreground">
									{block.label}
								</h2>
								<p className="max-w-[72ch] text-sm leading-6 text-muted-foreground">
									{block.summary}
								</p>
							</div>
							<ItemGroup className="gap-2">
								{block.lessons.map((lesson) => (
									<Item
										key={lesson.lessonKey}
										asChild
										variant="outline"
										className="items-start gap-4 rounded-md p-4 hover:bg-muted/40"
									>
										<Link href={lesson.href}>
											<ItemContent className="min-w-0">
												<ItemTitle className="line-clamp-none w-full flex-wrap text-base">
													<span className="w-10 shrink-0 font-mono text-xs font-semibold text-muted-foreground">
														{lesson.displayLabel}
													</span>
													<span className="min-w-0">{lesson.title}</span>
												</ItemTitle>
												<ItemDescription className="line-clamp-2 max-w-[72ch]">
													{lesson.description}
												</ItemDescription>
											</ItemContent>
											<ItemActions className="ml-auto shrink-0 self-center text-sm">
												{lesson.durationLabel ? (
													<span className="hidden text-muted-foreground sm:inline">
														{lesson.durationLabel}
													</span>
												) : null}
												<span className="inline-flex items-center gap-1 font-medium text-foreground">
													Watch
													<ArrowRight className="size-4" aria-hidden />
												</span>
											</ItemActions>
										</Link>
									</Item>
								))}
							</ItemGroup>
						</section>
					))}
				</div>
			</div>
		</AppShell>
	);
}
