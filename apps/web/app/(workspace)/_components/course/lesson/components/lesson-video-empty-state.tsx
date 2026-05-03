import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty";

const EMPTY_EYEBROW_CLASS =
	"font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/80";

export function LessonVideoEmptyState({
	eyebrow,
	title,
	body,
	variant,
}: {
	eyebrow: string;
	title: string | undefined;
	body: string;
	variant: "panel" | "watch-shell";
}) {
	if (variant === "watch-shell") {
		return (
			<Empty className="aspect-video min-h-[320px] border-border/60 bg-muted/30 px-6 py-8">
				<EmptyHeader className="max-w-md gap-3">
					<EmptyTitle className={EMPTY_EYEBROW_CLASS}>{eyebrow}</EmptyTitle>
					{title ? (
						<EmptyTitle className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
							{title}
						</EmptyTitle>
					) : null}
					<EmptyDescription>{body}</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}

	return (
		<Empty className="aspect-video border-border/60 bg-muted/30 px-4 py-6">
			<EmptyHeader className="max-w-sm gap-2">
				<EmptyTitle className={EMPTY_EYEBROW_CLASS}>{eyebrow}</EmptyTitle>
				{title ? (
					<EmptyTitle className="text-lg font-semibold tracking-tight text-foreground">
						{title}
					</EmptyTitle>
				) : null}
				<EmptyDescription>{body}</EmptyDescription>
			</EmptyHeader>
		</Empty>
	);
}
