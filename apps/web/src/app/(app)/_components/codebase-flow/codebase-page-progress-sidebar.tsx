"use client";

import { useEffect, useMemo, useState } from "react";
import { Progress } from "@/components/ui/progress";
import {
	CodebasePageProgressSidebarItem,
	type CodebasePageSidebarSectionProgress,
} from "@/app/(app)/_components/codebase-flow/codebase-page-progress-sidebar-item";
import type { CodebasePageSectionStatus } from "@/app/(app)/_hooks/codebase-flow/use-codebase-page-state";
import { codebasePageSections } from "@/lib/codebase-flow/codebase-page-sections";

function deriveProgress(
	status: CodebasePageSectionStatus | undefined,
	totalRequired: number,
): CodebasePageSidebarSectionProgress {
	if (!status) return "empty";
	if (status.isComplete) return "complete";
	if (totalRequired === 0) return "empty";
	if (status.missingFactKeys.length < totalRequired) return "started";
	return "empty";
}

function useActiveSectionId(sectionIds: readonly string[]): string | null {
	const [activeId, setActiveId] = useState<string | null>(null);

	useEffect(() => {
		if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
			return;
		}
		const targets = sectionIds
			.map((id) => document.getElementById(id))
			.filter((element): element is HTMLElement => element !== null);
		if (targets.length === 0) {
			return;
		}
		const visibility = new Map<string, number>();
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					visibility.set(entry.target.id, entry.intersectionRatio);
				}
				let bestId: string | null = null;
				let bestRatio = 0;
				for (const [id, ratio] of visibility) {
					if (ratio > bestRatio) {
						bestId = id;
						bestRatio = ratio;
					}
				}
				setActiveId(bestRatio > 0 ? bestId : null);
			},
			{
				rootMargin: "-25% 0px -55% 0px",
				threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
			},
		);
		for (const element of targets) {
			observer.observe(element);
		}
		return () => observer.disconnect();
	}, [sectionIds]);

	return activeId;
}

export function CodebasePageProgressSidebar({
	sectionStatuses,
}: {
	sectionStatuses: CodebasePageSectionStatus[];
}) {
	const statusBySectionId = new Map(
		sectionStatuses.map((sectionStatus) => [
			sectionStatus.sectionId,
			sectionStatus,
		]),
	);
	const completedCount = sectionStatuses.filter(
		(sectionStatus) => sectionStatus.isComplete,
	).length;
	const progressPercent =
		sectionStatuses.length > 0
			? Math.round((completedCount / sectionStatuses.length) * 100)
			: 0;
	const sectionIds = useMemo(
		() => codebasePageSections.map((section) => section.id),
		[],
	);
	const activeSectionId = useActiveSectionId(sectionIds);

	return (
		<aside className="space-y-4" data-testid="codebase-page-progress-sidebar">
			<div className="space-y-2">
				<div className="flex items-baseline justify-between">
					<p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
						Progress
					</p>
					<p className="text-xs font-number text-muted-foreground/70">
						{completedCount}/{sectionStatuses.length}
					</p>
				</div>
				<Progress value={progressPercent} className="h-1" />
			</div>
			<nav aria-label="Codebase sections" className="space-y-px">
				{codebasePageSections.map((section, index) => {
					const status = statusBySectionId.get(section.id);
					const totalRequired = (section.requiredFieldKeys ?? section.fieldKeys)
						.length;
					const progress = deriveProgress(status, totalRequired);
					const isActive = activeSectionId === section.id;

					return (
						<CodebasePageProgressSidebarItem
							key={section.id}
							sectionId={section.id}
							sectionLabel={section.label}
							sectionNumber={index + 1}
							progress={progress}
							isActive={isActive}
						/>
					);
				})}
			</nav>
		</aside>
	);
}
