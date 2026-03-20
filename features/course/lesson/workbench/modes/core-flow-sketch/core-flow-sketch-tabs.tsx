"use client";

import type { WorkbenchField } from "@/features/course/lesson/model/manifest";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CoreFlowSketchBrandSection } from "./core-flow-sketch-brand-section";
import { CoreFlowSketchCrazyEights } from "./core-flow-sketch-crazy-eights";
import { CoreFlowSketchField } from "./core-flow-sketch-fields";
import { CoreFlowSketchScreenReference } from "./core-flow-sketch-screen-reference";
import { CoreFlowSketchTimer } from "./core-flow-sketch-timer";

type CoreFlowSketchTabsProps = {
	briefFields: WorkbenchField[];
	execution: WorkbenchField | null;
	sketchNotes: WorkbenchField | null;
	namedScreens: WorkbenchField | null;
	brandPath: WorkbenchField | null;
	brandNotes: WorkbenchField | null;
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	invalidFieldIds: Set<string>;
};

export function CoreFlowSketchTabs({
	briefFields,
	execution,
	sketchNotes,
	namedScreens,
	brandPath,
	brandNotes,
	fieldValues,
	onFieldChange,
	invalidFieldIds,
}: CoreFlowSketchTabsProps) {
	return (
		<Tabs defaultValue="brief" className="w-full">
			<TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-1">
				<TabsTrigger value="brief">Brief</TabsTrigger>
				<TabsTrigger value="sketch">Sketch</TabsTrigger>
				<TabsTrigger value="screens">Named screens</TabsTrigger>
				<TabsTrigger value="resources">Resources</TabsTrigger>
			</TabsList>
			<TabsContent value="brief" className="space-y-4">
				<Alert variant="default">
					<AlertTitle>Keep it low-fidelity</AlertTitle>
					<AlertDescription>
						Paper and fat-marker thinking. Minimal detail—just enough to show
						the flow to your future self.
					</AlertDescription>
				</Alert>
				<Alert>
					<AlertTitle>Stay in the lesson when you can</AlertTitle>
					<AlertDescription>
						Use the worksheet here first; only jump out if you truly need a
						tool.
					</AlertDescription>
				</Alert>
				{briefFields.map((field) => (
					<CoreFlowSketchField
						key={field.id}
						field={field}
						value={fieldValues[field.id]}
						onChange={(value) => onFieldChange(field.id, value)}
						invalid={invalidFieldIds.has(field.id)}
					/>
				))}
			</TabsContent>
			<TabsContent value="sketch" className="space-y-4">
				<CoreFlowSketchTimer />
				<CoreFlowSketchCrazyEights />
				{execution ? (
					<CoreFlowSketchField
						field={execution}
						value={fieldValues[execution.id]}
						onChange={(value) => onFieldChange(execution.id, value)}
						invalid={invalidFieldIds.has(execution.id)}
					/>
				) : null}
				{sketchNotes ? (
					<CoreFlowSketchField
						field={sketchNotes}
						value={fieldValues[sketchNotes.id]}
						onChange={(value) => onFieldChange(sketchNotes.id, value)}
						invalid={invalidFieldIds.has(sketchNotes.id)}
					/>
				) : null}
			</TabsContent>
			<TabsContent value="screens" className="space-y-4">
				<CoreFlowSketchScreenReference />
				{namedScreens ? (
					<CoreFlowSketchField
						field={namedScreens}
						value={fieldValues[namedScreens.id]}
						onChange={(value) => onFieldChange(namedScreens.id, value)}
						invalid={invalidFieldIds.has(namedScreens.id)}
					/>
				) : null}
			</TabsContent>
			<TabsContent value="resources" className="space-y-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-base">Prerequisites</CardTitle>
						<CardDescription>Gather before you sketch.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2 text-sm text-muted-foreground">
						<p>Figma or Canva brand file (or plan to create a guide).</p>
						<p>
							ChatGPT account for the “Connect GPT” assumption in this flow.
						</p>
						<p>Optional: one template post you might generate from later.</p>
					</CardContent>
				</Card>
				{brandPath && brandNotes ? (
					<CoreFlowSketchBrandSection
						brandPathField={brandPath}
						brandNotesField={brandNotes}
						fieldValues={fieldValues}
						onFieldChange={onFieldChange}
						invalidFieldIds={invalidFieldIds}
					/>
				) : null}
				<Alert>
					<AlertTitle>Next artifact: photo of your chosen sketch</AlertTitle>
					<AlertDescription>
						When you continue, Figma Make works best from a clear photo of one
						flow—not a pile of unfinished frames.
					</AlertDescription>
				</Alert>
			</TabsContent>
		</Tabs>
	);
}
