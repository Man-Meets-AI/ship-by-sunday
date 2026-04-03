"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { copyCoursePromptToClipboard } from "@/features/course/lesson/lib/copy-course-prompt";

import {
	REPO_CURATED_COMMANDS,
	REPO_DEPLOY_DOC_PATH,
} from "./repo-map-constants";

export function RepoMapCommandsTab() {
	return (
		<div className="space-y-4">
			<p className="text-sm leading-relaxed text-muted-foreground">
				These are the jobs the walkthrough calls out—no full manifest dump.
			</p>
			<div className="space-y-3">
				{REPO_CURATED_COMMANDS.map((row, index) =>
					row.kind === "note" ? (
						<Card key={`${row.label}-${index}`}>
							<CardHeader>
								<CardTitle className="text-sm">{row.label}</CardTitle>
								<CardDescription className="text-sm leading-relaxed">
									{row.body}
								</CardDescription>
							</CardHeader>
						</Card>
					) : (
						<Card key={`${row.label}-${index}`}>
							<CardHeader className="items-start text-left">
								<CardAction>
									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={() =>
											void copyCoursePromptToClipboard(
												row.command,
												"Copied command",
											)
										}
									>
										Copy
									</Button>
								</CardAction>
								<CardTitle className="text-sm">{row.label}</CardTitle>
							</CardHeader>
							<CardContent>
								<CodeBlock
									language="bash"
									filename={`${row.label}.sh`}
									code={row.command}
									copyable={false}
								/>
							</CardContent>
						</Card>
					),
				)}
			</div>
			<Card>
				<CardHeader>
					<CardTitle className="text-sm">Push live</CardTitle>
					<CardDescription className="text-sm leading-relaxed">
						Deploy steps live in the course docs—use the same flow as the Ship
						block when you are ready.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button variant="secondary" size="sm" asChild>
						<Link href={REPO_DEPLOY_DOC_PATH}>Open deploy guide</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
