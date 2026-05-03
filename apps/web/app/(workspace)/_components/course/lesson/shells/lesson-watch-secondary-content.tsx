"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type {
	LessonPromptResourceContent,
	LessonResourceContent,
	LessonTranscriptContent,
} from "@/lib/course/lesson/model/contracts";

import { CopyPromptResourceCard } from "./copy-prompt-resource-card";
import type { PinnedArtifact } from "./types";

const eyebrowClass =
	"font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80";

type HelpfulLink = Exclude<LessonResourceContent, { kind: "copy_prompt" }>;

export function LessonWatchSecondaryContent({
	copyPromptCards,
	transcript,
	helpfulLinks,
	pinnedArtifacts,
}: {
	copyPromptCards: LessonPromptResourceContent[];
	transcript: LessonTranscriptContent | null | undefined;
	helpfulLinks: HelpfulLink[];
	pinnedArtifacts: PinnedArtifact[];
}) {
	const hasTranscript =
		transcript?.status === "ready" && Boolean(transcript.body);
	if (
		copyPromptCards.length === 0 &&
		!hasTranscript &&
		helpfulLinks.length === 0
	) {
		return null;
	}

	return (
		<>
			{copyPromptCards.length > 0 ? (
				<div className="space-y-3">
					{copyPromptCards.map((resource) => (
						<CopyPromptResourceCard
							key={resource.id}
							resource={resource}
							pinnedArtifacts={pinnedArtifacts}
						/>
					))}
				</div>
			) : null}
			{hasTranscript && transcript ? (
				<section className="space-y-3">
					<Separator />
					<h2 className={eyebrowClass}>Transcript</h2>
					<p className="max-w-[64ch] whitespace-pre-wrap border-l border-border/40 pl-4 text-[13px] leading-7 text-muted-foreground">
						{transcript.body}
					</p>
				</section>
			) : null}
			{helpfulLinks.length > 0 ? (
				<section className="space-y-3">
					<Separator />
					<h2 className={eyebrowClass}>Helpful links</h2>
					<div className="grid gap-3 sm:grid-cols-2">
						{helpfulLinks.map((resource) => (
							<HelpfulLinkButton key={resource.id} resource={resource} />
						))}
					</div>
				</section>
			) : null}
		</>
	);
}

function HelpfulLinkButton({ resource }: { resource: HelpfulLink }) {
	const isExternal = resource.kind === "external";
	const Icon = isExternal ? ArrowUpRight : ArrowRight;
	return (
		<Button
			asChild
			variant="outline"
			className={cn(
				"group h-auto min-h-0 justify-start rounded-xl border-border/60 bg-background px-4 py-3 text-left font-medium whitespace-normal hover:bg-muted/30",
			)}
		>
			<Link
				href={resource.href}
				target={isExternal ? "_blank" : undefined}
				rel={isExternal ? "noopener noreferrer" : undefined}
			>
				<span className="min-w-0 flex-1 break-words">{resource.label}</span>
				<Icon
					className="ml-auto size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground motion-reduce:transition-none"
					aria-hidden
				/>
			</Link>
		</Button>
	);
}
