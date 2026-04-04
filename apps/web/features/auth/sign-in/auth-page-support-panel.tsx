import Link from "next/link";

import { Button } from "@/components/ui/button";

export type AuthPageSupportPanelAction = {
	href: string;
	label: string;
};

export type AuthPageSupportPanelContent = {
	action?: AuthPageSupportPanelAction;
	bullets: readonly string[];
	description: string;
	title: string;
};

export function AuthPageSupportPanel({
	content,
}: {
	content: AuthPageSupportPanelContent;
}) {
	return (
		<aside className="relative flex min-w-0 flex-col gap-5 border-t border-border/70 py-6 sm:py-8 lg:border-l lg:border-t-0 lg:pl-12 lg:py-10">
			<div className="space-y-2">
				<h2 className="max-w-sm text-balance text-lg font-semibold tracking-tight sm:text-xl">
					{content.title}
				</h2>
				<p className="max-w-sm text-sm leading-6 text-muted-foreground">
					{content.description}
				</p>
			</div>
			{content.bullets.length > 0 ? (
				<ul className="grid gap-2.5" aria-label="Sign-in guidance">
					{content.bullets.map((bullet) => (
						<li key={bullet} className="flex items-start gap-2.5">
							<span
								aria-hidden
								className="mt-1.5 size-1.5 shrink-0 rounded-full bg-foreground/50"
							/>
							<span className="text-sm leading-6 text-foreground/75">
								{bullet}
							</span>
						</li>
					))}
				</ul>
			) : null}
			{content.action ? (
				<div className="mt-auto pt-3">
					<Button asChild variant="outline" size="sm">
						<Link href={content.action.href}>{content.action.label}</Link>
					</Button>
				</div>
			) : null}
		</aside>
	);
}
