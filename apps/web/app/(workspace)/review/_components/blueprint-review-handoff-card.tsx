import Link from "next/link";
import { Button } from "@/components/ui/button";

export function BlueprintReviewHandoffCard({
	autoDownloadStatus,
	buildLessonsHref,
	downloadHref,
	fallbackLinkLabel,
}: {
	autoDownloadStatus: string | null;
	buildLessonsHref: string | null;
	downloadHref: string;
	fallbackLinkLabel: string;
}) {
	return (
		<section className="rounded-2xl border border-border/60 bg-muted/15 p-6 sm:p-8">
			<div className="max-w-2xl space-y-4">
				<div className="space-y-3">
					<h2 className="text-2xl font-semibold text-balance sm:text-3xl">
						Your Ship by Sunday Blueprint is ready.
					</h2>
					<p className="text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
						You now have the blueprint itself plus the generated Design,
						Marketing, Build, and Prompt Packs, so the work can keep moving from
						one source of truth instead of drifting between tools.
					</p>
					<p className="text-sm leading-6 text-muted-foreground">
						Keep this handoff close while you move into Build Lessons. It is the
						fastest path from the blueprint into execution.
					</p>
					{autoDownloadStatus ? (
						<p className="text-sm font-medium leading-6 text-foreground/80">
							{autoDownloadStatus}
						</p>
					) : null}
				</div>

				<div className="flex max-w-sm flex-col gap-4">
					{buildLessonsHref ? (
						<Button asChild size="lg" className="w-full">
							<Link href={buildLessonsHref}>Continue to Build Lessons</Link>
						</Button>
					) : (
						<Button type="button" size="lg" className="w-full" disabled>
							Continue to Build Lessons
						</Button>
					)}

					<Button
						asChild
						variant="link"
						size="sm"
						className="h-auto justify-start px-0 text-sm leading-6"
					>
						<a download href={downloadHref}>
							{fallbackLinkLabel}
						</a>
					</Button>
				</div>
			</div>
		</section>
	);
}
