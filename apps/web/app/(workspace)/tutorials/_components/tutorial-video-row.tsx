import { ArrowRight, Clock3, PlayCircle } from "lucide-react";
import Link from "next/link";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@/components/ui/item";

import type { TutorialVideoLesson } from "../_lib/tutorial-video-library";

function TutorialVideoThumbnail({ lesson }: { lesson: TutorialVideoLesson }) {
	return (
		<div className="w-28 shrink-0 sm:w-36">
			<AspectRatio
				ratio={16 / 9}
				className="relative overflow-hidden rounded-md border border-border/60 bg-muted"
			>
				{lesson.thumbnailUrl ? (
					<img
						src={lesson.thumbnailUrl}
						alt=""
						loading="lazy"
						className="h-full w-full object-cover transition-transform duration-150 group-hover/item:scale-[1.02]"
					/>
				) : (
					<div className="h-full w-full bg-muted" />
				)}
				<div className="absolute inset-0 flex items-center justify-center bg-foreground/[0.03]">
					<span className="flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm ring-1 ring-foreground/10">
						<PlayCircle className="size-4" aria-hidden />
					</span>
				</div>
			</AspectRatio>
		</div>
	);
}

export function TutorialVideoRow({ lesson }: { lesson: TutorialVideoLesson }) {
	return (
		<Item
			asChild
			variant="outline"
			className="items-start gap-4 rounded-lg p-3 hover:bg-muted/40 sm:p-4"
		>
			<Link href={lesson.href}>
				<TutorialVideoThumbnail lesson={lesson} />
				<ItemContent className="min-w-0 gap-2">
					<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
						<span className="font-mono font-semibold text-foreground/70">
							{lesson.displayLabel}
						</span>
						{lesson.durationLabel ? (
							<span className="inline-flex items-center gap-1">
								<Clock3 className="size-3" aria-hidden />
								{lesson.durationLabel}
							</span>
						) : null}
					</div>
					<ItemTitle className="line-clamp-none w-full text-base">
						{lesson.title}
					</ItemTitle>
					<ItemDescription className="line-clamp-2 max-w-[68ch]">
						{lesson.description}
					</ItemDescription>
				</ItemContent>
				<ItemActions className="ml-auto hidden shrink-0 self-center text-sm font-medium text-foreground md:flex">
					Watch
					<ArrowRight className="size-4" aria-hidden />
				</ItemActions>
			</Link>
		</Item>
	);
}
