"use client";

import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { copyLessonTextToClipboard } from "@/lib/course/lesson/lib/copy-course-prompt";

type BuildSetupLaunchpadCommandsBlockProps = {
	commandsText: string;
};

export function BuildSetupLaunchpadCommandsBlock({
	commandsText,
}: BuildSetupLaunchpadCommandsBlockProps) {
	const [copied, setCopied] = useState(false);

	const copy = useCallback(async () => {
		const result = await copyLessonTextToClipboard(
			commandsText,
			"Commands copied—paste into your terminal.",
		);
		if (result === "copied") {
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} else {
			setCopied(false);
		}
	}, [commandsText]);

	return (
		<Card>
			<CardHeader className="space-y-1">
				<CardTitle className="text-base">
					Commands (from the walkthrough)
				</CardTitle>
				<CardDescription>
					Copy these into your terminal; swap{" "}
					<code className="text-foreground">YOUR_FOLDER</code> for the product
					folder name above.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				<Textarea
					readOnly
					rows={14}
					className="font-mono text-xs leading-relaxed"
					value={commandsText}
				/>
				<Button type="button" variant="secondary" size="sm" onClick={copy}>
					{copied ? "Copied" : "Copy commands"}
				</Button>
			</CardContent>
		</Card>
	);
}
