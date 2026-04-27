import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Empty, EmptyDescription } from "@/components/ui/empty";
import type { LessonExampleContent } from "@/lib/course/lesson/model/contracts";
import { formatArtifactValue } from "@/app/(workspace)/_components/course/lesson/workbench/shared/artifact-format";

import type { PinnedArtifact } from "./types";

export function CoachExamplesPanelContent({
	examples,
	pinnedArtifacts,
}: {
	examples: LessonExampleContent[];
	pinnedArtifacts: PinnedArtifact[];
}) {
	if (examples.length > 0) {
		return (
			<div className="space-y-6">
				{examples.map((example) => (
					<div key={example.id} className="space-y-3">
						<h3 className="text-sm font-bold tracking-tight text-foreground">
							{example.title}
						</h3>
						<div className="space-y-4">
							<p className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground/90">
								{example.body}
							</p>
							{example.imageSrc ? (
								<div className="space-y-2">
									<AspectRatio ratio={16 / 9}>
										<img
											src={example.imageSrc}
											alt={example.imageAlt ?? example.title}
											className="h-full w-full rounded-lg border border-border/40 bg-background/50 object-contain shadow-sm"
											loading="lazy"
										/>
									</AspectRatio>
									{example.imageCaption ? (
										<p className="text-[11px] text-muted-foreground/70 italic">
											{example.imageCaption}
										</p>
									) : null}
								</div>
							) : null}
						</div>
						<div className="border-b border-border/30 pt-3" />
					</div>
				))}
			</div>
		);
	}

	if (pinnedArtifacts.length > 0) {
		return (
			<div className="space-y-4">
				{pinnedArtifacts.slice(0, 3).map((artifact) => (
					<div
						key={artifact.artifactKey}
						className="space-y-3 rounded-lg border border-border/40 bg-muted/5 p-4"
					>
						<div className="space-y-1">
							<p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
								{artifact.lessonTitle}
							</p>
							<h3 className="text-sm font-bold tracking-tight text-foreground">
								{artifact.artifactLabel}
							</h3>
						</div>
						<div className="space-y-3">
							{artifact.fields.length === 0 ? (
								<p className="text-[12px] italic text-muted-foreground/60">
									No preview details attached.
								</p>
							) : (
								artifact.fields.slice(0, 2).map(([key, value]) => (
									<div key={key} className="space-y-1">
										<p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50">
											{key}
										</p>
										<p className="text-[13px] leading-relaxed text-foreground/80">
											{formatArtifactValue(value)}
										</p>
									</div>
								))
							)}
						</div>
					</div>
				))}
			</div>
		);
	}

	return (
		<Empty className="min-h-0 flex-none items-start justify-start border-0 bg-transparent p-0 text-left">
			<EmptyDescription>
				Examples will show here when attached.
			</EmptyDescription>
		</Empty>
	);
}
