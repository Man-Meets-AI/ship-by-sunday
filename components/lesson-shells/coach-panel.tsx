import Link from "next/link";

import { LessonVideoSurface } from "@/components/lesson-video-surface";
import { formatArtifactValue } from "@/components/lesson-workbench/shared/artifact-format";
import {
	workbenchChromeLabelClass,
	workbenchPanelClass,
} from "@/components/lesson-workbench/shared/workbench-readability";
import type { LessonResourceContent } from "@/lib/course/contracts";
import type { LessonConfig, LessonContent } from "@/lib/course/manifest";

import { CopyPromptResourceCard } from "./copy-prompt-resource-card";
import type { CoachPanelKey, PinnedArtifact } from "./types";

export function CoachPanel({
	lesson,
	coachContent,
	activePanel,
	onPanelChange,
	pinnedArtifacts,
}: {
	lesson: LessonConfig;
	coachContent: LessonContent["coach"];
	activePanel: CoachPanelKey;
	onPanelChange: (panel: CoachPanelKey) => void;
	pinnedArtifacts: PinnedArtifact[];
}) {
	const examples = (coachContent?.examples ?? []).filter(
		(example) =>
			example.id !== "avoid-this" &&
			example.title.trim().toLowerCase() !== "avoid this",
	);
	const resources = coachContent?.resources ?? [];
	const emptyVideoState =
		lesson.id === "1.1"
			? {
					eyebrow: "No lesson video yet",
					title: "Use the guided path",
					body: "This lesson is still fully usable. Lean on the inline examples, the guided prompts, and the compare-your-three recap while you draft grounded candidate problems.",
				}
			: undefined;
	const sections = [
		{
			key: "watch" as const,
			label: "Watch",
			content: (
				<LessonVideoSurface
					coachContent={coachContent}
					emptyState={emptyVideoState}
				/>
			),
		},
		{
			key: "transcript" as const,
			label: "Transcript",
			content:
				coachContent?.transcript?.status === "ready" &&
				coachContent.transcript.body ? (
					<p className="whitespace-pre-wrap text-xs font-medium leading-relaxed text-product-text">
						{coachContent.transcript.body}
					</p>
				) : (
					<p className="text-xs font-medium leading-snug text-product-muted">
						Transcript will appear here when attached.
					</p>
				),
		},
		{
			key: "examples" as const,
			label: "Examples",
			content:
				examples.length > 0 ? (
					<div className="space-y-3">
						{examples.map((example) => (
							<div
								key={example.id}
								className="rounded-none border border-product-border/55 bg-product-surface-strong/80 px-4 py-4"
							>
								<p className={workbenchChromeLabelClass}>{example.title}</p>
								<p className="mt-2 whitespace-pre-wrap text-[13px] leading-[1.68] text-product-text">
									{example.body}
								</p>
								{example.imageSrc ? (
									<div className="mt-2 space-y-1">
										<img
											src={example.imageSrc}
											alt={example.imageAlt ?? example.title}
											className="w-full rounded-none border border-product-border/70 bg-product-bg object-contain"
											loading="lazy"
										/>
										{example.imageCaption ? (
											<p className="text-[12px] leading-[1.6] text-product-muted">
												{example.imageCaption}
											</p>
										) : null}
									</div>
								) : null}
							</div>
						))}
					</div>
				) : pinnedArtifacts.length > 0 ? (
					<div className="space-y-3">
						{pinnedArtifacts.slice(0, 3).map((artifact) => (
							<div
								key={artifact.artifactKey}
								className="rounded-none border border-product-border/55 bg-product-surface-strong/80 px-4 py-4"
							>
								<p className={workbenchChromeLabelClass}>
									{artifact.lessonTitle}
								</p>
								<p className="mt-2 font-display text-[1.05rem] uppercase tracking-[0.04em] text-product-text">
									{artifact.artifactLabel}
								</p>
								<div className="mt-3 space-y-2 text-[13px] leading-[1.65] text-product-muted">
									{artifact.fields.length === 0 ? (
										<p>No preview details attached.</p>
									) : (
										artifact.fields.slice(0, 2).map(([key, value]) => (
											<div key={key}>
												<p className={workbenchChromeLabelClass}>{key}</p>
												<p className="mt-1 text-[14px] leading-[1.68] text-product-text">
													{formatArtifactValue(value)}
												</p>
											</div>
										))
									)}
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="text-[13px] leading-[1.7] text-product-muted">
						Examples will show here when attached.
					</p>
				),
		},
		{
			key: "resources" as const,
			label: "Resources",
			content:
				resources.length > 0 ? (
					<div className="space-y-3">
						{resources.map((resource) =>
							resource.kind === "copy_prompt" ? (
								<CopyPromptResourceCard
									key={resource.id}
									resource={resource}
									pinnedArtifacts={pinnedArtifacts}
								/>
							) : (
								<ResourceLink key={resource.id} resource={resource} />
							),
						)}
					</div>
				) : (
					<p className="text-[13px] leading-[1.7] text-product-muted">
						Resources will show here when assigned.
					</p>
				),
		},
	].filter((section) =>
		lesson.coachVideoPlacement === "workbench" ? section.key !== "watch" : true,
	);

	return (
		<aside
			className={`min-w-0 xl:h-full xl:min-h-0 xl:overflow-y-auto ${workbenchPanelClass}`}
		>
			<div className="sticky top-0 z-10 border-b border-product-border/55 bg-product-surface/95 px-4 py-2 backdrop-blur-lg">
				<p className={workbenchChromeLabelClass}>Coach</p>
			</div>
			<div>
				{sections.map((section) => {
					const isOpen = section.key === activePanel;
					return (
						<div
							key={section.key}
							className={`border-b border-product-border last:border-b-0 ${
								isOpen ? "bg-product-surface-strong/65" : ""
							}`}
						>
							<button
								type="button"
								onClick={() => onPanelChange(section.key)}
								className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-product-surface-strong/50"
							>
								<div className="flex items-center gap-2">
									<span
										className={`inline-block h-2 w-2 border ${
											isOpen
												? "border-product-accent bg-product-accent"
												: "border-product-border bg-product-surface"
										}`}
									/>
									<span className="font-mono text-[10px] uppercase tracking-[0.18em] text-product-text">
										{section.label}
									</span>
								</div>
							</button>
							{isOpen ? (
								<div className="border-t border-product-border/45 px-4 py-4">
									{section.content}
								</div>
							) : null}
						</div>
					);
				})}
			</div>
		</aside>
	);
}

function ResourceLink({
	resource,
}: {
	resource: Exclude<LessonResourceContent, { kind: "copy_prompt" }>;
}) {
	return (
		<Link
			href={resource.href}
			target={resource.kind === "external" ? "_blank" : undefined}
			className="block rounded-none border border-product-border/55 bg-product-surface-strong/80 px-4 py-4 transition-colors hover:bg-product-surface-alt"
		>
			<p className={workbenchChromeLabelClass}>{resource.kind}</p>
			<p className="mt-2 text-[14px] font-semibold leading-[1.45] text-product-text">
				{resource.label}
			</p>
		</Link>
	);
}
