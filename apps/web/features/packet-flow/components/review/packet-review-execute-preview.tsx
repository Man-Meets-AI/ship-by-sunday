import { Button } from "@/components/ui/button";
import Link from "next/link";

export function PacketReviewExecutePreview({
	buildLessonsHref,
	isReviewReady,
	hasUnlockedReviewFlow,
	onOpenLessonMap,
	onContinue,
}: {
	buildLessonsHref: string | null;
	isReviewReady: boolean;
	hasUnlockedReviewFlow: boolean;
	onOpenLessonMap?: () => void;
	onContinue?: () => void;
}) {
	return (
		<section className="relative overflow-hidden rounded-[32px] border border-border/60 bg-background p-8 sm:p-12">
			<div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
				<div className="max-w-2xl space-y-3">
					<h2 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">
						Keep going
					</h2>
					<p className="text-lg leading-relaxed text-muted-foreground">
						Once you&apos;ve downloaded the Ship Kit, continue into Build
						Lessons while the packet context is still hot.
					</p>
				</div>

				<div className="flex shrink-0 flex-col gap-4 lg:w-80">
					{hasUnlockedReviewFlow ? (
						<>
							{buildLessonsHref ? (
								<Button
									asChild
									size="lg"
									className="h-14 w-full text-lg font-bold"
								>
									<Link href={buildLessonsHref} onClick={onContinue}>
										Continue to Build Lessons
									</Link>
								</Button>
							) : (
								<Button
									type="button"
									size="lg"
									className="h-14 w-full text-lg font-bold"
									disabled
								>
									Loading Build Lessons...
								</Button>
							)}
							{onOpenLessonMap ? (
								<Button
									type="button"
									variant="ghost"
									className="h-11 w-full text-sm font-semibold"
									onClick={onOpenLessonMap}
								>
									Open Lesson Map
								</Button>
							) : null}
						</>
					) : isReviewReady ? (
						<Button
							asChild
							size="lg"
							variant="outline"
							className="h-14 w-full text-lg font-bold"
						>
							<a download href="/api/download/repo">
								Download Ship Kit first
							</a>
						</Button>
					) : (
						<Button
							type="button"
							size="lg"
							variant="outline"
							className="h-14 w-full text-lg font-bold"
							disabled
						>
							Download Ship Kit first
						</Button>
					)}
					<p className="px-1 text-center text-xs leading-5 text-muted-foreground lg:text-left">
						The required packet run ends with the download. This is the next
						path if you want to keep moving.
					</p>
				</div>
			</div>
		</section>
	);
}
