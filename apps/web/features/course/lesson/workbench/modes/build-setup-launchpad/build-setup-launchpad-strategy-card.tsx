"use client";

import type { PinnedArtifact } from "@/features/course/lesson/shells";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

type StrategyRow = {
	key: string;
	label: string;
	fieldHint: string;
	read: (pins: PinnedArtifact[]) => string | null;
};

const STRATEGY_ROWS: StrategyRow[] = [
	{
		key: "core_flow_sketch_state",
		label: "Core flow",
		fieldHint: "Design 2.1",
		read: (pins) => {
			const a = pins.find((p) => p.artifactKey === "core_flow_sketch_state");
			if (!a) {
				return null;
			}
			const problem = a.fieldValues?.core_problem;
			if (typeof problem === "string" && problem.trim().length > 0) {
				return (
					problem.trim().slice(0, 100) +
					(problem.trim().length > 100 ? "…" : "")
				);
			}
			const upload = Object.values(a.fieldValues).find(
				(v) =>
					typeof v === "object" &&
					v !== null &&
					!Array.isArray(v) &&
					(v as { kind?: string }).kind === "upload",
			) as { fileName?: string; url?: string } | undefined;
			if (upload?.fileName) {
				return upload.fileName;
			}
			if (upload?.url) {
				return "Flow sketch saved";
			}
			return a.fields.length > 0 ? "Saved" : null;
		},
	},
	{
		key: "outcome_statement",
		label: "Outcome statement",
		fieldHint: "Lesson 1.5",
		read: (pins) => {
			const a = pins.find((p) => p.artifactKey === "outcome_statement");
			const body = a?.fieldValues?.outcome_statement_body;
			if (typeof body !== "string") {
				return null;
			}
			const t = body.trim();
			return t.length > 0
				? t.slice(0, 120) + (t.length > 120 ? "…" : "")
				: null;
		},
	},
	{
		key: "user_profile",
		label: "Customer profile",
		fieldHint: "Lesson 1.4",
		read: (pins) => {
			const a = pins.find((p) => p.artifactKey === "user_statement");
			const owner = a?.fieldValues?.selected_problem_owner;
			return typeof owner === "string" && owner.trim().length > 0
				? owner.trim().slice(0, 100) + (owner.trim().length > 100 ? "…" : "")
				: null;
		},
	},
	{
		key: "pain",
		label: "Pain",
		fieldHint: "Lesson 1.4",
		read: (pins) => {
			const a = pins.find((p) => p.artifactKey === "user_statement");
			const s = a?.fieldValues?.selected_problem_statement;
			return typeof s === "string" && s.trim().length > 0
				? s.trim().slice(0, 100) + (s.trim().length > 100 ? "…" : "")
				: null;
		},
	},
	{
		key: "frequency",
		label: "Frequency of pain",
		fieldHint: "Lesson 1.4",
		read: (pins) => {
			const a = pins.find((p) => p.artifactKey === "user_statement");
			const w = a?.fieldValues?.problem_when;
			return typeof w === "string" && w.trim().length > 0 ? w.trim() : null;
		},
	},
];

export function BuildSetupLaunchpadStrategyCard({
	pinnedArtifacts,
}: {
	pinnedArtifacts: PinnedArtifact[];
}) {
	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">Next lesson uses these</CardTitle>
				<CardDescription>
					Have your day-one notes visible—especially before you edit the
					marketing page.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Table>
					<TableBody>
						{STRATEGY_ROWS.map((row) => {
							const preview = row.read(pinnedArtifacts);
							return (
								<TableRow key={row.key}>
									<TableCell className="w-[38%] align-top font-medium whitespace-normal">
										{row.label}
									</TableCell>
									<TableCell className="align-top whitespace-normal">
										{preview ? (
											<span className="text-foreground">{preview}</span>
										) : (
											<span className="text-muted-foreground">
												Not pinned yet — {row.fieldHint}
											</span>
										)}
									</TableCell>
								</TableRow>
							);
						})}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
