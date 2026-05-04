import type { CSSProperties, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function CodebaseDemoDesignBrowserChrome({
	addressLabel,
	accentColorLight,
	accentColorDark,
	children,
	className,
}: {
	readonly addressLabel: string;
	readonly accentColorLight: string;
	readonly accentColorDark: string;
	readonly children: ReactNode;
	readonly className?: string;
}) {
	const accentStyle = {
		"--bp-design-accent-light": accentColorLight,
		"--bp-design-accent-dark": accentColorDark,
	} as CSSProperties;

	return (
		<div
			className={cn(
				"overflow-hidden rounded-xl border border-border/60 bg-background",
				className,
			)}
			style={accentStyle}
		>
			<div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-3 py-2">
				<div className="flex items-center gap-1.5" aria-hidden="true">
					<span className="size-2.5 rounded-full bg-foreground/20" />
					<span className="size-2.5 rounded-full bg-foreground/20" />
					<span className="size-2.5 rounded-full bg-foreground/20" />
				</div>
				<div className="flex min-w-0 flex-1 items-center justify-center">
					<span className="inline-flex max-w-full items-center gap-1.5 truncate rounded-md border border-border/60 bg-background/80 px-2 py-0.5 text-[0.65rem] text-muted-foreground">
						<span
							className="size-1.5 shrink-0 rounded-full bg-[var(--bp-design-accent-light)] dark:bg-[var(--bp-design-accent-dark)]"
							aria-hidden="true"
						/>
						<span className="truncate">{addressLabel}</span>
					</span>
				</div>
				<span className="size-2.5" aria-hidden="true" />
			</div>
			<div
				aria-hidden="true"
				className="h-1.5 w-full bg-[var(--bp-design-accent-light)] dark:bg-[var(--bp-design-accent-dark)]"
			/>
			{children}
		</div>
	);
}
