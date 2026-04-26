import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import {
	AuthPageSupportPanel,
	type AuthPageSupportPanelContent,
} from "./auth-page-support-panel";

type AuthPageShellProps = {
	children: ReactNode;
	description?: ReactNode;
	supportPanel?: AuthPageSupportPanelContent;
	title: string;
};

export function AuthPageShell({
	children,
	description,
	supportPanel,
	title,
}: AuthPageShellProps) {
	return (
		<section className="relative w-full max-w-6xl">
			<div
				className={cn(
					"grid",
					supportPanel
						? "lg:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.92fr)] lg:items-start"
						: "grid-cols-1",
				)}
			>
				<div className="flex min-w-0 flex-col gap-8 py-6 sm:py-8 lg:py-10 lg:pr-12">
					<div className="max-w-xl space-y-4">
						<h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
							{title}
						</h1>
						{description ? (
							<p className="max-w-2xl text-base leading-7 text-muted-foreground">
								{description}
							</p>
						) : null}
					</div>
					<div className="max-w-xl">{children}</div>
				</div>
				{supportPanel ? <AuthPageSupportPanel content={supportPanel} /> : null}
			</div>
		</section>
	);
}
