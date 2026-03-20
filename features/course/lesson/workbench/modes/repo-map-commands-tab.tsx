"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { copyCoursePromptToClipboard } from "@/features/course/lesson/lib/copy-course-prompt";

import {
	REPO_CURATED_COMMANDS,
	REPO_DEPLOY_DOC_PATH,
} from "./repo-map-constants";

export function RepoMapCommandsTab() {
	return (
		<div className="space-y-4">
			<p className="text-sm leading-relaxed text-muted-foreground">
				These are the jobs the walkthrough calls out—no full{" "}
				<span className="font-mono text-foreground">package.json</span> dump.
			</p>
			<div className="space-y-3">
				{REPO_CURATED_COMMANDS.map((row, index) =>
					row.kind === "note" ? (
						<Card key={`${row.label}-${index}`} className="gap-0 py-0">
							<CardHeader className="pb-2 pt-3">
								<CardTitle className="text-sm">{row.label}</CardTitle>
								<CardDescription className="text-sm leading-relaxed">
									{row.body}
								</CardDescription>
							</CardHeader>
						</Card>
					) : (
						<Card key={`${row.label}-${index}`} className="gap-0 py-0">
							<CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 border-b border-border/80 pb-3 pt-3">
								<div className="min-w-0 space-y-2">
									<CardTitle className="text-sm">{row.label}</CardTitle>
									<code className="block rounded-md bg-muted px-2 py-1.5 font-mono text-xs text-foreground">
										{row.command}
									</code>
								</div>
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="shrink-0"
									onClick={() =>
										void copyCoursePromptToClipboard(
											row.command,
											"Copied command",
										)
									}
								>
									Copy
								</Button>
							</CardHeader>
						</Card>
					),
				)}
			</div>
			<Card className="gap-0 py-0">
				<CardHeader className="pb-3 pt-3">
					<CardTitle className="text-sm">Push live</CardTitle>
					<CardDescription className="text-sm leading-relaxed">
						Deploy steps live in the course docs—use the same flow as the Ship
						block when you are ready.
					</CardDescription>
				</CardHeader>
				<CardContent className="pb-3">
					<Button variant="secondary" size="sm" asChild>
						<Link href={REPO_DEPLOY_DOC_PATH}>Open deploy guide</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
