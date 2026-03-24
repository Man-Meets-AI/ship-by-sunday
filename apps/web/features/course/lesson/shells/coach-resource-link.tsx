import Link from "next/link";

import {
	Item,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@/components/ui/item";
import type { LessonResourceContent } from "@/features/course/lesson/model/contracts";
import { cn } from "@/lib/utils";

import { coachEyebrowClass } from "./coach-panel-typography";

export function CoachResourceLink({
	resource,
}: {
	resource: Exclude<LessonResourceContent, { kind: "copy_prompt" }>;
}) {
	const isExternal = resource.kind === "external";

	return (
		<Item asChild variant="outline" className="w-full items-stretch">
			<Link
				href={resource.href}
				target={isExternal ? "_blank" : undefined}
				rel={isExternal ? "noopener noreferrer" : undefined}
			>
				<ItemContent className="min-w-0">
					<ItemDescription
						className={cn(coachEyebrowClass, "line-clamp-none")}
					>
						{resource.kind}
					</ItemDescription>
					<ItemTitle className="line-clamp-none whitespace-normal text-base font-semibold leading-snug">
						{resource.label}
					</ItemTitle>
				</ItemContent>
			</Link>
		</Item>
	);
}
