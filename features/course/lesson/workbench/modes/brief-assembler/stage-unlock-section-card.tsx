import Link from "next/link";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { StageUnlockSection } from "@/features/course/lesson/model/stage-unlock";

const sectionHeaderClass = "border-b border-border/60 px-4 py-3 sm:px-5";

const sectionBodyClass = "px-4 py-4 sm:px-5 sm:py-5";

const sectionTitleClass = "text-sm font-semibold leading-none text-foreground";

const sectionLabelClass = "text-sm font-medium text-muted-foreground";

const sectionActionClass =
	"inline-flex items-center text-sm font-medium text-foreground underline-offset-4 transition-colors hover:underline";

function splitSectionLines(value: string) {
	const lines = value
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);

	return {
		bodyLines: lines.filter(
			(line) => !/^\[\d+\]:/.test(line) && !/^https?:\/\//.test(line),
		),
		sourceLines: lines.filter(
			(line) => /^\[\d+\]:/.test(line) || /^https?:\/\//.test(line),
		),
	};
}

function splitLineLabel(line: string) {
	const match = /^([^:]{2,42}):\s*(.+)$/.exec(line);

	if (!match) {
		return null;
	}

	return {
		label: match[1],
		value: match[2],
	};
}

export function StageUnlockSectionCard({
	section,
	className,
}: {
	section: StageUnlockSection;
	className?: string;
}) {
	const { bodyLines, sourceLines } = splitSectionLines(section.value);
	const bodyLineKeyCounts = new Map<string, number>();
	const sourceLineKeyCounts = new Map<string, number>();
	return (
		<Card className={cn("gap-0 py-0", className)}>
			<CardHeader className={sectionHeaderClass}>
				<div className="flex flex-wrap items-center justify-between gap-2">
					<p className={sectionTitleClass} style={{ textWrap: "balance" }}>
						{section.label}
					</p>
					{section.action ? (
						<Link href={section.action.href} className={sectionActionClass}>
							{section.action.label}
						</Link>
					) : null}
				</div>
			</CardHeader>
			<CardContent className={`${sectionBodyClass} space-y-4`}>
				<div className="space-y-3">
					{bodyLines.map((line, lineIndex) => {
						const keyValue = splitLineLabel(line);
						const lineOccurrence = bodyLineKeyCounts.get(line) ?? 0;
						bodyLineKeyCounts.set(line, lineOccurrence + 1);
						const lineKey = `${section.label}-${line}-${lineOccurrence}`;

						if (keyValue) {
							return (
								<div key={lineKey} className="space-y-1">
									<p className={sectionLabelClass}>{keyValue.label}</p>
									<p
										className="text-sm leading-7 text-foreground"
										style={{ overflowWrap: "anywhere" }}
									>
										{keyValue.value}
									</p>
								</div>
							);
						}

						return (
							<p
								key={lineKey}
								className={
									lineIndex === 0
										? "text-base font-medium leading-7 text-foreground"
										: "text-sm leading-7 text-foreground"
								}
								style={{ overflowWrap: "anywhere" }}
							>
								{line}
							</p>
						);
					})}
				</div>
				{section.galleryImageUrls?.length ? (
					<div className="grid grid-cols-2 gap-2 md:grid-cols-4">
						{section.galleryImageUrls.map((imageUrl, imageIndex) => (
							<div
								key={`${section.label}-${imageUrl}`}
								className="aspect-[4/3] overflow-hidden rounded-lg border border-border bg-background"
							>
								<img
									src={imageUrl}
									alt={`${section.label} reference ${imageIndex + 1}`}
									className="h-full w-full object-cover"
								/>
							</div>
						))}
					</div>
				) : null}
				{section.imageUrl ? (
					<div className="overflow-hidden rounded-lg border border-border bg-background">
						<img
							src={section.imageUrl}
							alt={`${section.label} preview`}
							className="h-40 w-full object-cover sm:h-48"
						/>
					</div>
				) : null}
				{sourceLines.length ? (
					<div className="border-t border-border/60 pt-3">
						<p className={sectionLabelClass}>Sources</p>
						<ul className="mt-2 space-y-1.5">
							{sourceLines.map((line) => {
								const lineOccurrence = sourceLineKeyCounts.get(line) ?? 0;
								sourceLineKeyCounts.set(line, lineOccurrence + 1);

								return (
									<li
										key={`${section.label}-source-${line}-${lineOccurrence}`}
										className="text-sm leading-6 text-muted-foreground"
										style={{ overflowWrap: "anywhere" }}
									>
										{line}
									</li>
								);
							})}
						</ul>
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}
