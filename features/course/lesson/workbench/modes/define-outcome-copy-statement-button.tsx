"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { timingConfig } from "@/config/product";
import { copyLessonTextToClipboard } from "@/features/course/lesson/lib/copy-course-prompt";

export function DefineOutcomeCopyStatementButton({
	statement,
}: {
	statement: string;
}) {
	const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
		"idle",
	);
	const resetTimeoutRef = useRef<number | null>(null);

	useEffect(() => {
		return () => {
			if (resetTimeoutRef.current !== null) {
				window.clearTimeout(resetTimeoutRef.current);
			}
		};
	}, []);

	useEffect(() => {
		setCopyState("idle");
	}, [statement]);

	const trimmed = statement.trim();
	const disabled = trimmed.length === 0;

	const handleCopy = () => {
		if (disabled) {
			return;
		}

		void copyLessonTextToClipboard(trimmed, "Statement copied.").then((result) => {
			if (result === "copied") {
				if (resetTimeoutRef.current !== null) {
					window.clearTimeout(resetTimeoutRef.current);
				}

				setCopyState("copied");
				resetTimeoutRef.current = window.setTimeout(() => {
					resetTimeoutRef.current = null;
					setCopyState("idle");
				}, timingConfig.promptCopyResetMs);
			} else {
				setCopyState("error");
			}
		});
	};

	const label =
		copyState === "copied"
			? "Copied"
			: copyState === "error"
				? "Copy failed"
				: "Copy statement";

	return (
		<Button
			type="button"
			variant="outline"
			size="sm"
			disabled={disabled && copyState === "idle"}
			onClick={handleCopy}
		>
			{label}
		</Button>
	);
}
