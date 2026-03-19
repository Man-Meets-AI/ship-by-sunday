"use client";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WorkbenchField } from "@/features/course/lesson/model/manifest";
import type {
	StartWithProblemCandidate,
	StartWithProblemSignal,
} from "@/features/course/lesson/workbench/lib/start-with-problem-support";

import {
	StartWithProblemCandidateBody,
	startWithProblemSignalReadyCount,
} from "./start-with-problem-candidate-card";

export type CompareCandidateRow = StartWithProblemCandidate & {
	signals: StartWithProblemSignal[];
};

export function CompareCandidatesSection({
	rows,
	fields,
	fieldValues,
	onFieldChange,
	invalidFieldIds,
}: {
	rows: CompareCandidateRow[];
	fields: WorkbenchField[];
	fieldValues: Record<string, unknown>;
	onFieldChange: (fieldId: string, value: unknown) => void;
	invalidFieldIds: Set<string>;
}) {
	return (
		<Card className="gap-0 py-0">
			<CardHeader className="border-b border-border pb-4">
				<CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
					Compare your three candidates
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-4">
				<div className="lg:hidden">
					<Tabs defaultValue="candidate-1" className="w-full">
						<TabsList
							variant="default"
							className="grid h-auto min-h-0 w-full grid-cols-3 gap-1 p-1"
						>
							{rows.map((row) => {
								const ready = startWithProblemSignalReadyCount(row.signals);
								return (
									<TabsTrigger
										key={row.index}
										value={`candidate-${row.index}`}
										className="h-auto min-h-10 flex-col gap-1 py-2 whitespace-normal"
									>
										<span className="text-xs font-medium sm:text-sm">
											Candidate {row.index}
										</span>
										<Badge
											variant="secondary"
											className="text-[0.65rem] sm:text-xs"
										>
											{ready}/3
										</Badge>
									</TabsTrigger>
								);
							})}
						</TabsList>
						{rows.map((row) => (
							<TabsContent
								key={row.index}
								value={`candidate-${row.index}`}
								className="mt-4"
							>
								<Card className="gap-0 py-0">
									<CardContent className="space-y-4 pt-4">
										<StartWithProblemCandidateBody
											index={row.index}
											signals={row.signals}
											fields={fields}
											fieldValues={fieldValues}
											onFieldChange={onFieldChange}
											invalidFieldIds={invalidFieldIds}
										/>
									</CardContent>
								</Card>
							</TabsContent>
						))}
					</Tabs>
				</div>

				<div className="hidden gap-4 lg:grid lg:grid-cols-3">
					{rows.map((row) => {
						const ready = startWithProblemSignalReadyCount(row.signals);
						return (
							<Card key={row.index} className="gap-0 py-0">
								<CardHeader className="border-b border-border pb-4">
									<CardTitle className="text-base font-medium">
										Candidate {row.index}
									</CardTitle>
									<CardAction>
										<Badge variant="secondary" className="text-xs">
											{ready}/3 signals
										</Badge>
									</CardAction>
								</CardHeader>
								<CardContent className="space-y-4 pt-4">
									<StartWithProblemCandidateBody
										index={row.index}
										signals={row.signals}
										fields={fields}
										fieldValues={fieldValues}
										onFieldChange={onFieldChange}
										invalidFieldIds={invalidFieldIds}
									/>
								</CardContent>
							</Card>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
