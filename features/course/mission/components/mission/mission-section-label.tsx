import type { ReactNode } from "react";

export function MissionSectionLabel({ children }: { children: ReactNode }) {
	return (
		<p className="font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
			{children}
		</p>
	);
}
