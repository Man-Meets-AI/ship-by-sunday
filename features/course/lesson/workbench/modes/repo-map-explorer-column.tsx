import { cn } from "@/lib/utils";

import type { RepoMapEntry } from "./repo-map-constants";

export function RepoMapExplorerColumn({
	entries,
	activeId,
}: {
	entries: RepoMapEntry[];
	activeId: string;
}) {
	return (
		<div
			className="rounded-lg border border-border bg-muted/20 px-2 py-3 font-mono text-[11px] leading-relaxed text-muted-foreground"
			aria-hidden
		>
			<div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
				Explorer
			</div>
			<ul className="space-y-0.5">
				{entries.map((entry) => (
					<li
						key={entry.id}
						className={cn(
							"truncate rounded px-1.5 py-0.5",
							activeId === entry.id
								? "bg-primary/15 font-medium text-foreground"
								: "text-muted-foreground",
						)}
					>
						{entry.path}
					</li>
				))}
			</ul>
		</div>
	);
}
