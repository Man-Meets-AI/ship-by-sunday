import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { InfoIcon } from "lucide-react";
import {
	getLesson,
	type BlockId,
	type LessonConfig,
} from "@/features/course/lesson/model/manifest";
import {
	getOrderedBlocks,
	getStudentFacingLessons,
} from "@/features/course/lesson/model/registry";
import type { WorkbenchModeProps } from "../types";
import { RoadmapSprintCatalogAccordion } from "./roadmap-sprint-catalog-accordion";
import { RoadmapSprintDeliverablesCard } from "./roadmap-sprint-deliverables-card";
import { RoadmapSprintPhaseCard } from "./roadmap-sprint-phase-card";
import { RoadmapSprintSequencePreview } from "./roadmap-sprint-sequence-preview";

const roadmapBlockDescriptionsById: Record<BlockId, string> = {
	CEO: "Choose the problem, user, outcome, flow, and scope before you build.",
	DESIGN:
		"Turn the brief into screens and decisions so the build is translation, not guessing.",
	BUILD: "Use AI and your tools to implement the core flow without spiraling.",
	SHIP: "Deploy, demo, share, and capture the first feedback loop.",
};

function normalizeRoadmapBlockDescription(
	blockLabel: string,
	description: string,
) {
	return description.replace(
		new RegExp(`^${blockLabel}\\s+Block\\s*=\\s*`, "i"),
		"",
	);
}

export function RoadmapSprintOverview({
	lesson,
	lessonContent,
}: {
	lesson: LessonConfig;
	lessonContent: WorkbenchModeProps["lessonContent"];
}) {
	const orderedBlocks = getOrderedBlocks().map((block, index) => ({
		...block,
		description: normalizeRoadmapBlockDescription(
			block.label,
			lessonContent.workbench.teachingPoints?.[index] ??
				roadmapBlockDescriptionsById[block.id],
		),
		lessons: getStudentFacingLessons().filter((l) => l.block === block.id),
	}));

	const thenLesson = getLesson("1.4");

	return (
		<div className="space-y-4">
			<RoadmapSprintPhaseCard lesson={lesson} />
			<RoadmapSprintSequencePreview />
			<RoadmapSprintDeliverablesCard />
			<Alert className="border-border/60 bg-muted/20">
				<InfoIcon />
				<AlertDescription>
					Lessons are intentionally bite-size. Complete them in order—do not
					skip ahead—so each step stays lightweight and the next lesson makes
					sense.
				</AlertDescription>
			</Alert>
			<RoadmapSprintCatalogAccordion orderedBlocks={orderedBlocks} />
			<Separator className="bg-border" />
			<div className="space-y-3">
				{thenLesson ? (
					<p className="text-sm leading-relaxed text-muted-foreground">
						After that: {thenLesson.id} {thenLesson.title}, then outcome,
						research, flow, and scope.
					</p>
				) : null}
			</div>
		</div>
	);
}
