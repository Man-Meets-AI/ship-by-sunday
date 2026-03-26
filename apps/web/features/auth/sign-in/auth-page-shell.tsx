import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import {
	AuthPageSupportPanel,
	type AuthPageSupportPanelContent,
} from "@/features/auth/sign-in/auth-page-support-panel";

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
		<section className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] border border-border/70 bg-card/95 shadow-[0_32px_90px_-48px_rgba(0,0,0,0.55)]">
			<div
				aria-hidden
				className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent"
			/>
			<div
				aria-hidden
				className="absolute -left-12 top-0 h-44 w-44 rounded-full bg-primary/5 blur-3xl"
			/>
			<div
				aria-hidden
				className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-muted blur-3xl"
			/>
			<div
				className={cn(
					"relative grid",
					supportPanel
						? "lg:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)]"
						: "grid-cols-1",
				)}
			>
				<div className="flex min-w-0 flex-col gap-8 p-6 sm:p-8 lg:p-10">
					<div className="max-w-xl space-y-3">
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
