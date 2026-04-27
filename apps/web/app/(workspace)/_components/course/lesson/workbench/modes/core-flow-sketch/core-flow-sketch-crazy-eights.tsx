"use client";

import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { copyCoursePromptToClipboard } from "@/lib/course/lesson/lib/copy-course-prompt";

import { CRAZY_EIGHTS_CLIPBOARD_TEMPLATE } from "./core-flow-sketch-copy";

export function CoreFlowSketchCrazyEights() {
	const handlePrint = useCallback(() => {
		window.print();
	}, []);

	const handleCopyOutline = useCallback(() => {
		void copyCoursePromptToClipboard(
			CRAZY_EIGHTS_CLIPBOARD_TEMPLATE,
			"Copied Crazy Eights outline.",
		);
	}, []);

	return (
		<Card className="print:border-0 print:shadow-none">
			<CardHeader className="pb-2">
				<CardTitle className="text-base">Crazy Eights template</CardTitle>
				<CardDescription>
					Eight quick boxes—fat marker, no polish. Print or sketch on paper.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex flex-wrap gap-2 print:hidden">
					<Button type="button" variant="secondary" onClick={handlePrint}>
						Print template
					</Button>
					<Button type="button" variant="outline" onClick={handleCopyOutline}>
						Copy outline
					</Button>
				</div>
				<div
					className="grid grid-cols-2 gap-2 sm:grid-cols-4"
					aria-label="Crazy Eights eight-box grid"
				>
					{Array.from({ length: 8 }, (_, i) => (
						<Card
							key={i}
							className="flex aspect-square min-h-[72px] flex-col border-dashed bg-muted/20 py-0 print:border-foreground/30 print:bg-white"
						>
							<CardContent className="flex flex-1 items-start p-2 text-xs text-muted-foreground">
								<span className="font-medium tabular-nums">{i + 1}</span>
							</CardContent>
						</Card>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
