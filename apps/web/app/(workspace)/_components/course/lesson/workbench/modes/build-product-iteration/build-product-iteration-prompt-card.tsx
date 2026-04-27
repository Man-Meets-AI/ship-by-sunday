"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { timingConfig } from "@/config/product";
import { copyCoursePromptToClipboard } from "@/lib/course/lesson/lib/copy-course-prompt";

import { BUILD_PRODUCT_ITERATION_CHATGPT_PROMPT } from "@/lib/course/lesson/workbench/modes/build-product-iteration/build-product-iteration-constants";

export function BuildProductIterationPromptCard() {
	const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
		"idle",
	);
	const resetRef = useRef<number | null>(null);

	useEffect(() => {
		return () => {
			if (resetRef.current !== null) {
				window.clearTimeout(resetRef.current);
			}
		};
	}, []);

	const copyPrompt = () => {
		void copyCoursePromptToClipboard(
			BUILD_PRODUCT_ITERATION_CHATGPT_PROMPT,
			"Copied prompt — paste into ChatGPT.",
		).then((result) => {
			if (resetRef.current !== null) {
				window.clearTimeout(resetRef.current);
			}
			if (result === "copied") {
				setCopyState("copied");
				resetRef.current = window.setTimeout(() => {
					resetRef.current = null;
					setCopyState("idle");
				}, timingConfig.promptCopyResetMs);
			} else {
				setCopyState("error");
			}
		});
	};

	return (
		<Card>
			<CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
				<div className="space-y-1">
					<CardTitle className="text-base">Prompt for ChatGPT</CardTitle>
					<CardDescription>
						Copy and paste this block into ChatGPT, then save the structured
						sections below.
					</CardDescription>
				</div>
				<Button
					type="button"
					size="sm"
					variant="secondary"
					onClick={copyPrompt}
				>
					{copyState === "copied"
						? "Copied"
						: copyState === "error"
							? "Retry copy"
							: "Copy prompt"}
				</Button>
			</CardHeader>
			<CardContent>
				<CodeBlock
					language="markdown"
					filename="build-product-iteration-prompt.md"
					code={BUILD_PRODUCT_ITERATION_CHATGPT_PROMPT}
					copyable={false}
					wrapLongLines
					contentClassName="max-h-48"
				/>
			</CardContent>
		</Card>
	);
}
