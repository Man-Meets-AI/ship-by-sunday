import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import type { LessonResourceContent } from "@/features/course/lesson/model/contracts";

export const coachEyebrowClass =
	"font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground";

export function CoachResourceLink({
	resource,
}: {
	resource: Exclude<LessonResourceContent, { kind: "copy_prompt" }>;
}) {
	return (
		<Button
			asChild
			variant="outline"
			className="h-auto min-h-0 w-full flex-col items-stretch justify-start gap-0 px-4 py-4 text-left font-normal whitespace-normal"
		>
			<Link
				href={resource.href}
				target={resource.kind === "external" ? "_blank" : undefined}
			>
				<CardTitle className={coachEyebrowClass}>{resource.kind}</CardTitle>
				<p className="mt-2 text-[14px] font-semibold leading-[1.45] text-foreground">
					{resource.label}
				</p>
			</Link>
		</Button>
	);
}
