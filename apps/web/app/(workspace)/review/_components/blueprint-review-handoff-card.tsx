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
		<section className="rounded-[32px] border border-border/60 bg-muted/15 p-8 sm:p-12">
			<div className="max-w-2xl space-y-4">
				<div className="space-y-3">
					<h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
						Your Ship by Sunday Blueprint is ready.
					</h2>
					<p className="text-lg leading-relaxed text-muted-foreground">
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
						<Button asChild size="lg" className="h-14 w-full text-lg font-bold">
							<Link href={buildLessonsHref}>Continue to Build Lessons</Link>
						</Button>
					) : (
						<Button
							type="button"
							size="lg"
							className="h-14 w-full text-lg font-bold"
							disabled
						>
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
