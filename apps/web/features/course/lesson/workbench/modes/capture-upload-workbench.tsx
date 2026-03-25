import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@/components/ui/item";

import { FieldList } from "../fields/field-list";
import { formatArtifactValue } from "../shared/artifact-format";
import type { WorkbenchModeProps } from "../types";
import {
	LessonWorkbenchLabeledCard,
	LessonWorkbenchPageHeader,
	LessonWorkbenchStatusCards,
} from "./lesson-workbench-shadcn-chrome";

export function CaptureUploadWorkbench({
	lesson,
	lessonContent,
	fieldValues,
	onFieldChange,
	pinnedArtifacts,
	invalidFieldIds,
	fields,
	objectiveTasks,
	completedTaskCount,
}: WorkbenchModeProps) {
	const templateLabel = lessonContent.workbench.templateDownloadLabel;
	const templateHref = lessonContent.workbench.templateDownloadHref;
	const isExternalLink = Boolean(
		templateHref && /^https?:\/\//i.test(templateHref),
	);

	return (
		<div className="w-full space-y-4 pb-1">
			<LessonWorkbenchPageHeader
				lesson={lesson}
				lessonContent={lessonContent}
			/>
			{templateLabel && templateHref ? (
				<LessonWorkbenchLabeledCard label="Template">
					<Button asChild variant="outline" size="sm">
						<a
							href={templateHref}
							target={isExternalLink ? "_blank" : undefined}
							rel={isExternalLink ? "noreferrer" : undefined}
						>
							{templateLabel}
						</a>
					</Button>
				</LessonWorkbenchLabeledCard>
			) : null}
			<LessonWorkbenchStatusCards
				lessonContent={lessonContent}
				completedTaskCount={completedTaskCount}
				totalTaskCount={Math.max(objectiveTasks.length, 1)}
			/>
			{pinnedArtifacts.length > 0 ? (
				<div className="grid gap-3 md:grid-cols-2">
					{pinnedArtifacts.map((artifact) => (
						<LessonWorkbenchLabeledCard
							key={artifact.artifactKey}
							label={artifact.contextTitle ?? artifact.artifactLabel}
						>
							{artifact.fields.length === 0 ? (
								<Alert className="py-2">
									<AlertDescription>
										No preview details attached.
									</AlertDescription>
								</Alert>
							) : (
								<ItemGroup className="gap-3">
									{artifact.fields.map(([key, value]) => (
										<Item
											key={key}
											variant="muted"
											size="sm"
											className="flex-col"
										>
											<ItemContent className="w-full gap-1">
												<ItemTitle className="text-xs font-normal text-muted-foreground">
													{key}
												</ItemTitle>
												<ItemDescription className="line-clamp-none text-foreground">
													{formatArtifactValue(value)}
												</ItemDescription>
											</ItemContent>
										</Item>
									))}
								</ItemGroup>
							)}
						</LessonWorkbenchLabeledCard>
					))}
				</div>
			) : null}
			<FieldList
				fields={fields}
				fieldValues={fieldValues}
				onFieldChange={onFieldChange}
				pinnedArtifacts={pinnedArtifacts}
				invalidFieldIds={invalidFieldIds}
				className="grid gap-2 lg:grid-cols-2"
			/>
		</div>
	);
}
