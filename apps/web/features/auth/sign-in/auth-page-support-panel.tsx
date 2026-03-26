import Link from "next/link";

export type AuthPageSupportPanelAction = {
	href: string;
	label: string;
};

export type AuthPageSupportPanelContent = {
	action?: AuthPageSupportPanelAction;
	bullets: readonly string[];
	description: string;
	eyebrow: string;
	note?: string;
	title: string;
};

const actionClassName =
	"inline-flex h-9 w-fit items-center rounded-full border border-border/70 bg-background/90 px-4 text-sm font-medium text-foreground/80 shadow-sm transition-colors hover:border-foreground/20 hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export function AuthPageSupportPanel({
	content,
}: {
	content: AuthPageSupportPanelContent;
}) {
	return (
		<aside className="relative flex min-w-0 flex-col gap-6 border-t border-border/70 bg-muted/35 p-6 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
			<div className="space-y-3">
				<p className="text-[11px] font-semibold tracking-[0.28em] text-muted-foreground uppercase">
					{content.eyebrow}
				</p>
				<h2 className="max-w-sm text-balance text-xl font-semibold tracking-tight sm:text-2xl">
					{content.title}
				</h2>
				<p className="max-w-sm text-sm leading-6 text-muted-foreground">
					{content.description}
				</p>
			</div>
			<ul className="grid gap-3" aria-label="Sign-in guidance">
				{content.bullets.map((bullet) => (
					<li key={bullet} className="flex items-start gap-3">
						<span
							aria-hidden
							className="mt-2 size-2 shrink-0 rounded-full bg-foreground/65"
						/>
						<span className="text-sm leading-6 text-foreground/85">
							{bullet}
						</span>
					</li>
				))}
			</ul>
			{content.note || content.action ? (
				<div className="mt-auto flex flex-col gap-3 border-t border-border/70 pt-5">
					{content.note ? (
						<p className="text-sm leading-6 text-muted-foreground">
							{content.note}
						</p>
					) : null}
					{content.action ? (
						<Link href={content.action.href} className={actionClassName}>
							{content.action.label}
						</Link>
					) : null}
				</div>
			) : null}
		</aside>
	);
}
