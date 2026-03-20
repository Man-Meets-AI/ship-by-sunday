import { CardDescription, CardFooter } from "@/components/ui/card";

export function LessonVideoMetadata({
	title,
	durationLabel,
	footer,
}: {
	title?: string;
	durationLabel?: string;
	footer?: boolean;
}) {
	if (!title && !durationLabel) return null;

	const description = (
		<CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
			{title ? <span>{title}</span> : null}
			{durationLabel ? <span>{durationLabel}</span> : null}
		</CardDescription>
	);

	if (footer) {
		return (
			<CardFooter className="border-0 bg-transparent px-4 py-1.5">
				{description}
			</CardFooter>
		);
	}

	return description;
}
