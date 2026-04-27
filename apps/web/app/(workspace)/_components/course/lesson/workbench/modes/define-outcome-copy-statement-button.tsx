"use client";

import { Button } from "@/components/ui/button";
import { copyLessonTextToClipboard } from "@/lib/course/lesson/lib/copy-course-prompt";
import { toast } from "sonner";

export function DefineOutcomeCopyStatementButton({
	statement,
}: {
	statement: string;
}) {
	const trimmed = statement.trim();
	const disabled = trimmed.length === 0;

	const handleCopy = () => {
		if (disabled) {
			return;
		}

		void copyLessonTextToClipboard(trimmed, "Statement copied.").then(
			(result) => {
				if (result !== "copied") {
					toast.error("Could not copy to clipboard.");
				}
			},
		);
	};

	return (
		<Button
			type="button"
			variant="outline"
			size="sm"
			disabled={disabled}
			onClick={handleCopy}
		>
			Copy statement
		</Button>
	);
}
