"use client";

import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

import { BUILD_SLICES_EXAMPLE_PROMPT } from "./build-setting-up-slices-constants";

async function writeClipboard(text: string) {
	try {
		await navigator.clipboard.writeText(text);
		toast.success("Example prompt copied");
	} catch {
		toast.error("Could not copy—try selecting the text manually");
	}
}

export function BuildSettingUpSlicesExamplePromptCard() {
	return (
		<Card>
			<CardHeader className="space-y-2 pb-3">
				<div className="flex flex-wrap items-center gap-2">
					<CardTitle className="text-base">Example prompt structure</CardTitle>
					<Badge variant="outline">Template</Badge>
				</div>
				<CardDescription>
					Problem, current belief, uncertainty, and a supporting link—then adapt
					the labels to your situation.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				<Textarea
					readOnly
					className="min-h-[180px] resize-y font-mono text-xs leading-relaxed"
					value={BUILD_SLICES_EXAMPLE_PROMPT}
					aria-label="Example planning prompt"
				/>
				<Button
					type="button"
					variant="secondary"
					size="sm"
					onClick={() => void writeClipboard(BUILD_SLICES_EXAMPLE_PROMPT)}
				>
					Copy example prompt
				</Button>
			</CardContent>
		</Card>
	);
}
